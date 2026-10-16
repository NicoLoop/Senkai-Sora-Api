const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Proxy information endpoint
router.get('/info', playerController.getProxyInfo);

/**
 * Handle proxy routes:
 * 1. /proxy/url=https://play.zephyrix.org/video/...
 * 2. /proxy?url=https://play.zephyrix.org/video/...
 * 3. /proxy/* (catchall)
 */
router.get('/proxy', (req, res, next) => playerController.proxyPlayer(req, res, next));
router.get('/proxy/url=*', (req, res, next) => playerController.proxyPlayer(req, res, next));
router.get('/proxy/*', (req, res, next) => playerController.proxyPlayer(req, res, next));

module.exports = router;
