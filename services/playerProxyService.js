const { fetchPageHtml } = require('../utils/fetcher');
const { rewritePlayerHtml } = require('../utils/htmlRewriter');
const config = require('../config');

/**
 * Service to proxy video player iframes (Zephyrix, Synthnova, AnimeWorld, etc.)
 * Strips CSP frame-ancestors, bypasses X-Frame-Options, and handles referer origin requirements.
 */
class PlayerProxyService {
  async proxyPlayer(targetUrl, options = {}) {
    if (!targetUrl) {
      throw new Error('Target player URL is required');
    }

    // Determine appropriate referer
    // If target is play.zephyrix.org or synthnova.net, it accepts watchanimeworld domains
    let referer = options.referer || config.defaultReferer;
    
    // Allow user override from query if in allowedReferers list
    if (options.customReferer && config.allowedReferers.includes(options.customReferer)) {
      referer = options.customReferer;
    }

    const fetchResult = await fetchPageHtml(targetUrl, {
      referer,
      userAgent: options.userAgent || config.defaultUserAgent,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'iframe',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site'
      }
    });

    if (!fetchResult.success && fetchResult.statusCode >= 400 && !fetchResult.html) {
      return {
        statusCode: fetchResult.statusCode,
        contentType: 'text/html',
        html: `<html><body style="background:#000;color:#fff;font-family:sans-serif;padding:20px;">
          <h3>Player Proxy Error (${fetchResult.statusCode})</h3>
          <p>${fetchResult.error || fetchResult.statusText}</p>
        </body></html>`
      };
    }

    // Sanitize and rewrite the player HTML to allow framing
    const rewrittenHtml = rewritePlayerHtml(fetchResult.html, targetUrl);

    // Build clean response headers
    const cleanHeaders = {
      'Content-Type': fetchResult.contentType || 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      // Explicitly allow framing in our own or any origin
      'Content-Security-Policy': 'frame-ancestors *',
      'X-Proxy-Target': targetUrl,
      'X-Proxy-Referer': referer
    };

    return {
      statusCode: fetchResult.statusCode || 200,
      contentType: fetchResult.contentType,
      headers: cleanHeaders,
      html: rewrittenHtml,
      targetUrl,
      referer
    };
  }
}

module.exports = new PlayerProxyService();
