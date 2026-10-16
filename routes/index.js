const express = require('express');
const router = express.Router();

const playerRoutes = require('./playerRoutes');
const scraperRoutes = require('./scraperRoutes');
const devRoutes = require('./devRoutes');
const config = require('../config');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Anime Stream Hindi API & Proxy',
    config: {
      port: config.port,
      animeWorldIndiaUrl: config.animeWorldIndiaUrl,
      apiKeyConfigured: Boolean(config.apiKey)
    }
  });
});

// Mount Dev routes: /dev/extract, /dev/iframe
// Note: Mounted at root level in server.js as app.use('/dev', devRoutes)

// Mount API v1 AnimeWorldIndia routes
router.use('/v1/animeworldin/player', playerRoutes);
router.use('/v1/animeworldin', scraperRoutes);

// Direct /api/extract convenience routes
router.use('/', scraperRoutes);

module.exports = router;
