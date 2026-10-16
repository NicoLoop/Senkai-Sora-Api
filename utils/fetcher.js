const axios = require('axios');
const config = require('../config');

const ANIMEWORLD_DOMAINS = [
  'watchanimeworld.one',
  'watchanimeworld.net',
  'watchanimeworld.cc',
  'watchanimeworld.top'
];

/**
 * Checks whether an HTTP response was intercepted or challenged by Cloudflare WAF.
 */
function isCloudflareChallenge(statusCode, html) {
  if (statusCode === 403 || statusCode === 503) {
    if (!html) return true;
    const lower = String(html).toLowerCase();
    return (
      lower.includes('just a moment') ||
      lower.includes('attention required') ||
      lower.includes('cf-mitigated') ||
      lower.includes('challenges.cloudflare.com') ||
      lower.includes('cloudflare ray id')
    );
  }
  return false;
}

/**
 * Builds realistic Chrome 132 desktop browser headers without bot fingerprints,
 * automatically applying the target domain referer.
 */
function getBrowserHeaders(targetUrl, options = {}) {
  let targetOrigin = '';
  try {
    targetOrigin = new URL(targetUrl).origin + '/';
  } catch {
    targetOrigin = targetUrl;
  }

  const referer = options.referer || options.ref || targetOrigin;
  const isSameOrigin = targetOrigin && referer && referer.startsWith(targetOrigin.replace(/\/+$/, ''));

  const headers = {
    'User-Agent': options.userAgent || config.defaultUserAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': isSameOrigin ? 'same-origin' : 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Referer': referer,
    ...(options.headers || {})
  };

  // Crucial: Delete any Origin or iframe destination on GET requests
  delete headers['Origin'];
  delete headers['origin'];
  if (headers['Sec-Fetch-Dest'] === 'iframe') {
    headers['Sec-Fetch-Dest'] = 'document';
  }

  return headers;
}

/**
 * Attempt 1: Direct GET request with clean desktop browser headers
 */
async function fetchDirect(targetUrl, options = {}) {
  const timeout = options.timeout || config.scraperTimeoutMs || 10000;
  const headers = getBrowserHeaders(targetUrl, options);
  const startTime = Date.now();

  try {
    const response = await axios.get(targetUrl, {
      headers,
      timeout,
      maxRedirects: 5,
      validateStatus: () => true,
      responseType: 'text',
      decompress: true
    });

    const elapsedMs = Date.now() - startTime;
    const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const isBlocked = isCloudflareChallenge(response.status, html);

    return {
      success: response.status >= 200 && response.status < 400 && !isBlocked,
      blocked: isBlocked,
      url: targetUrl,
      finalUrl: response.request?.res?.responseUrl || targetUrl,
      statusCode: response.status,
      statusText: response.statusText,
      elapsedMs,
      contentLength: Buffer.byteLength(html || '', 'utf8'),
      contentType: response.headers['content-type'] || 'text/html',
      headers: response.headers,
      html
    };
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    return {
      success: false,
      blocked: false,
      url: targetUrl,
      error: error.message,
      code: error.code || 'FETCH_ERROR',
      elapsedMs,
      statusCode: error.response?.status || 500,
      statusText: error.response?.statusText || 'Fetch Error',
      headers: error.response?.headers || {},
      html: error.response?.data
        ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
        : `<!-- Error fetching URL: ${error.message} -->`
    };
  }
}

/**
 * Attempt 2: Route request through the dedicated Railway Scraping Proxy
 */
async function fetchViaProxy(targetUrl, options = {}) {
  const proxyEndpoint = config.proxyScrapeUrl;
  if (!proxyEndpoint) return null;

  const startTime = Date.now();
  const timeout = options.timeout || 15000;

  let targetOrigin = '';
  try {
    targetOrigin = new URL(targetUrl).origin + '/';
  } catch {
    targetOrigin = targetUrl;
  }

  const referer = options.referer || options.ref || targetOrigin;

  try {
    const res = await axios.get(proxyEndpoint, {
      params: {
        url: targetUrl,
        referer,
        userAgent: options.userAgent || config.defaultUserAgent,
        timeout
      },
      headers: {
        'Accept': 'application/json, text/html;q=0.9',
        'x-api-key': config.apiKey || ''
      },
      timeout,
      validateStatus: () => true
    });

    const elapsedMs = Date.now() - startTime;

    if (res.status >= 200 && res.status < 400 && res.data) {
      if (typeof res.data === 'object' && res.data.html) {
        const isBlocked = isCloudflareChallenge(res.data.statusCode || 200, res.data.html);
        return {
          success: !isBlocked && (res.data.success !== false),
          blocked: isBlocked,
          url: targetUrl,
          finalUrl: res.data.finalUrl || targetUrl,
          statusCode: res.data.statusCode || 200,
          statusText: res.data.statusText || 'OK',
          elapsedMs,
          contentLength: Buffer.byteLength(res.data.html || '', 'utf8'),
          contentType: res.data.contentType || 'text/html',
          headers: res.data.headers || {},
          html: res.data.html,
          viaProxy: true
        };
      } else if (typeof res.data === 'string') {
        const isBlocked = isCloudflareChallenge(res.status, res.data);
        return {
          success: !isBlocked,
          blocked: isBlocked,
          url: targetUrl,
          finalUrl: targetUrl,
          statusCode: res.status,
          statusText: res.statusText,
          elapsedMs,
          contentLength: Buffer.byteLength(res.data, 'utf8'),
          contentType: res.headers['content-type'] || 'text/html',
          headers: res.headers,
          html: res.data,
          viaProxy: true
        };
      }
    }
    return null;
  } catch (err) {
    console.warn(`[Fetcher] Railway proxy scrape failed for ${targetUrl}:`, err.message);
    return null;
  }
}

