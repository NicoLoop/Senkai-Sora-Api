function getVideoJsPlayerHtml({ defaultVideoId, port }) {
  const initialId = defaultVideoId || 'b51a15f382ac914391a58850ab343b00';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video.js Player Clone & Stream Analyzer - Anime Stream</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  
  <!-- Video.js 8 CSS & City Theme -->
  <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
  <link href="https://unpkg.com/@videojs/themes@1/dist/city/index.css" rel="stylesheet" />

  <style>
    :root {
      --bg: #09090c;
      --card-bg: #121217;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.3);
      --accent-hover: #7c3aed;
      --cyan: #28c2bd;
      --cyan-glow: rgba(40, 194, 189, 0.35);
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --code-bg: #0d0e12;
      --success: #10b981;
      --error: #ef4444;
      --warning: #f59e0b;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--card-border);
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-size: 20px;
      box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-subtitle {
      font-size: 12px;
      color: var(--muted);
    }
    .badge-api {
      background: rgba(139, 92, 246, 0.12);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #c4b5fd;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .input-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .input-row {
      display: flex;
      gap: 12px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .text-input {
      flex: 1;
      min-width: 280px;
      background: #09090c;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px 16px;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }
    .text-input:focus {
      border-color: var(--cyan);
      box-shadow: 0 0 0 3px var(--cyan-glow);
    }
    .btn {
      background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .btn:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.06);
      border: 1px solid var(--card-border);
      color: var(--text);
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.12);
    }
    .presets {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .preset-chip {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--card-border);
      color: var(--muted);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .preset-chip:hover {
      background: rgba(6, 182, 212, 0.15);
      border-color: var(--cyan);
      color: #fff;
    }
    .toggle-group {
      display: flex;
      gap: 20px;
      margin-top: 14px;
      flex-wrap: wrap;
      align-items: center;
    }
    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--muted);
      cursor: pointer;
    }
    .toggle-label input[type="checkbox"] {
      accent-color: var(--cyan);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    @media (min-width: 1024px) {
      .grid-2 {
        grid-template-columns: 7fr 5fr;
      }
    }
    .player-container {
      position: relative;
      width: 100%;
      background: #000;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    }
    .video-js {
      width: 100% !important;
      height: auto !important;
      aspect-ratio: 16 / 9;
      border-radius: 16px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .skip-btn-overlay {
      position: absolute;
      bottom: 70px;
      right: 24px;
      z-index: 100;
      background: rgba(18, 18, 23, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(40, 194, 189, 0.4);
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: none;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      transition: all 0.2s ease;
      animation: fadeIn 0.25s ease-out;
    }
    .skip-btn-overlay:hover {
      background: var(--cyan);
      color: #000;
      transform: scale(1.04);
      box-shadow: 0 0 20px var(--cyan-glow);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .info-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    .info-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .info-tag strong {
      color: var(--cyan);
    }
    .tabs-header {
      display: flex;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 16px;
      gap: 8px;
    }
    .tab-btn {
      padding: 8px 16px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      color: var(--cyan);
      border-bottom-color: var(--cyan);
    }
    .json-box {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      max-height: 520px;
      overflow-y: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #c4b5fd;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .architecture-box {
      font-size: 13px;
      line-height: 1.6;
      color: #d4d4d8;
    }
    .architecture-box h4 {
      color: #fff;
      margin: 14px 0 6px 0;
      font-size: 14px;
    }
    .architecture-box code {
      background: #18181b;
      padding: 2px 6px;
      border-radius: 4px;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #18181b;
      border: 1px solid var(--cyan);
      color: #fff;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: none;
      font-size: 13px;
      z-index: 1000;
    }
    /* Timeline skip marker custom styling */
    .vjs-intro-marker {
      position: absolute;
      height: 100%;
      background: var(--cyan) !important;
      opacity: 0.85;
      pointer-events: none;
      z-index: 2;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="brand-icon">▶</div>
        <div>
          <h1 class="brand-title">Video.js Player Clone & Stream Analyzer</h1>
          <p class="brand-subtitle">JW Player replacement with HLS Proxy, Multi-Audio, WebVTT Subtitles & Intro/Outro Skip</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <a href="/dev/iframe" class="btn btn-secondary" style="font-size: 12px; padding: 6px 14px;">📺 Iframe Proxy Tester</a>
        <a href="/dev/extract" class="btn btn-secondary" style="font-size: 12px; padding: 6px 14px;">⚡ Scraper Extractor</a>
        <span class="badge-api">PORT: ${port || 5000}</span>
      </div>
    </header>

    <div class="card">
      <label class="input-label" for="videoIdInput">Ravok Video ID or Embed URL</label>
      <div class="input-row">
        <input 
          type="text" 
          id="videoIdInput" 
          class="text-input" 
          placeholder="e.g. b51a15f382ac914391a58850ab343b00 or https://ravok.buzz/video/..." 
          value="${initialId}" 
        />
        <button class="btn" onclick="loadAndPlayVideo()">
          <span>⚡ Extract & Play Video</span>
        </button>
      </div>

      <div class="presets">
        <span style="font-size: 12px; color: var(--muted); margin-right: 4px;">Presets:</span>
        <button class="preset-chip" onclick="setPreset('${initialId}')">Demon Slayer Ep 1 (Prompt Target)</button>
        <button class="preset-chip" onclick="setPreset('https://ravok.buzz/video/${initialId}')">Full Ravok URL</button>
      </div>

      <div class="toggle-group">
        <label class="toggle-label">
          <input type="checkbox" id="autoSkipIntro" />
          <span>⚡ Auto-Skip Intro</span>
        </label>
        <label class="toggle-label">
          <input type="checkbox" id="autoSkipOutro" />
          <span>⚡ Auto-Skip Outro</span>
        </label>
        <label class="toggle-label">
          <input type="checkbox" id="rememberPosition" checked />
          <span>💾 Remember Playback Position</span>
        </label>
      </div>
    </div>

    <!-- Main Grid: Player on Left, JSON & Technical Analysis on Right -->
    <div class="grid-2">
      <!-- Player Column -->
      <div>
        <div class="player-container" id="playerContainer">
          <!-- Video.js element -->
          <video-js 
            id="vjsPlayer" 
            class="video-js vjs-city vjs-big-play-centered vjs-fill" 
            controls 
            preload="auto" 
            playsinline
          ></video-js>

          <!-- Floating Skip Intro / Outro Buttons -->
          <button id="skipIntroBtn" class="skip-btn-overlay" onclick="skipIntro()">
            ⏭ Skip Intro (<span id="introRangeText">0:00</span>)
          </button>
          <button id="skipOutroBtn" class="skip-btn-overlay" onclick="skipOutro()">
            ⏭ Skip Outro (<span id="outroRangeText">0:00</span>)
          </button>
        </div>

        <div class="info-bar" id="infoBar">
          <div class="info-tag" id="titleTag"><strong>Title:</strong> <span id="videoTitleText">Loading...</span></div>
          <div class="info-tag" id="introTag"><strong>Intro:</strong> <span id="introStatusText">None</span></div>
          <div class="info-tag" id="outroTag"><strong>Outro:</strong> <span id="outroStatusText">None</span></div>
          <div class="info-tag" id="streamTag"><strong>Stream:</strong> <span id="streamStatusText">HLS m3u8</span></div>
        </div>
      </div>

      <!-- JSON & Analysis Column -->
      <div class="card" style="margin-bottom: 0;">
        <div class="tabs-header">
          <button id="tabJsonBtn" class="tab-btn active" onclick="switchTab('json')">{ } Extracted JSON Data</button>
          <button id="tabArchBtn" class="tab-btn" onclick="switchTab('arch')">📖 How it Works (Clone Analysis)</button>
        </div>

        <div id="tabJsonContent">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 12px; color: var(--muted);">Live metadata from /api/player/data/:id</span>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="copyJson()">📋 Copy JSON</button>
          </div>
          <div id="jsonViewer" class="json-box">// Press 'Extract & Play Video' to fetch live stream metadata...</div>
        </div>

        <div id="tabArchContent" style="display: none;" class="architecture-box">
          <h4>1. Ravok Player Reverse Engineering:</h4>
          <p>
            When <code>ravok.buzz/video/[videoId]</code> loads, it embeds a Dean Edwards packer script: 
            <code>eval(function(p,a,c,k,e,d){...})</code>. Our backend unpacks this client-side or server-side, 
            exposing the <code>videoSettings</code> object containing the video title, subtitle tracks (stored with disguised <code>.jpg</code> extensions), 
            the <code>ck</code> AES key, and skip intervals in <code>fields: { intro: "start-end", outro: "start-end" }</code>.
          </p>

          <h4>2. Video Source Fetching:</h4>
          <p>
            The player executes a POST to <code>/player/index.php?data=[videoId]&do=getVideo</code> with payload <code>hash=[id]&r=referrer</code>. 
            This returns JSON containing the HLS master playlist URL (<code>videoSource</code>).
          </p>

          <h4>3. Video.js Adaptation (JW Player Replacement):</h4>
          <p>
            Instead of JW Player's proprietary engine, Video.js 8 runs with native HLS playback. 
            Because <code>ravok.buzz</code> omits <code>Access-Control-Allow-Origin</code> headers on manifests, 
            our backend route <code>/api/player/stream/proxy</code> proxies the master playlist and chunk streams with spoofed referer and full CORS headers.
          </p>

          <h4>4. Subtitle Conversion & Intro/Outro Skip:</h4>
          <p>
            The <code>.jpg</code> subtitle file actually contains standard SRT text. Our proxy <code>/api/player/subtitle/proxy</code> transforms it on-the-fly 
            into WebVTT format and mounts it as a native <code>&lt;track&gt;</code>. 
            During playback, a <code>timeupdate</code> listener activates the floating <strong>Skip Intro</strong> and <strong>Skip Outro</strong> overlays when the playhead enters the parsed timestamp range.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div id="toast" class="toast">Copied to clipboard!</div>

  <!-- Video.js 8 CDN JS -->
  <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>

  <script>
    let player = null;
    let currentExtractedData = null;
    let autoSkipIntroState = false;
    let autoSkipOutroState = false;

    function formatSeconds(secs) {
      if (isNaN(secs) || secs === null) return '0:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function initVideoJs() {
      if (!player) {
        player = videojs('vjsPlayer', {
          autoplay: false,
          controls: true,
          fluid: true,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          html5: {
            vhs: {
              overrideNative: true
            }
          }
        });

        // Setup timeupdate hook for intro/outro skip
        player.on('timeupdate', handleTimeUpdate);

        // Position persistence
        player.on('timeupdate', () => {
          if (document.getElementById('rememberPosition').checked && currentExtractedData) {
            localStorage.setItem('vjs_pos_' + currentExtractedData.videoId, player.currentTime());
          }
        });

        // Resume position when loaded
        player.on('loadedmetadata', () => {
          if (document.getElementById('rememberPosition').checked && currentExtractedData) {
            const savedPos = localStorage.getItem('vjs_pos_' + currentExtractedData.videoId);
            if (savedPos && Number(savedPos) > 3) {
              player.currentTime(Number(savedPos));
            }
          }
        });
      }
    }

    function setPreset(val) {
      document.getElementById('videoIdInput').value = val;
      loadAndPlayVideo();
    }

    function switchTab(tab) {
      const jsonBtn = document.getElementById('tabJsonBtn');
      const archBtn = document.getElementById('tabArchBtn');
      const jsonContent = document.getElementById('tabJsonContent');
      const archContent = document.getElementById('tabArchContent');

      if (tab === 'json') {
        jsonBtn.className = 'tab-btn active';
        archBtn.className = 'tab-btn';
        jsonContent.style.display = 'block';
        archContent.style.display = 'none';
      } else {
        jsonBtn.className = 'tab-btn';
        archBtn.className = 'tab-btn active';
        jsonContent.style.display = 'none';
        archContent.style.display = 'block';
      }
    }

    async function loadAndPlayVideo() {
      const input = document.getElementById('videoIdInput').value.trim();
      if (!input) return;

      initVideoJs();
      document.getElementById('jsonViewer').textContent = 'Extracting metadata from ravok.buzz...';
      document.getElementById('videoTitleText').textContent = 'Loading...';

      try {
        const res = await fetch('/api/player/data/' + encodeURIComponent(input));
        if (!res.ok) {
          throw new Error('API returned HTTP ' + res.status);
        }
        const data = await res.json();
        currentExtractedData = data;

        // Render JSON
        document.getElementById('jsonViewer').textContent = JSON.stringify(data, null, 2);

        // Update info bar
        document.getElementById('videoTitleText').textContent = data.title || 'Untitled Stream';
        
        if (data.intro && data.intro.enabled) {
          document.getElementById('introStatusText').textContent = formatSeconds(data.intro.start) + ' - ' + formatSeconds(data.intro.end);
          document.getElementById('introRangeText').textContent = formatSeconds(data.intro.start) + ' - ' + formatSeconds(data.intro.end);
        } else {
          document.getElementById('introStatusText').textContent = 'None';
        }

        if (data.outro && data.outro.enabled) {
          document.getElementById('outroStatusText').textContent = formatSeconds(data.outro.start) + ' - ' + formatSeconds(data.outro.end);
          document.getElementById('outroRangeText').textContent = formatSeconds(data.outro.start) + ' - ' + formatSeconds(data.outro.end);
        } else {
          document.getElementById('outroStatusText').textContent = 'None';
        }

        // Set video source in Video.js
        const streamUrl = data.streamProxyUrl || data.videoSource;
        if (streamUrl) {
          player.src({
            src: streamUrl,
            type: data.hls ? 'application/x-mpegURL' : 'video/mp4'
          });

          // Set poster thumbnail if available
          if (data.videoImage) {
            player.poster(data.videoImage);
          }

          // Clear old text tracks
          const oldTracks = player.remoteTextTracks();
          for (let i = oldTracks.length - 1; i >= 0; i--) {
            player.removeRemoteTextTrack(oldTracks[i]);
          }

          // Add extracted subtitle tracks (routed through WebVTT converter)
          if (data.subtitles && data.subtitles.length > 0) {
            data.subtitles.forEach(sub => {
              player.addRemoteTextTrack({
                kind: 'captions',
                label: sub.label || 'English',
                language: sub.language || 'en',
                src: sub.proxyUrl,
                default: !!sub.default
              }, false);
            });
          }

          player.play().catch(() => {});
        } else {
          alert('No video source could be extracted for ID: ' + data.videoId);
        }
      } catch (err) {
        document.getElementById('jsonViewer').textContent = 'Extraction Error: ' + err.message;
        alert('Failed to extract video: ' + err.message);
      }
    }

    function handleTimeUpdate() {
      if (!currentExtractedData || !player) return;
      const curTime = player.currentTime();
      const autoIntro = document.getElementById('autoSkipIntro').checked;
      const autoOutro = document.getElementById('autoSkipOutro').checked;

      const intro = currentExtractedData.intro;
      const outro = currentExtractedData.outro;

      // Handle Intro Skip
      const introBtn = document.getElementById('skipIntroBtn');
      if (intro && intro.enabled && curTime >= intro.start && curTime < intro.end) {
        if (autoIntro) {
          player.currentTime(intro.end);
          introBtn.style.display = 'none';
        } else {
          introBtn.style.display = 'flex';
        }
      } else {
        introBtn.style.display = 'none';
      }

      // Handle Outro Skip
      const outroBtn = document.getElementById('skipOutroBtn');
      if (outro && outro.enabled && curTime >= outro.start && curTime < outro.end) {
        if (autoOutro) {
          player.currentTime(outro.end);
          outroBtn.style.display = 'none';
        } else {
          outroBtn.style.display = 'flex';
        }
      } else {
        outroBtn.style.display = 'none';
      }
    }

    function skipIntro() {
      if (currentExtractedData && currentExtractedData.intro && player) {
        player.currentTime(currentExtractedData.intro.end);
        document.getElementById('skipIntroBtn').style.display = 'none';
      }
    }

    function skipOutro() {
      if (currentExtractedData && currentExtractedData.outro && player) {
        player.currentTime(currentExtractedData.outro.end);
        document.getElementById('skipOutroBtn').style.display = 'none';
      }
    }

    function copyJson() {
      const text = document.getElementById('jsonViewer').textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('JSON copied to clipboard!');
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    // Auto-load on page load
    window.addEventListener('DOMContentLoaded', () => {
      initVideoJs();
      loadAndPlayVideo();
    });
  </script>
</body>
</html>`;
}

module.exports = { getVideoJsPlayerHtml };
