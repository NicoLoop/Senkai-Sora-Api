const axios = require('axios');
const ravokPlayerService = require('../services/ravokPlayerService');
const config = require('../config');

class PlayerExtractorController {
  /**
   * Render or redirect to player
   * GET /player or GET /player/:id
   */
  renderPlayerPage(req, res) {
    const defaultVideoId = req.params.id || req.query.id || req.query.v || 'b51a15f382ac914391a58850ab343b00';
    const proxyPlayerUrl = `${(config.abyssProxyUrl || 'http://localhost:3005').replace(/\/$/, '')}/player/${defaultVideoId}`;
    return res.redirect(proxyPlayerUrl);
  }

  /**
   * Extract video stream, intro/outro timestamps, subtitles and metadata.
   * Delegates to the proxy server so the stream token is generated using the proxy server's IP address.
   * GET /api/player/data/:id or GET /api/player/extract?id=:id
   */
  async extractData(req, res) {
    try {
      const target = req.params.id || req.query.id || req.query.url || req.query.v;
      if (!target) {
        return res.status(400).json({
          success: false,
          error: 'Video ID or Ravok URL is required'
        });
      }

      // 1. Delegate extraction to the proxy server so the IP on the token matches the proxy!
      if (config.abyssProxyUrl) {
        try {
          const proxyBase = config.abyssProxyUrl.replace(/\/$/, '');
          const proxyDataUrl = `${proxyBase}/player/data/${encodeURIComponent(target)}`;
          const proxyResponse = await axios.get(proxyDataUrl, { timeout: 8000 });
          if (proxyResponse.data && proxyResponse.data.success) {
            return res.json(proxyResponse.data);
          }
        } catch (proxyErr) {
          console.warn('[PlayerExtractorController] Proxy extraction call failed, falling back to local extraction:', proxyErr.message);
        }
      }

      // 2. Fallback to local serverless extraction
      const result = await ravokPlayerService.extractVideoData(target);
      return res.json(result);
    } catch (err) {
      console.error('[PlayerExtractorController] extractData error:', err.message);
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
}

module.exports = new PlayerExtractorController();
