const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

// Extractor & Direct Proxy routes
router.post('/extract', scraperController.extractPost);
router.get('/extract', scraperController.extractGet);
router.get('/extract/raw', scraperController.extractRawText);
router.all('/proxy/scrape', scraperController.scrapeProxy);
router.all('/scrape', scraperController.scrapeProxy);
router.all('/proxy/html', scraperController.scrapeProxy);

// AnimeWorld Scraper Endpoints
router.get('/home', scraperController.getHome);
router.get('/animeinfo/*', scraperController.getAnimeInfo);
router.get('/animeinfo', scraperController.getAnimeInfo);
router.get('/catalog', scraperController.getCatalog);
router.get('/details', scraperController.getDetails);
// Episode & Streaming Server Endpoints
router.get('/episode/*', scraperController.getEpisode);
router.get('/episode', scraperController.getEpisode);
router.get('/stream/servers/:id', scraperController.getStreamServers);
router.get('/stream/servers/*', scraperController.getStreamServers);
router.get('/stream/servers', scraperController.getStreamServers);
router.get('/stream/servers/', scraperController.getStreamServers);

// Movie endpoints (Single-episode direct stream info)
router.get('/movie/*', scraperController.getMovie);
router.get('/movie', scraperController.getMovie);
router.get('/movies/:id', scraperController.getMovie);
router.get('/movieinfo/*', scraperController.getMovie);

// Search & Autocomplete
router.get('/search', scraperController.getSearch);
router.get('/search-suggestion', scraperController.getSearchSuggestions);
router.post('/search-suggestion', scraperController.getSearchSuggestions);
router.get('/search-suggest', scraperController.getSearchSuggestions);
router.post('/search-suggest', scraperController.getSearchSuggestions);

// A-Z Listing
router.get('/letter/:letter', scraperController.getLetterListing);
router.get('/letter/*', scraperController.getLetterListing);
router.get('/az-list/:letter', scraperController.getLetterListing);
router.get('/az-list/*', scraperController.getLetterListing);

// Taxonomy & Categories
router.get('/network/:network', scraperController.getTaxonomyListing);
router.get('/category/network/:network', scraperController.getTaxonomyListing);
router.get('/language/:language', scraperController.getTaxonomyListing);
router.get('/category/language/:language', scraperController.getTaxonomyListing);
router.get('/franchise/:franchise', scraperController.getTaxonomyListing);
router.get('/category/franchise/:franchise', scraperController.getTaxonomyListing);
router.get('/series', scraperController.getTaxonomyListing);
router.get('/category/series', scraperController.getTaxonomyListing);
router.get('/movies', scraperController.getTaxonomyListing);
router.get('/anime', scraperController.getTaxonomyListing);
router.get('/category/anime', scraperController.getTaxonomyListing);
router.get('/cartoon', scraperController.getTaxonomyListing);
router.get('/category/cartoon', scraperController.getTaxonomyListing);
router.get('/category/type/:category', scraperController.getTaxonomyListing);
router.get('/type/:category', scraperController.getTaxonomyListing);

module.exports = router;
