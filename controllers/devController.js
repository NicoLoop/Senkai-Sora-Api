const { getExtractorHtml } = require('../views/extractorHtml');
const { getIframeTesterHtml } = require('../views/iframeTesterHtml');
const { getVideoJsPlayerHtml } = require('../views/videoJsPlayerHtml');
const config = require('../config');

class DevController {
  /**
   * Render HTML Scraper Developer Tool
   * GET /dev/extract
   */
  getExtractorPage(req, res) {
    const html = getExtractorHtml({
      animeWorldIndiaUrl: config.animeWorldIndiaUrl,
      apiKey: config.apiKey
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  /**
   * Render Iframe Proxy Developer Tool
   * GET /dev/iframe
   */
  getIframeTesterPage(req, res) {
    const html = getIframeTesterHtml({
      defaultVideoUrl: req.query.url || 'https://play.zephyrix.org/video/64c32b8eb5304d80ba093227975ece13',
      defaultReferer: req.query.referer || config.defaultReferer,
      port: config.port
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  /**
   * Render Video.js Player Dev Tool
   * Uses the dedicated proxy to stream the video via ID
   * GET /dev/player or GET /dev/player/:id
   */
  getVideoJsPlayerPage(req, res) {
    const defaultVideoId = req.params.id || req.query.id || req.query.v || 'b51a15f382ac914391a58850ab343b00';
    const html = getVideoJsPlayerHtml({
      defaultVideoId,
      port: config.port,
      proxyBaseUrl: config.abyssProxyUrl
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}

module.exports = new DevController();
