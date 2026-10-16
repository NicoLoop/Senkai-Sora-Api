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
 * Builds realistic Chrome 132 browser headers using the target's own origin and referer.
 */
function getBrowserHeaders(targetUrl, options = {}) {
  let targetOrigin = '';
  try {
    targetOrigin = new URL(targetUrl).origin;
  } catch {
    targetOrigin = 'https://watchanimeworld.one';
  }

  const referer = options.referer || options.ref || `${targetOrigin}/`;
  const isSameOrigin = targetOrigin && referer && referer.startsWith(targetOrigin);

  const headers = {
    'User-Agent': options.userAgent || config.defaultUserAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Origin': targetOrigin,
    'Referer': referer,
    'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': isSameOrigin ? 'same-origin' : 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    ...(options.headers || {})
  };

  if (headers['Sec-Fetch-Dest'] === 'iframe') {
    headers['Sec-Fetch-Dest'] = 'document';
  }

  return headers;
}

/**
 * Direct fetch with target origin and referer
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
 * High-speed proxy resolver (bypasses Cloudflare on target sites)
 */
async function fetchViaCorsfix(targetUrl, options = {}) {
  const timeout = options.timeout || config.scraperTimeoutMs || 15000;
  const startTime = Date.now();

  let targetOrigin = '';
  try {
    targetOrigin = new URL(targetUrl).origin;
  } catch {
    targetOrigin = 'https://watchanimeworld.one';
  }
  const referer = options.referer || options.ref || `${targetOrigin}/`;
  const corsfixUrl = `https://proxy-ap.corsfix.com/?${targetUrl}`;

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
 * Direct mirror failover to AnimeSalt (identical catalog without bot challenge)
 */
async function fetchViaAnimeSaltMirror(targetUrl, options = {}) {
  try {
    const parsed = new URL(targetUrl);
    const isTargetAnimeWorld = ANIMEWORLD_DOMAINS.some(d => parsed.hostname.includes(d));
    if (!isTargetAnimeWorld) return null;

    const saltBase = config.animeSaltUrl.replace(/\/+$/, '');
    const altUrl = `${saltBase}${parsed.pathname}${parsed.search}`;

    console.log(`[Fetcher] Failing over to AnimeSalt mirror: ${altUrl}`);
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
 * Self-contained HTML fetcher hosted directly on API
 * Uses target origin, corsfix Cloudflare bypass and local mirror failover (Zero Railway dependencies)
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

  // 1. Try direct fetch with target origin first
  const directResult = await fetchDirect(targetUrl, options);
  if (directResult.success) {
    return directResult;
  }

  // 2. If blocked by Cloudflare (e.g. on Vercel/datacenter IP), use high-speed Corsfix solver
  if (directResult.blocked || !directResult.success) {
    console.log(`[Fetcher] Direct fetch challenged (${directResult.statusCode}) for ${targetUrl}. Solving via Corsfix...`);
    const corsfixResult = await fetchViaCorsfix(targetUrl, options);
    if (corsfixResult && corsfixResult.success) {
      return corsfixResult;
    }

    // 3. Fallback to AnimeSalt mirror directly
    const mirrorResult = await fetchViaAnimeSaltMirror(targetUrl, options);
    if (mirrorResult && mirrorResult.success) {
      return mirrorResult;
    }
  }

  return directResult;
}

module.exports = {
  fetchPageHtml,
  fetchDirect,
  fetchViaCorsfix,
  fetchViaAnimeSaltMirror,
  isCloudflareChallenge
};
