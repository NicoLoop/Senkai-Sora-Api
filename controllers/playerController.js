const playerProxyService = require('../services/playerProxyService');
const { extractTargetUrl, isValidHttpUrl } = require('../utils/urlHelper');

class PlayerController {
  /**
   * Proxy an embeddable video player iframe (e.g. Zephyrix, Synthnova, AnimeWorld)
   * Handles:
   * /api/v1/animeworldin/player/proxy/url=:url
   * /api/v1/animeworldin/player/proxy?url=:url
   */
  async proxyPlayer(req, res, next) {
    try {
      const targetUrl = extractTargetUrl(req);

      if (!targetUrl) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Invalid Player Proxy URL</title></head>
            <body style="background:#0a0a0d;color:#fff;font-family:sans-serif;padding:30px;text-align:center;">
              <h2 style="color:#f87171;">Missing Target Video URL</h2>
              <p>Please specify a video URL to proxy, e.g.:</p>
              <code>/api/v1/animeworldin/player/proxy/url=https://play.zephyrix.org/video/...</code>
              <p style="margin-top:20px;">
                <a href="/dev/iframe" style="color:#c084fc;text-decoration:none;font-weight:bold;">Open /dev/iframe tester &rarr;</a>
              </p>
            </body>
          </html>
        `);
      }

      if (!isValidHttpUrl(targetUrl)) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Invalid URL</title></head>
            <body style="background:#0a0a0d;color:#fff;font-family:sans-serif;padding:30px;text-align:center;">
              <h2 style="color:#f87171;">Invalid URL Format</h2>
              <p>The provided URL is not a valid HTTP/HTTPS address: <code>${targetUrl}</code></p>
            </body>
          </html>
        `);
      }

      // Check for custom referer from query
      const customReferer = req.query.referer || null;
      const userAgent = req.query.userAgent || null;

      const result = await playerProxyService.proxyPlayer(targetUrl, {
        customReferer,
        userAgent
      });

      // Apply headers
      Object.entries(result.headers).forEach(([k, v]) => {
        res.setHeader(k, v);
      });

      // Explicitly remove restrictive framing headers
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy-Report-Only');

      res.status(result.statusCode).send(result.html);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Health / Info endpoint for the player proxy
   */
  async getProxyInfo(req, res) {
    res.json({
      status: 'active',
      service: 'AnimeWorld & Zephyrix Iframe Player Proxy',
      routePattern: '/api/v1/animeworldin/player/proxy/url={targetUrl}',
      example: '/api/v1/animeworldin/player/proxy/url=https://play.zephyrix.org/video/64c32b8eb5304d80ba093227975ece13',
      devTester: '/dev/iframe'
    });
  }
}

module.exports = new PlayerController();
