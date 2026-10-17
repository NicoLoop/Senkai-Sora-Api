const axios = require('axios');
const config = require('../config');

/**
 * Service to extract video streams, subtitles, and intro/outro timestamps from ravok.buzz.
 * Purely stateless and serverless compatible: delegates media streaming to the dedicated proxy server.
 */
class RavokPlayerService {
  constructor() {
    this.defaultUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.defaultReferer = 'https://watchanimeworld.one/';
  }

  /**
   * Normalize an input string (either raw video ID or full URL) into a 32-character video ID
   */
  extractVideoId(input) {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();

    // Check if it's already a 32-char hex string
    if (/^[a-fA-F0-9]{32}$/.test(trimmed)) {
      return trimmed;
    }

    // Match /video/:id or ?data=:id or ?id=:id
    const urlMatch = trimmed.match(/(?:video\/|[?&](?:data|id|v)=)([a-fA-F0-9]{32})/i);
    if (urlMatch) {
      return urlMatch[1];
    }

    // Try finding any 32-char hex string in the text
    const anyHex = trimmed.match(/[a-fA-F0-9]{32}/);
    if (anyHex) {
      return anyHex[0];
    }

    return trimmed;
  }

  /**
   * Unpack Dean Edwards packed JavaScript code: eval(function(p,a,c,k,e,d){...}('...', a, c, '...'.split('|')))
   */
  unpackDeanEdwards(p, a, c, k) {
    const e = function (c) {
      return (c < a ? '' : e(parseInt(c / a, 10))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };
    const d = {};
    for (let i = 0; i < c; i++) {
      d[e(i)] = k[i] || e(i);
    }
    return p.replace(/\b\w+\b/g, (token) => (d[token] !== undefined ? d[token] : token));
  }

  /**
   * Decode the hex-escaped base64 key "ck" (e.g. \x59\x6d...)
   */
  decodeCkKey(ckStr) {
    if (!ckStr || typeof ckStr !== 'string') return null;
    try {
      // Replace \\x or \x with % for URI decoding
      const percentEncoded = ckStr.replace(/\\\\x|\\x/g, '%');
      const b64 = decodeURIComponent(percentEncoded);
      const decodedHex = Buffer.from(b64, 'base64').toString('utf8');
      return {
        base64Key: b64,
        hexKey: decodedHex
      };
    } catch (_) {
      return { base64Key: ckStr, hexKey: null };
    }
  }

  /**
   * Parse intro/outro range strings like "0-0" or "85-175" into structured objects
   */
  parseRange(rangeStr) {
    if (!rangeStr || typeof rangeStr !== 'string' || !rangeStr.includes('-')) {
      return { start: 0, end: 0, duration: 0, enabled: false };
    }
    const [s, e] = rangeStr.split('-').map(Number);
    const start = isNaN(s) ? 0 : s;
    const end = isNaN(e) ? 0 : e;
    return {
      start,
      end,
      duration: Math.max(0, end - start),
      enabled: end > start
    };
  }

  /**
   * Comprehensive extractor: fetches ravok page, unpacks JS, queries getVideo API,
   * parses intro/outro skip times, subtitle tracks, and builds proxy URLs pointing to proxy server.
   */
  async extractVideoData(videoIdOrUrl) {
    const videoId = this.extractVideoId(videoIdOrUrl);
    if (!videoId) {
      throw new Error('A valid video ID or video URL is required (e.g. b51a15f382ac914391a58850ab343b00)');
    }

    const pageUrl = `https://ravok.buzz/video/${videoId}`;
    const proxyBase = (config.abyssProxyUrl || 'https://abyss-proxies-production.up.railway.app').replace(/\/$/, '');

    // 1. Fetch HTML page
    const pageResponse = await axios.get(pageUrl, {
      headers: {
        'User-Agent': this.defaultUserAgent,
        'Referer': this.defaultReferer
      },
      timeout: 10000
    });

    const html = pageResponse.data;

    // 2. Extract fallback subtitle variables if present in HTML head
    let playerjsSubtitle = null;
    let playerjsDefaultSubtitle = 'English';
    const subMatch = html.match(/var\s+playerjsSubtitle\s*=\s*["']([^"']+)["']/);
    if (subMatch) playerjsSubtitle = subMatch[1];
    const defSubMatch = html.match(/var\s+playerjsDefaultSubtitle\s*=\s*["']([^"']+)["']/);
    if (defSubMatch) playerjsDefaultSubtitle = defSubMatch[1];

    // 3. Find and unpack the Dean Edwards packer script
    const packerRegex = /}\s*\(\s*'([\s\S]*?)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]*?)'\.split\('\|'\)/;
    const packerMatch = html.match(packerRegex);

    let videoSettings = {};
    if (packerMatch) {
      const [, p, a, c, kStr] = packerMatch;
      const unpacked = this.unpackDeanEdwards(p, parseInt(a, 10), parseInt(c, 10), kStr.split('|'));
      const vplayerMatch = unpacked.match(/VPlayer\s*\(\s*["']([^"']+)["']\s*,\s*(\{[\s\S]*?\})\s*,\s*(?:true|false)/);
      if (vplayerMatch) {
        try {
          videoSettings = JSON.parse(vplayerMatch[2]);
        } catch (e) {
          console.warn('[RavokPlayerService] Failed to JSON.parse videoSettings:', e.message);
        }
      }
    }

    // 4. Query the ravok.buzz getVideo endpoint
    const getVideoUrl = `https://ravok.buzz/player/index.php?data=${videoId}&do=getVideo`;
    let videoData = {};

    try {
      const getVideoRes = await axios.post(
        getVideoUrl,
        new URLSearchParams({ hash: videoId, r: this.defaultReferer }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': this.defaultUserAgent,
            'Referer': pageUrl,
            'Origin': 'https://ravok.buzz'
          },
          timeout: 10000
        }
      );
      videoData = getVideoRes.data || {};
    } catch (err) {
      console.warn('[RavokPlayerService] getVideo API call failed:', err.message);
    }

    // 5. Structure fields, intro, and outro skip timestamps
    const rawFields = videoSettings.fields || { intro: '0-0', outro: '0-0' };
    const intro = this.parseRange(rawFields.intro);
    const outro = this.parseRange(rawFields.outro);

    // 6. Structure tracks (subtitles, thumbnails) pointing to proxy server
    const rawTracks = videoSettings.tracks || [];
    const tracks = [];
    let subtitlesList = [];
    let thumbnailTrack = null;

    rawTracks.forEach((track) => {
      // Clean escaped slashes in file URL
      const cleanFile = (track.file || '').replace(/\\+/g, '');
      if (track.kind === 'captions' || track.kind === 'subtitles') {
        const subItem = {
          kind: 'captions',
          label: track.label || 'English',
          language: track.language || 'eng',
          default: !!track.default,
          originalUrl: cleanFile,
          proxyUrl: `${proxyBase}/player/subtitle/proxy?url=${encodeURIComponent(cleanFile)}`
        };
        tracks.push(subItem);
        subtitlesList.push(subItem);
      } else if (track.kind === 'thumbnails') {
        thumbnailTrack = {
          kind: 'thumbnails',
          originalUrl: cleanFile
        };
        tracks.push(thumbnailTrack);
      }
    });

    // If no subtitle tracks were in videoSettings, check playerjsSubtitle fallback
    if (subtitlesList.length === 0 && playerjsSubtitle) {
      const matchLabel = playerjsSubtitle.match(/\[(.*?)\](.*)/);
      const label = matchLabel ? matchLabel[1] : playerjsDefaultSubtitle;
      const url = matchLabel ? matchLabel[2] : playerjsSubtitle;
      const subItem = {
        kind: 'captions',
        label,
        language: 'eng',
        default: true,
        originalUrl: url,
        proxyUrl: `${proxyBase}/player/subtitle/proxy?url=${encodeURIComponent(url)}`
      };
      tracks.push(subItem);
      subtitlesList.push(subItem);
    }

    // 7. Structure streaming source pointing to dedicated proxy server
    const rawVideoSource = videoData.videoSource || videoData.securedLink || null;
    const isHls = videoData.hls !== false && (rawVideoSource ? (rawVideoSource.includes('.m3u8') || rawVideoSource.includes('/hls/')) : true);

    let streamProxyUrl = null;
    if (rawVideoSource) {
      streamProxyUrl = `${proxyBase}/player/stream/proxy?url=${encodeURIComponent(rawVideoSource)}&videoId=${videoId}`;
    }

    const decodedKey = this.decodeCkKey(videoData.ck || videoSettings.ck);

    return {
      success: true,
      videoId,
      title: videoSettings.title || 'Untitled Stream',
      fields: rawFields,
      intro,
      outro,
      hls: isHls,
      videoSource: rawVideoSource,
      streamProxyUrl,
      videoImage: videoData.videoImage || videoSettings.defaultImage || null,
      tracks,
      subtitles: subtitlesList,
      thumbnails: thumbnailTrack,
      cryptoKey: decodedKey,
      proxyBase,
      rawVideoData: videoData,
      rawVideoSettings: videoSettings
    };
  }
}

module.exports = new RavokPlayerService();
