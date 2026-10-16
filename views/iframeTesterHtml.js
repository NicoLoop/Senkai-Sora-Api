function getIframeTesterHtml({ defaultVideoUrl, defaultReferer, port }) {
  const exampleUrl = defaultVideoUrl || 'https://play.zephyrix.org/video/64c32b8eb5304d80ba093227975ece13';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iframe Player Proxy Dev Tester - Anime Stream Hindi</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090c;
      --card-bg: #121217;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.3);
      --accent-hover: #7c3aed;
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
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-size: 20px;
      box-shadow: 0 4px 20px var(--accent-glow);
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
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    select.text-input {
      flex: 0 0 auto;
      min-width: 220px;
      cursor: pointer;
    }
    .btn {
      background: var(--accent);
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
      background: var(--accent-hover);
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
      background: rgba(139, 92, 246, 0.15);
      border-color: var(--accent);
      color: #fff;
    }
    .mode-toggle {
      display: flex;
      background: #09090c;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 4px;
      gap: 4px;
      width: fit-content;
      margin-bottom: 20px;
    }
    .mode-btn {
      padding: 8px 18px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-btn.active {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 2px 10px var(--accent-glow);
    }
    .mode-btn.warning.active {
      background: #dc2626;
      color: #fff;
    }
    .snippet-box {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }
    .snippet-code {
      color: #c4b5fd;
      word-break: break-all;
    }
    .player-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--card-border);
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    }
    .player-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .status-alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .status-alert.success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }
    .status-alert.danger {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #18181b;
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: none;
      font-size: 13px;
      z-index: 100;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <div class="brand-icon">▶</div>
        <div>
          <h1 class="brand-title">Iframe Player Proxy Dev Tester</h1>
          <p class="brand-subtitle">Bypass CSP frame-ancestors & X-Frame-Options for Zephyrix / Synthnova embeds</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <a href="/dev/extract" class="btn btn-secondary" style="font-size: 12px; padding: 6px 14px;">⚡ Scraper Extractor</a>
        <span class="badge-api">PORT: ${port || 5000}</span>
      </div>
    </header>

    <div class="card">
      <label class="input-label" for="targetUrl">Video Player Embed URL to Proxy</label>
      <div class="input-row">
        <input 
          type="text" 
          id="targetUrl" 
          class="text-input" 
          placeholder="https://play.zephyrix.org/video/..." 
          value="${exampleUrl}" 
        />
        <select id="refererSelect" class="text-input" onchange="updateIframe()">
          <option value="https://watchanimeworld.one/" selected>Referer: watchanimeworld.one (Default)</option>
          <option value="https://watchanimeworld.net/">Referer: watchanimeworld.net</option>
          <option value="https://watchanimeworld.cc/">Referer: watchanimeworld.cc</option>
          <option value="https://play.zephyrix.org/">Referer: play.zephyrix.org</option>
          <option value="https://synthnova.net/">Referer: synthnova.net</option>
        </select>
        <button class="btn" onclick="updateIframe()">
          <span>Load Player</span>
        </button>
      </div>

      <div class="presets">
        <span style="font-size: 12px; color: var(--muted); margin-right: 4px;">Presets:</span>
        <button class="preset-chip" onclick="setPreset('${exampleUrl}')">Zephyrix Video (Prompt Target)</button>
        <button class="preset-chip" onclick="setPreset('https://synthnova.net/e/sample')">Synthnova Embed</button>
        <button class="preset-chip" onclick="setPreset('https://watchanimeworld.one/')">Anime World India</button>
      </div>
    </div>

    <!-- Mode Selector: Proxied vs Direct -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
      <div class="mode-toggle">
        <button id="modeProxied" class="mode-btn active" onclick="setMode('proxied')">
          ✓ Proxied via Backend (CSP Bypassed)
        </button>
        <button id="modeDirect" class="mode-btn" onclick="setMode('direct')">
          ✗ Direct Embed (Demonstrates CSP Error)
        </button>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary" onclick="toggleFullscreen()" style="padding: 8px 14px; font-size: 12px;">⛶ Fullscreen</button>
        <button class="btn btn-secondary" onclick="openInNewTab()" style="padding: 8px 14px; font-size: 12px;">↗ Open in Tab</button>
      </div>
    </div>

    <div id="statusAlert" class="status-alert success">
      <span>🛡️ <strong>Proxy Active:</strong> Stripped <code>content-security-policy (frame-ancestors)</code> and <code>X-Frame-Options</code>, spoofed <code>Referer</code> and injected <code>&lt;base href&gt;</code>.</span>
    </div>

    <!-- Generated Embed Snippet -->
    <div class="snippet-box">
      <div>
        <span style="color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Embed Code for your frontend:</span>
        <code id="snippetCode" class="snippet-code">&lt;iframe src="..." allowfullscreen&gt;&lt;/iframe&gt;</code>
      </div>
      <button class="btn btn-secondary" style="flex-shrink: 0;" onclick="copySnippet()">📋 Copy Snippet</button>
    </div>

    <!-- Live Iframe Player -->
    <div class="player-wrapper" id="playerWrapper">
      <iframe 
        id="playerIframe" 
        class="player-iframe" 
        src=""
        title="Video Player"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  </div>

  <div id="toast" class="toast">Copied to clipboard!</div>

  <script>
    let currentMode = 'proxied';

    function setPreset(url) {
      document.getElementById('targetUrl').value = url;
      updateIframe();
    }

    function setMode(mode) {
      currentMode = mode;
      const proxiedBtn = document.getElementById('modeProxied');
      const directBtn = document.getElementById('modeDirect');
      const alertBox = document.getElementById('statusAlert');

      if (mode === 'proxied') {
        proxiedBtn.className = 'mode-btn active';
        directBtn.className = 'mode-btn';
        alertBox.className = 'status-alert success';
        alertBox.innerHTML = '<span>🛡️ <strong>Proxy Active:</strong> Content Security Policy & X-Frame-Options bypassed. Origin allowed from backend proxy.</span>';
      } else {
        proxiedBtn.className = 'mode-btn';
        directBtn.className = 'mode-btn warning active';
        alertBox.className = 'status-alert danger';
        alertBox.innerHTML = '<span>⚠️ <strong>Direct Mode:</strong> Direct iframe embedding will fail in browser with CSP <em>frame-ancestors</em> violation error, demonstrating why our proxy is needed!</span>';
      }

      updateIframe();
    }

    function getProxyUrl(targetUrl, referer) {
      const origin = window.location.origin;
      // Exactly matches user requested format: /api/v1/animeworldin/player/proxy/url={targetUrl}
      let url = origin + '/api/v1/animeworldin/player/proxy/url=' + targetUrl;
      if (referer && referer !== 'https://watchanimeworld.one/') {
        url += '?referer=' + encodeURIComponent(referer);
      }
      return url;
    }

    function updateIframe() {
      const targetUrl = document.getElementById('targetUrl').value.trim();
      const referer = document.getElementById('refererSelect').value;
      if (!targetUrl) return;

      const iframe = document.getElementById('playerIframe');
      let finalSrc = '';

      if (currentMode === 'proxied') {
        finalSrc = getProxyUrl(targetUrl, referer);
      } else {
        finalSrc = targetUrl;
      }

      iframe.src = finalSrc;

      // Update snippet
      const proxyEmbedUrl = getProxyUrl(targetUrl, referer);
      const snippet = '<iframe\\n  src="' + proxyEmbedUrl + '"\\n  title="Video Player"\\n  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"\\n  allowfullscreen\\n  referrerpolicy="strict-origin-when-cross-origin">\\n</iframe>';
      document.getElementById('snippetCode').textContent = snippet.replace(/\\n/g, ' ');
    }

    function copySnippet() {
      const snippet = document.getElementById('snippetCode').textContent;
      navigator.clipboard.writeText(snippet).then(() => {
        showToast('Iframe embed snippet copied!');
      });
    }

    function toggleFullscreen() {
      const wrapper = document.getElementById('playerWrapper');
      if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    function openInNewTab() {
      const iframe = document.getElementById('playerIframe');
      if (iframe.src) {
        window.open(iframe.src, '_blank');
      }
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    // Initialize on load
    window.addEventListener('DOMContentLoaded', () => {
      updateIframe();
    });
  </script>
</body>
</html>`;
}

module.exports = { getIframeTesterHtml };
