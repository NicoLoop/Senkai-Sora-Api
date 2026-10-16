const express = require('express');
const config = require('./config');
const corsMiddleware = require('./middlewares/cors');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

const apiRoutes = require('./routes');
const devRoutes = require('./routes/devRoutes');
const playerController = require('./controllers/playerController');
const playerExtractorController = require('./controllers/playerExtractorController');

const app = express();

// Middlewares
app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const devController = require('./controllers/devController');

// Interactive Video.js Player Dev Tester Route:
// /dev/player or /player (uses proxy to stream video)
app.get(['/player', '/player/:id'], (req, res) => {
  devController.getVideoJsPlayerPage(req, res);
});

// Video.js Player Stream Extraction Endpoint (Stateless / Serverless)
app.get(['/api/player/data/:id', '/api/player/data'], (req, res) => {
  playerExtractorController.extractData(req, res);
});
app.get('/api/player/extract', (req, res) => {
  playerExtractorController.extractData(req, res);
});

// Dedicated direct route matching exact user format:
// /api/v1/animeworldin/player/proxy/url=https://...
app.get('/api/v1/animeworldin/player/proxy/url=*', (req, res, next) => {
  playerController.proxyPlayer(req, res, next);
});

// Direct alias for animeinfo: (api url)/animeinfo/[id]
const scraperController = require('./controllers/scraperController');
app.get(['/animeinfo/*', '/animeinfo'], (req, res, next) => {
  scraperController.getAnimeInfo(req, res, next);
});
app.get('/api/animeinfo/*', (req, res, next) => {
  scraperController.getAnimeInfo(req, res, next);
});

// Direct alias for episode details & stream info: (api url)/episode/[id]
app.get(['/episode/*', '/episode'], (req, res, next) => {
  scraperController.getEpisode(req, res, next);
});
app.get('/api/episode/*', (req, res, next) => {
  scraperController.getEpisode(req, res, next);
});

// Direct alias for streaming servers: (api url)/stream/servers/[id] or /stream/servers/?playXID=...&abyssId=...
app.get(['/stream/servers/*', '/stream/servers/:id', '/stream/servers', '/stream/servers/'], (req, res, next) => {
  scraperController.getStreamServers(req, res, next);
});
app.get(['/api/stream/servers/*', '/api/stream/servers/:id', '/api/stream/servers', '/api/stream/servers/'], (req, res, next) => {
  scraperController.getStreamServers(req, res, next);
});

// Direct alias for movie details & stream info: (api url)/movie/[id]
app.get(['/movie/*', '/movie', '/movieinfo/*'], (req, res, next) => {
  scraperController.getMovie(req, res, next);
});
app.get('/api/movie/*', (req, res, next) => {
  scraperController.getMovie(req, res, next);
});

// Direct alias for search & autocomplete: /search?s=..., /search-suggestion
app.get('/search', (req, res, next) => {
  scraperController.getSearch(req, res, next);
});
app.all(['/search-suggestion', '/search-suggest'], (req, res, next) => {
  scraperController.getSearchSuggestions(req, res, next);
});

// Direct alias for A-Z letters: /letter/:letter, /az-list/:letter
app.get(['/letter/*', '/letter/:letter', '/az-list/*', '/az-list/:letter'], (req, res, next) => {
  scraperController.getLetterListing(req, res, next);
});

// Direct alias for genres & categories
app.get(['/genres', '/categories', '/api/genres', '/api/categories'], (req, res, next) => {
  scraperController.getGenresList(req, res, next);
});
app.get([
  '/genre/:genre',
  '/category/genre/:genre',
  '/api/genre/:genre',
  '/api/category/genre/:genre',
], (req, res, next) => {
  scraperController.getTaxonomyListing(req, res, next);
});

