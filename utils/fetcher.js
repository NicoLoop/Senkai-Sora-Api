const axios = require('axios');
const config = require('../config');

/**
 * Fetch raw HTML or assets from target URL with realistic browser headers
 * to prevent anti-bot and Cloudflare basic challenges.
 */
async function fetchPageHtml(targetUrl, options = {}) {
  const timeout = options.timeout || config.scraperTimeoutMs || 15000;
  const referer = options.referer || config.defaultReferer;

  const defaultHeaders = {
    'User-Agent': options.userAgent || config.defaultUserAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': referer,
    'Origin': referer.replace(/\/$/, ''),
    'Sec-Fetch-Dest': 'iframe',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    ...(options.headers || {})
  };

  const startTime = Date.now();

  try {
    const response = await axios.get(targetUrl, {
      headers: defaultHeaders,
      timeout,
      maxRedirects: 5,
      validateStatus: () => true, // Don't throw on non-200 so we can inspect
      responseType: 'text',
      decompress: true
    });

    const elapsedMs = Date.now() - startTime;
    const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    return {
      success: response.status >= 200 && response.status < 400,
      url: targetUrl,
      finalUrl: response.request?.res?.responseUrl || targetUrl,
      statusCode: response.status,
      statusText: response.statusText,
      elapsedMs,
      contentLength: Buffer.byteLength(html, 'utf8'),
      contentType: response.headers['content-type'] || 'text/html',
      headers: response.headers,
      html
    };
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    return {
      success: false,
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

module.exports = {
  fetchPageHtml
};
