const axios = require('axios');
const { fetchPageHtml } = require('../utils/fetcher');
const animeWorldScraper = require('../scrapers/animeWorldScraper');
const config = require('../config');

const { getSpotlightList, DEFAULT_SPOTLIGHT } = require('../data/defaultData');

class ScraperService {
  constructor() {
    this.homeCache = null;
    this.homeCacheTimestamp = 0;
    this.animeInfoCache = new Map();
    this.episodeCache = new Map();
    this.streamCache = new Map();
    this.movieCache = new Map();
    this.listingCache = new Map();
    this.CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache
  }

  /**
   * Fetch raw HTML of any target URL
   */
  async extractRaw(targetUrl, options = {}) {
    return await fetchPageHtml(targetUrl, options);
  }

  /**
   * Fetch and parse AnimeWorld India homepage into all sections with default spotlight banners
   */
  async getHomePageData(options = {}) {
    const now = Date.now();
    if (!options.forceRefresh && this.homeCache && (now - this.homeCacheTimestamp < this.CACHE_TTL)) {
      return {
        success: true,
        cached: true,
        targetUrl: config.animeWorldIndiaUrl,
        data: this.homeCache
      };
    }

    const targetUrl = config.animeWorldIndiaUrl;
    const fetchResult = await fetchPageHtml(targetUrl);

    if (!fetchResult.success || !fetchResult.html) {
      if (this.homeCache) {
        return {
          success: true,
          cached: true,
          fallback: true,
          targetUrl,
          data: this.homeCache
        };
      }
      // Graceful fallback with default spotlight
      const fallbackData = {
        spotlight: DEFAULT_SPOTLIGHT,
        franchise: [],
        "newest-drops": [],
        network: [],
        languages: [],
        "most-popular": [],
        airing: [],
        cartoons: [],
        "most-popular-movies": [],
        "latest-anime-movies": [],
        "latest-cartoon-movies": []
      };
      return {
        success: true,
        cached: false,
        fallback: true,
        targetUrl,
        data: fallbackData
      };
    }

    const parsedData = animeWorldScraper.parseHomePage(fetchResult.html, targetUrl);

    // Spotlight with banners (strictly in spotlight only)
    const spotlight = getSpotlightList(parsedData['most-popular']);

    const finalData = {
      spotlight,
      ...parsedData
    };

    this.homeCache = finalData;
    this.homeCacheTimestamp = now;

    return {
      success: true,
      cached: false,
      targetUrl,
      elapsedMs: fetchResult.elapsedMs,
      data: finalData
    };
  }

  /**
   * Fetch full anime information, metadata, seasons and all episodes by ID
   * Example ID: "series/arifureta-from-commonplace-to-worlds-strongest"
   */
  async getAnimeInfo(rawId, options = {}) {
    if (!rawId) {
      throw new Error('Anime ID is required (e.g. series/arifureta-from-commonplace-to-worlds-strongest)');
    }

    // Clean leading/trailing slashes
    let cleanId = rawId.trim().replace(/^\/+|\/+$/g, '');

    // Check memory cache
    const now = Date.now();
    const cachedItem = this.animeInfoCache.get(cleanId);
    if (!options.forceRefresh && cachedItem && (now - cachedItem.timestamp < this.CACHE_TTL)) {
      return {
        success: true,
        cached: true,
        id: cleanId,
        data: cachedItem.data
      };
    }

    // Form full target URL
    const targetUrl = `${config.animeWorldIndiaUrl.replace(/\/$/, '')}/${cleanId}/`;
    const fetchResult = await fetchPageHtml(targetUrl);

    if (!fetchResult.success || !fetchResult.html) {
      throw new Error(`Failed to fetch anime page at ${targetUrl}: ${fetchResult.error || fetchResult.statusText}`);
    }

    // Ajax helper for fetching other seasons
    const fetchSeasonAjax = async (seasonNum, postId) => {
      const ajaxEndpoint = `${config.animeWorldIndiaUrl.replace(/\/+$/, '')}/wp-admin/admin-ajax.php`;
      const ajaxRes = await axios.get(ajaxEndpoint, {
        params: {
          action: 'action_select_season',
          season: seasonNum,
          post: postId
        },
        headers: {
          'User-Agent': config.defaultUserAgent,
          'Referer': targetUrl
        },
        timeout: 10000
      });
      return ajaxRes.data;
    };

    const animeData = await animeWorldScraper.parseAnimeDetailsWithSeasons(
      fetchResult.html,
      targetUrl,
      fetchSeasonAjax
    );

    // Save to cache
    this.animeInfoCache.set(cleanId, {
      timestamp: now,
      data: animeData
    });

    return {
      success: true,
      cached: false,
      id: cleanId,
      targetUrl,
      elapsedMs: fetchResult.elapsedMs,
      data: animeData
    };
  }