/**
 * Attempt 3: Direct mirror failover to AnimeSalt (identical catalog without bot challenge)
 */
async function fetchViaAnimeSaltMirror(targetUrl, options = {}) {
  try {
    const parsed = new URL(targetUrl);
    const isTargetAnimeWorld = ANIMEWORLD_DOMAINS.some(d => parsed.hostname.includes(d));
    if (!isTargetAnimeWorld) return null;

    const saltBase = config.animeSaltUrl.replace(/\/+$/, '');
    const altUrl = `${saltBase}${parsed.pathname}${parsed.search}`;

    console.log(`[Fetcher] Cloudflare detected. Failing over to AnimeSalt mirror: ${altUrl}`);
    const altResult = await fetchDirect(altUrl, options);
    if (altResult.success) {
      return {
        ...altResult,
        originalUrl: targetUrl,
        viaMirror: 'animesalt.cx'
      };
    }
  } catch (err) {
    console.warn('[Fetcher] AnimeSalt mirror failover error:', err.message);
  }
  return null;
}

/**
 * Attempt 2: Route request through the high-speed Corsfix proxy (bypasses Cloudflare)
 */
async function fetchViaCorsfix(targetUrl, options = {}) {
  const timeout = options.timeout || config.scraperTimeoutMs || 15000;
  const startTime = Date.now();
  let targetOrigin = '';
  try {
    targetOrigin = new URL(targetUrl).origin + '/';
  } catch {
    targetOrigin = targetUrl;
  }
  const referer = options.referer || options.ref || targetOrigin;

  try {
    const response = await axios.get(corsfixUrl, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Referer': referer,
        'User-Agent': options.userAgent || config.defaultUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8'
      },
      timeout,
      maxRedirects: 5,
      validateStatus: () => true,
      responseType: 'text'
    });

    const elapsedMs = Date.now() - startTime;
    const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const isBlocked = isCloudflareChallenge(response.status, html) || html.includes('corsfix_error');

    if (response.status >= 200 && response.status < 400 && !isBlocked) {
      return {
        success: true,
        blocked: false,
        url: targetUrl,
        finalUrl: targetUrl,
        statusCode: response.status,
        statusText: response.statusText,
        elapsedMs,
        contentLength: Buffer.byteLength(html, 'utf8'),
        contentType: response.headers['content-type'] || 'text/html',
        headers: response.headers,
        html,
        viaCorsfix: true
      };
    }
    return null;
  } catch (err) {
    console.warn(`[Fetcher] Corsfix proxy failed for ${targetUrl}:`, err.message);
    return null;
  }
}

/**
 * Fetch raw HTML or assets from target URL with realistic browser headers,
 * automatic proxy delegation and Cloudflare challenge evasion.
 */
async function fetchPageHtml(targetUrl, options = {}) {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return {
      success: false,
      url: targetUrl,
      error: 'Invalid or missing targetUrl',
      statusCode: 400
    };
  }

  // 1. Try direct fetch first
  const directResult = await fetchDirect(targetUrl, options);
  if (directResult.success) {
    return directResult;
  }

  // 2. If direct fetch was challenged by Cloudflare or failed, use Corsfix proxy
  if (directResult.blocked || !directResult.success) {
    console.log(`[Fetcher] Direct fetch blocked (${directResult.statusCode}) for ${targetUrl}. Trying Corsfix proxy...`);
    const corsfixResult = await fetchViaCorsfix(targetUrl, options);
    if (corsfixResult && corsfixResult.success) {
      return corsfixResult;
    }

    // 3. If Corsfix proxy failed, route through Railway Proxy
    console.log(`[Fetcher] Routing ${targetUrl} through Railway proxy...`);
    const proxyResult = await fetchViaProxy(targetUrl, options);
    if (proxyResult && proxyResult.success) {
      return proxyResult;
    }

    // 4. If Railway proxy also failed or was blocked, fallback to AnimeSalt mirror
    const mirrorResult = await fetchViaAnimeSaltMirror(targetUrl, options);
    if (mirrorResult && mirrorResult.success) {
      return mirrorResult;
    }
  }

  // If all tiers failed, return the direct result with detailed diagnostics
  return directResult;
}

module.exports = {
  fetchPageHtml,
  fetchDirect,
  fetchViaProxy,
  fetchViaCorsfix,
  isCloudflareChallenge
};