// Direct alias for taxonomy / categories: /network, /language, /franchise, /series, /movies, /anime, /cartoon
app.get([
  '/network/:network',
  '/category/network/:network',
  '/language/:language',
  '/category/language/:language',
  '/franchise/:franchise',
  '/category/franchise/:franchise',
  '/series',
  '/category/series',
  '/movies',
  '/anime',
  '/category/anime',
  '/cartoon',
  '/category/cartoon',
  '/category/type/:category',
  '/type/:category'
], (req, res, next) => {
  scraperController.getTaxonomyListing(req, res, next);
});

// Dev Tools Pages: /dev/extract, /dev/iframe
app.use('/dev', devRoutes);

// API Routes: /api/...
app.use('/api', apiRoutes);

// Root Welcome & Sitemap
app.get('/', (req, res) => {
  res.json({
    service: 'Anime Stream Hindi Scraper & Video Proxy API',
    version: '1.0.0',
    documentation: {
      guides: {
        scraperGuide: '/scrapperguide.md',
        streamingGuide: '/STREAMING_GUIDE.md',
        fullReadme: '/README.md'
      },
      videoJsPlayerClone: {
        playerUrl: 'GET /player or /player/{id}',
        example: '/player/b51a15f382ac914391a58850ab343b00',
        dataApi: 'GET /api/player/data/{id}',
        streamProxy: `${config.abyssProxyUrl}/player/stream/proxy?url={m3u8Url}&videoId={id}`,
        subtitleProxy: `${config.abyssProxyUrl}/player/subtitle/proxy?url={subJpgUrl}`,
        description: 'Serverless Video.js metadata extractor; HLS streaming proxy is hosted on dedicated proxy server (env.abyss_proxy_url)'
      },
      iframePlayerProxy: {
        method: 'GET',
        path: '/api/v1/animeworldin/player/proxy/url={videoPlayerUrl}',
        example: `/api/v1/animeworldin/player/proxy/url=https://play.zephyrix.org/video/64c32b8eb5304d80ba093227975ece13`,
        description: 'Bypasses CSP frame-ancestors and X-Frame-Options to allow embedding in iframes'
      },
      devTools: {
        videoJsPlayer: '/player',
        iframeTester: '/dev/iframe',
        scraperExtractor: '/dev/extract'
      },
      scraperEndpoints: {
        home: 'GET /api/v1/animeworldin/home (Includes spotlight with high-res banners)',
        animeinfo: 'GET /animeinfo/{id} or /api/v1/animeworldin/animeinfo/{id}',
        episode: 'GET /episode/{id} or /api/v1/animeworldin/episode/{id}',
        streamServers: 'GET /stream/servers/{streamId}',
        movie: 'GET /movie/{id} (Single-episode direct stream ID & multi-audio decodes)',
        search: 'GET /search?s={query}&page={page} (With pagination & hasNextPage)',
        searchSuggestion: 'GET /search-suggestion?term={query}',
        azListing: 'GET /letter/{a-z|0-9}?page={page}',
        network: 'GET /network/{name}?page={page}',
        language: 'GET /language/{name}?page={page}',
        franchise: 'GET /franchise/{name}?page={page}',
        series: 'GET /series?page={page}',
        movies: 'GET /movies?page={page}',
        animeCategory: 'GET /category/anime?page={page}',
        cartoonCategory: 'GET /category/cartoon?page={page}',
        typeCombinations: 'GET /category/type/{anime|cartoon}?type={movies|series}&page={page}'
      },
      healthCheck: '/api/health'
    },
    config: {
      port: config.port,
      targetBaseUrl: config.animeWorldIndiaUrl,
      allowedReferers: config.allowedReferers
    }
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`[API] Server started on http://localhost:${config.port}`);
  console.log(`[API] 🎬 Video.js Player Dev Tool: http://localhost:${config.port}/dev/player`);
  console.log(`[API] 📺 Iframe Proxy Tester:    http://localhost:${config.port}/dev/iframe`);
  console.log(`[API] ⚡ Scraper Extractor:      http://localhost:${config.port}/dev/extract`);
  console.log(`[API] 🎯 Target Scraper URL:     ${config.animeWorldIndiaUrl}`);
});

module.exports = app;