  /**
   * Scrape Anime World India catalog
   */
  async getAnimeWorldCatalog(page = 1) {
    const url = `${config.animeWorldIndiaUrl.replace(/\/$/, '')}/page/${page}/`;
    const res = await fetchPageHtml(url);
    if (!res.success) {
      const fallback = await fetchPageHtml(config.animeWorldIndiaUrl);
      return {
        success: fallback.success,
        data: animeWorldScraper.parseCatalog(fallback.html, config.animeWorldIndiaUrl)
      };
    }
    return {
      success: true,
      data: animeWorldScraper.parseCatalog(res.html, url)
    };
  }

  /**
   * Alias / Helper for details endpoint
   */
  async getAnimeDetails(animeUrl) {
    if (!animeUrl) throw new Error('Anime URL or ID is required');
    let cleanId = animeUrl.replace(config.animeWorldIndiaUrl, '').replace(/^\/+|\/+$/g, '');
    return await this.getAnimeInfo(cleanId);
  }

  /**
   * Extract video players and iframes from an episode page
   */
  async getEpisodePlayers(epUrl) {
    if (!epUrl) throw new Error('Episode URL or path is required');
    let fullUrl = epUrl.startsWith('http')
      ? epUrl
      : `${config.animeWorldIndiaUrl.replace(/\/+$/, '')}/${epUrl.replace(/^\/+/, '')}`;
    if (!fullUrl.endsWith('/')) fullUrl += '/';

    const fetchResult = await fetchPageHtml(fullUrl);
    if (!fetchResult.success || !fetchResult.html) {
      throw new Error(`Failed to fetch episode page at ${fullUrl}: ${fetchResult.error || fetchResult.statusText}`);
    }

    const cheerio = require('cheerio');
    const $ = cheerio.load(fetchResult.html);
    const players = [];
    const seenEmbeds = new Set();

    $('iframe').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !seenEmbeds.has(src)) {
        seenEmbeds.add(src);
        if (src.startsWith('//')) src = `https:${src}`;
        else if (src.startsWith('/')) src = `${config.animeWorldIndiaUrl.replace(/\/+$/, '')}${src}`;

        let name = 'Main Player';
        if (src.includes('zephyrix')) name = 'Zephyrix HD (Recommended)';
        else if (src.includes('dub-player')) name = 'Dub Audio Player';
        else if (src.includes('synthnova')) name = 'Synthnova Player';
        else name = `Server ${players.length + 1}`;

        players.push({
          name,
          embedUrl: src,
          proxyUrl: `/api/v1/animeworldin/player/proxy/url=${src}`
        });
      }
    });

    return {
      success: true,
      url: fullUrl,
      totalPlayers: players.length,
      players
    };
  }

  /**
   * Fetch episode page, extract abyssId, playXID, anime details, running episode, next episode, etc.
   */
  async getEpisodeDetails(rawEpisodeId, options = {}) {
    if (!rawEpisodeId) {
      throw new Error('Episode ID is required (e.g. fullmetal-alchemist-brotherhood-1x1)');
    }

    let cleanId = rawEpisodeId.trim().replace(/^\/+|\/+$/g, '');
    if (!cleanId.startsWith('episode/')) {
      cleanId = `episode/${cleanId}`;
    }

    const now = Date.now();
    const cachedItem = this.episodeCache.get(cleanId);
    if (!options.forceRefresh && cachedItem && (now - cachedItem.timestamp < this.CACHE_TTL)) {
      return {
        success: true,
        cached: true,
        episodeId: cleanId,
        data: cachedItem.data
      };
    }

    const targetUrl = `${config.animeWorldIndiaUrl.replace(/\/+$/, '')}/${cleanId}/`;
    const saltBase = (config.animeSaltUrl || 'https://animesalt.cx/').replace(/\/+$/, '');
    const saltEpisodeUrl = `${saltBase}/${cleanId}`;

    // Fetch AnimeWorld episode page and AnimeSalt raw HTML in parallel
    const [fetchResult, saltResult] = await Promise.all([
      fetchPageHtml(targetUrl),
      fetchPageHtml(saltEpisodeUrl, { timeout: 12000 }).catch(err => ({
        success: false,
        error: err.message,
        html: null
      }))
    ]);

    if (!fetchResult.success || !fetchResult.html) {
      throw new Error(`Failed to fetch episode page at ${targetUrl}: ${fetchResult.error || fetchResult.statusText}`);
    }

    // Extract playXID from AnimeSalt HTML response (find <iframe src="https://ravok.buzz/video/{id}" ...>)
    let playXID = null;
    if (saltResult && saltResult.success && saltResult.html) {
      playXID = animeWorldScraper.extractPlayXId(saltResult.html);
    }

    const episodeData = animeWorldScraper.parseEpisodePage(fetchResult.html, targetUrl, { playXID });

    this.episodeCache.set(cleanId, {
      timestamp: now,
      data: episodeData
    });

    return {
      success: true,
      cached: false,
      episodeId: cleanId,
      targetUrl,
      elapsedMs: fetchResult.elapsedMs,
      data: episodeData
    };
  }

  /**
   * Fetch PlayX direct video streams from Ravok
   */
  async fetchPlayXStream(playXID) {
    if (!playXID) return null;
    const cleanId = String(playXID).trim();
    const url = `https://ravok.buzz/player/index.php?data=${encodeURIComponent(cleanId)}&do=getVideo`;

    const headers = {
      'User-Agent': config.defaultUserAgent,
      'Referer': `https://ravok.buzz/video/${cleanId}`,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01'
    };

    try {
      const response = await axios.post(url, 'hash=', {
        headers,
        timeout: 10000,
        validateStatus: () => true
      });

      let data = response.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return null;
        }
      }

      if (data && (data.videoSource || data.securedLink)) {
        return data;
      }
      return null;
    } catch (err) {
      console.warn(`[fetchPlayXStream] Failed to fetch playx stream for ${cleanId}: ${err.message}`);
      return null;
    }
  }

  /**
   * Fetch streaming servers for Abyss and PlayX
   * Supports both query params { abyssId, playXID } and legacy rawStreamId
   */
  async getStreamServers(params, options = {}) {
    let rawAbyssId = null;
    let rawPlayXId = null;

    if (typeof params === 'object' && params !== null) {
      rawAbyssId = params.abyssId || params.streamId || params.id || null;
      rawPlayXId = params.playXID || params.playxid || params.playXId || null;
    } else {
      rawAbyssId = params;
    }

    const cleanAbyssId = rawAbyssId ? String(rawAbyssId).trim().replace(/[^\d]/g, '') : null;
    const cleanPlayXId = rawPlayXId ? String(rawPlayXId).trim().replace(/[^a-zA-Z0-9_-]/g, '') : null;

    if (!cleanAbyssId && !cleanPlayXId) {
      throw new Error(`Invalid parameters: requires abyssId and/or playXID`);
    }

    const startTime = Date.now();
    const targetUrl = cleanAbyssId
      ? `${config.animeWorldIndiaUrl.replace(/\/+$/, '')}/dub-player/t/${cleanAbyssId}/`
      : `https://ravok.buzz/video/${cleanPlayXId}`;

    const [abyssFetchResult, playXData] = await Promise.all([
      cleanAbyssId
        ? fetchPageHtml(targetUrl, { referer: config.animeWorldIndiaUrl })
        : Promise.resolve(null),
      cleanPlayXId
        ? this.fetchPlayXStream(cleanPlayXId)
        : Promise.resolve(null)
    ]);

    let abyssData = null;
    if (abyssFetchResult && abyssFetchResult.success && abyssFetchResult.html) {
      try {
        abyssData = animeWorldScraper.parseDubPlayerConfig(abyssFetchResult.html, cleanAbyssId);
      } catch (e) {
        console.warn(`[getStreamServers] Failed to parse dub player config: ${e.message}`);
      }
    }

    const servers = [];

    // 1. Abyss Server
    if (abyssData && Array.isArray(abyssData.servers)) {
      servers.push(...abyssData.servers);
    }

    // 2. PlayX Server
    if (playXData) {
      const streamUrl = playXData.videoSource || playXData.securedLink;
      const playXServer = {
        serverName: 'playx',
        server: 'PlayX',
        streamUrl,
        sourceUrl: streamUrl,
        videoSource: streamUrl,
        videoImage: playXData.videoImage || null,
        hls: playXData.hls !== false,
        languages: [
          {
            language: 'multi',
            code: 'multi',
            short: 'MULTI',
            video_id: cleanPlayXId,
            streamUrl,
            sourceUrl: streamUrl,
            videoSource: streamUrl,
            link: streamUrl,
            hls: playXData.hls !== false,
            videoImage: playXData.videoImage || null
          }
        ]
      };
      servers.push(playXServer);
    }

    if (servers.length === 0) {
      throw new Error(`Failed to resolve any streaming servers for abyssId="${cleanAbyssId}" playXID="${cleanPlayXId}"`);
    }

    const title = abyssData?.title || 'Episode Stream';
    const season = abyssData?.season || 1;
    const episode = abyssData?.episode || 1;
    const targetOrigin = abyssData?.targetOrigin || 'https://watchanimeworld.one';
    const defaultSource = abyssData?.defaultSource || (servers[0]?.languages?.[0] ? {
      serverName: servers[0].serverName,
      language: servers[0].languages[0].language,
      video_id: servers[0].languages[0].video_id,
      streamUrl: servers[0].languages[0].streamUrl
    } : null);

    const streamData = {
      streamId: cleanAbyssId || cleanPlayXId,
      abyssId: cleanAbyssId || null,
      playXID: cleanPlayXId || null,
      title,
      season,
      episode,
      targetOrigin,
      servers,
      defaultSource
    };

    const elapsedMs = Date.now() - startTime;

    return {
      success: true,
      cached: false,
      streamId: cleanAbyssId || cleanPlayXId,
      abyssId: cleanAbyssId || null,
      playXID: cleanPlayXId || null,
      targetUrl,
      elapsedMs,
      data: streamData
    };
  }

  /**
   * Fetch movie page and extract details, streamId, multiAudioPlayers, other players
   */
  async getMovieDetails(rawMovieId, options = {}) {
    if (!rawMovieId) {
      throw new Error('Movie ID or URL is required (e.g. movies/your-name or your-name)');
    }

    let cleanId = rawMovieId.trim().replace(/^\/+|\/+$/g, '');
    if (!cleanId.startsWith('movies/')) {
      cleanId = `movies/${cleanId}`;
    }

    const now = Date.now();
    const cachedItem = this.movieCache.get(cleanId);
    if (!options.forceRefresh && cachedItem && (now - cachedItem.timestamp < this.CACHE_TTL)) {
      return {
        success: true,
        cached: true,
        movieId: cleanId,
        data: cachedItem.data
      };
    }

    const targetUrl = `${config.animeWorldIndiaUrl.replace(/\/+$/, '')}/${cleanId}/`;
    const fetchResult = await fetchPageHtml(targetUrl);

    if (!fetchResult.success || !fetchResult.html) {
      throw new Error(`Failed to fetch movie page at ${targetUrl}: ${fetchResult.error || fetchResult.statusText}`);
    }

    const movieData = animeWorldScraper.parseMoviePage(fetchResult.html, targetUrl);

    this.movieCache.set(cleanId, {
      timestamp: now,
      data: movieData
    });

    return {
      success: true,
      cached: false,
      movieId: cleanId,
      targetUrl,
      elapsedMs: fetchResult.elapsedMs,
      data: movieData
    };
  }

  /**
   * Universal listing fetcher with pagination support:
   * Supports /search, /letter/:letter, /network/:id, /language/:id, /franchise/:id, /series, /category/:cat
   */
  async getListing(basePath, requestedPage = 1, queryParams = {}, options = {}) {
    const page = parseInt(requestedPage, 10) || 1;
    const cleanPath = (basePath || '').replace(/^\/+|\/+$/g, '');
    const origin = config.animeWorldIndiaUrl.replace(/\/+$/, '');

    let targetUrl;
    const qKeys = Object.keys(queryParams).filter(k => queryParams[k] !== undefined && queryParams[k] !== '');
    const qStr = qKeys.length > 0 ? '?' + new URLSearchParams(queryParams).toString() : '';

    if (page <= 1) {
      targetUrl = cleanPath ? `${origin}/${cleanPath}/${qStr}` : `${origin}/${qStr}`;
    } else {
      targetUrl = cleanPath ? `${origin}/${cleanPath}/page/${page}/${qStr}` : `${origin}/page/${page}/${qStr}`;
    }

    const cacheKey = targetUrl;
    const now = Date.now();
    const cachedItem = this.listingCache.get(cacheKey);
    if (!options.forceRefresh && cachedItem && (now - cachedItem.timestamp < this.CACHE_TTL)) {
      return {
        success: true,
        cached: true,
        targetUrl,
        ...cachedItem.data
      };
    }

    const fetchResult = await fetchPageHtml(targetUrl);
    if (!fetchResult.success || !fetchResult.html) {
      throw new Error(`Failed to fetch listing from ${targetUrl}: ${fetchResult.error || fetchResult.statusText}`);
    }

    const listingData = animeWorldScraper.parseListingPage(fetchResult.html, targetUrl, page);

    this.listingCache.set(cacheKey, {
      timestamp: now,
      data: listingData
    });

    return {
      success: true,
      cached: false,
      targetUrl,
      elapsedMs: fetchResult.elapsedMs,
      ...listingData
    };
  }

  /**
   * Search suggestions via action_tr_search_suggest
   */
  async getSearchSuggestions(term, customNonce = null) {
    if (!term || typeof term !== 'string' || !term.trim()) {
      return {
        success: true,
        term: '',
        totalResults: 0,
        suggestions: []
      };
    }

    const cleanTerm = term.trim();
    const nonce = customNonce || '2ad2a35c10';
    const ajaxEndpoint = `${config.animeWorldIndiaUrl.replace(/\/+$/, '')}/wp-admin/admin-ajax.php`;

    try {
      const response = await axios.post(
        ajaxEndpoint,
        new URLSearchParams({
          action: 'action_tr_search_suggest',
          nonce,
          term: cleanTerm
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': config.defaultUserAgent,
            'Referer': config.animeWorldIndiaUrl
          },
          timeout: 10000
        }
      );

      const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const suggestions = animeWorldScraper.parseSearchSuggestions(html);

      return {
        success: true,
        term: cleanTerm,
        totalResults: suggestions.length,
        suggestions
      };
    } catch (err) {
      return {
        success: false,
        term: cleanTerm,
        error: err.message,
        suggestions: []
      };
    }
  }
}

module.exports = new ScraperService();
