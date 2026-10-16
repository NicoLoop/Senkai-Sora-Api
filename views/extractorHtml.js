function getExtractorHtml({ animeWorldIndiaUrl, apiKey }) {
  const cleanBase = (animeWorldIndiaUrl || 'https://watchanimeworld.one/').replace(/\/$/, '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anime Stream Hindi - Scraper Dev Extractor</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #121217;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.25);
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
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
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
      margin-bottom: 16px;
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
    .btn:active {
      transform: translateY(0);
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
      margin-top: 10px;
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
    .stats-bar {
      display: flex;
      gap: 16px;
      background: #09090c;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px 18px;
      margin-bottom: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      flex-wrap: wrap;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stat-label {
      color: var(--muted);
    }
    .stat-value {
      font-weight: 600;
    }
    .badge-200 { color: var(--success); }
    .badge-400, .badge-500 { color: var(--error); }
    
    .tabs-header {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--muted);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: rgba(139, 92, 246, 0.15);
      color: #c4b5fd;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .code-box {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #e4e4e7;
      max-height: 550px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-all;
      user-select: text;
    }
    .actions-bar {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
    }
    .preview-frame {
      width: 100%;
      height: 600px;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      background: #fff;
    }
    .selector-box {
      margin-bottom: 16px;
    }
    .selector-results {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
    }
    .selector-match-item {
      padding: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .selector-match-item:last-child {
      border-bottom: none;
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
        <div class="brand-icon">⚡</div>
        <div>
          <h1 class="brand-title">Anime Stream Hindi - Dev Extractor</h1>
          <p class="brand-subtitle">Fast HTML inspector & web scraper dev tool</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <span class="badge-api">PORT: 5000</span>
        <span class="badge-api">KEY: ${apiKey ? apiKey.substring(0, 10) + '...' : 'configured'}</span>
      </div>
    </header>

    <div class="card">
      <label class="input-label" for="urlInput">Target Page URL to Scrape</label>
      <div class="input-row">
        <input 
          type="text" 
          id="urlInput" 
          class="text-input" 
          placeholder="https://watchanimeworld.one/..." 
          value="${animeWorldIndiaUrl || 'https://watchanimeworld.one/'}" 
        />
        <button id="extractBtn" class="btn" onclick="executeExtract()">
          <span>Extract HTML</span>
        </button>
      </div>

      <div class="presets">
        <span style="font-size: 12px; color: var(--muted); margin-right: 4px;">Presets:</span>
        <button class="preset-chip" onclick="setPreset('${animeWorldIndiaUrl || 'https://watchanimeworld.one/'}')">Anime World India Home</button>
        <button class="preset-chip" onclick="setPreset('${cleanBase}/anime/')">Anime Catalog</button>
        <button class="preset-chip" onclick="setPreset('${cleanBase}/trending/')">Trending</button>
        <button class="preset-chip" onclick="setPreset('https://httpbin.org/headers')">Test HTTP Headers</button>
      </div>
    </div>

    <div id="resultsCard" class="card" style="display: none;">
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-label">Status:</span>
          <span id="statStatus" class="stat-value badge-200">200 OK</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Time:</span>
          <span id="statTime" class="stat-value">124 ms</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Size:</span>
          <span id="statSize" class="stat-value">0 KB</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Length:</span>
          <span id="statLength" class="stat-value">0 chars</span>
        </div>
        <div class="stat-item" style="margin-left: auto;">
          <span class="stat-label">API Route:</span>
          <code style="color: #c4b5fd;">POST /api/extract</code>
        </div>
      </div>

      <div class="tabs-header">
        <button class="tab-btn active" onclick="switchTab('rawHtmlTab', this)">Raw HTML</button>
        <button class="tab-btn" onclick="switchTab('selectorTab', this)">CSS / Cheerio Selector Tester</button>
        <button class="tab-btn" onclick="switchTab('previewTab', this)">Safe Preview</button>
        <button class="tab-btn" onclick="switchTab('headersTab', this)">Response Headers</button>
      </div>

      <!-- Raw HTML Tab -->
      <div id="rawHtmlTab" class="tab-content active">
        <div class="actions-bar" style="margin-top: 0; margin-bottom: 12px;">
          <button class="btn btn-secondary" onclick="copyHtml()">📋 Copy HTML</button>
          <button class="btn btn-secondary" onclick="downloadHtml()">💾 Download .html</button>
          <button class="btn btn-secondary" onclick="openRawInNewTab()">↗ Open Raw</button>
        </div>
        <pre id="rawCode" class="code-box">Loading...</pre>
      </div>

      <!-- Cheerio / CSS Selector Tab -->
      <div id="selectorTab" class="tab-content">
        <div class="selector-box">
          <label class="input-label" for="selectorInput">Test CSS Selector (for building Cheerio scraper queries)</label>
          <div class="input-row">
            <input 
              type="text" 
              id="selectorInput" 
              class="text-input" 
              placeholder="e.g. .entry-title, a[href*='anime'], img.poster, div.item" 
              value="a"
              onkeydown="if(event.key==='Enter') testSelector()"
            />
            <button class="btn btn-secondary" onclick="testSelector()">Query Elements</button>
          </div>
          <div class="presets" style="margin-bottom: 12px;">
            <button class="preset-chip" onclick="setSelector('title')">title</button>
            <button class="preset-chip" onclick="setSelector('h1, h2, h3')">headings</button>
            <button class="preset-chip" onclick="setSelector('a[href]')">all links</button>
            <button class="preset-chip" onclick="setSelector('img[src]')">all images</button>
            <button class="preset-chip" onclick="setSelector('article, .post, .item, .anime')">anime cards</button>
          </div>
        </div>
        <div id="selectorCount" style="margin-bottom: 8px; font-size: 13px; color: var(--muted);"></div>
        <div id="selectorResults" class="selector-results">Enter a selector above and click "Query Elements".</div>
      </div>

      <!-- Safe Preview Tab -->
      <div id="previewTab" class="tab-content">
        <iframe id="previewFrame" class="preview-frame" sandbox="allow-same-origin"></iframe>
      </div>

      <!-- Headers Tab -->
      <div id="headersTab" class="tab-content">
        <pre id="headersCode" class="code-box"></pre>
      </div>
    </div>
  </div>

  <div id="toast" class="toast">Copied to clipboard!</div>

  <script>
    let currentHtml = '';
    let currentResponse = null;

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }

    function setPreset(url) {
      document.getElementById('urlInput').value = url;
      executeExtract();
    }

    function switchTab(tabId, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    }

    async function executeExtract() {
      const url = document.getElementById('urlInput').value.trim();
      if (!url) return alert('Please enter a URL');

      const btn = document.getElementById('extractBtn');
      const resultsCard = document.getElementById('resultsCard');
      const rawCode = document.getElementById('rawCode');

      btn.disabled = true;
      btn.innerHTML = '<span>Extracting...</span>';
      resultsCard.style.display = 'block';
      rawCode.textContent = 'Fetching ' + url + ' via backend proxy...';

      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        });

        const data = await res.json();
        currentResponse = data;
        currentHtml = data.html || '';

        // Update stats
        const statStatus = document.getElementById('statStatus');
        statStatus.textContent = data.statusCode + ' ' + (data.statusText || '');
        statStatus.className = 'stat-value ' + (data.statusCode >= 200 && data.statusCode < 400 ? 'badge-200' : 'badge-500');

        document.getElementById('statTime').textContent = (data.elapsedMs || 0) + ' ms';
        const kb = ((data.contentLength || currentHtml.length) / 1024).toFixed(1);
        document.getElementById('statSize').textContent = kb + ' KB';
        document.getElementById('statLength').textContent = currentHtml.length.toLocaleString() + ' chars';

        // Update Raw tab
        rawCode.textContent = currentHtml;

        // Update Headers tab
        document.getElementById('headersCode').textContent = JSON.stringify(data.headers || {}, null, 2);

        // Update Preview tab
        const frame = document.getElementById('previewFrame');
        frame.srcdoc = currentHtml;

        // Auto run selector query
        testSelector();

      } catch (err) {
        rawCode.textContent = 'Error connecting to extractor API: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Extract HTML</span>';
      }
    }

    function copyHtml() {
      if (!currentHtml) return;
      navigator.clipboard.writeText(currentHtml).then(() => {
        showToast('HTML copied to clipboard!');
      });
    }

    function downloadHtml() {
      if (!currentHtml) return;
      const blob = new Blob([currentHtml], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'extracted_' + Date.now() + '.html';
      a.click();
    }

    function openRawInNewTab() {
      const url = document.getElementById('urlInput').value.trim();
      window.open('/api/extract/raw?url=' + encodeURIComponent(url), '_blank');
    }

    function setSelector(sel) {
      document.getElementById('selectorInput').value = sel;
      testSelector();
    }

    function testSelector() {
      if (!currentHtml) return;
      const selector = document.getElementById('selectorInput').value.trim();
      const resultsDiv = document.getElementById('selectorResults');
      const countDiv = document.getElementById('selectorCount');
      if (!selector) {
        resultsDiv.textContent = 'Please enter a CSS selector.';
        return;
      }

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentHtml, 'text/html');
        const elements = doc.querySelectorAll(selector);

        countDiv.textContent = 'Found ' + elements.length + ' matching element(s) for "' + selector + '"';

        if (elements.length === 0) {
          resultsDiv.innerHTML = '<div style="color: var(--muted); padding: 8px;">No elements matched this selector.</div>';
          return;
        }

        let htmlOut = '';
        const maxShow = 50;
        elements.forEach((el, idx) => {
          if (idx >= maxShow) return;
          const tag = el.tagName.toLowerCase();
          const text = (el.innerText || el.textContent || '').trim().substring(0, 150);
          const href = el.getAttribute('href');
          const src = el.getAttribute('src');
          const className = el.className || '';

          htmlOut += '<div class="selector-match-item">';
          htmlOut += '<strong style="color: #a855f7;">[' + (idx + 1) + '] &lt;' + tag + '&gt;</strong>';
          if (className) htmlOut += ' <span style="color: #60a5fa;">.' + className.split(' ').join(' .') + '</span>';
          if (href) htmlOut += '<br/><span style="color: #34d399;">href: ' + escapeHtml(href) + '</span>';
          if (src) htmlOut += '<br/><span style="color: #fbbf24;">src: ' + escapeHtml(src) + '</span>';
          if (text) htmlOut += '<br/><span style="color: #d4d4d8;">text: "' + escapeHtml(text) + '"</span>';
          htmlOut += '</div>';
        });

        if (elements.length > maxShow) {
          htmlOut += '<div style="padding: 8px; color: var(--muted); font-style: italic;">... and ' + (elements.length - maxShow) + ' more elements</div>';
        }

        resultsDiv.innerHTML = htmlOut;
      } catch (e) {
        resultsDiv.innerHTML = '<span style="color: var(--error);">Invalid selector: ' + escapeHtml(e.message) + '</span>';
      }
    }

    function escapeHtml(str) {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  </script>
</body>
</html>`;
}

module.exports = { getExtractorHtml };
