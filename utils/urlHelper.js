/**
 * Utility to extract target URL from request params, path, or query strings
 * Handles /url=https://..., ?url=..., and encoded URLs
 */
function extractTargetUrl(req) {
  // 1. Check query parameter ?url=
  if (req.query && req.query.url) {
    let qUrl = req.query.url.trim();
    if (qUrl.startsWith('url=')) qUrl = qUrl.replace(/^url=/, '');
    return decodeIfNecessary(qUrl);
  }

  // 2. Check full originalUrl for /url= pattern
  const rawUrl = req.originalUrl || req.url || '';
  const urlMatch = rawUrl.match(/\/proxy\/(?:url=)?(https?[:%].*)/i);
  if (urlMatch && urlMatch[1]) {
    // Strip trailing query params if they belong to our server wrapper, or preserve target params
    let extracted = urlMatch[1];
    return decodeIfNecessary(extracted);
  }

  // 3. Check req.params
  if (req.params) {
    const paramVal = req.params[0] || req.params.url || req.params.targetUrl;
    if (paramVal) {
      let cleaned = paramVal.startsWith('url=') ? paramVal.slice(4) : paramVal;
      return decodeIfNecessary(cleaned);
    }
  }

  return null;
}

function decodeIfNecessary(urlStr) {
  if (!urlStr) return '';
  let str = urlStr.trim();
  // If it's URL-encoded (e.g. https%3A%2F%2F)
  if (str.includes('%3A') || str.includes('%2F')) {
    try {
      str = decodeURIComponent(str);
    } catch (e) {
      // keep as is
    }
  }
  return str;
}

function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

module.exports = {
  extractTargetUrl,
  decodeIfNecessary,
  isValidHttpUrl
};
