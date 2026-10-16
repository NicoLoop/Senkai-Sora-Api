const express = require('express');
const router = express.Router();
const devController = require('../controllers/devController');

// Interactive HTML Scraper Extractor Dev Page
router.get('/extract', (req, res) => devController.getExtractorPage(req, res));

// Interactive Iframe Player Proxy Dev Tester Page
router.get('/iframe', (req, res) => devController.getIframeTesterPage(req, res));

// Interactive Video.js Player Dev Tester Page (uses proxy to fetch & stream the video via ID)
router.get(['/player/:id', '/player'], (req, res) => devController.getVideoJsPlayerPage(req, res));

module.exports = router;
