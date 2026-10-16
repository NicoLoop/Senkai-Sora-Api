const scraperService = require('../services/scraperService');
const config = require('../config');
const { isValidHttpUrl } = require('../utils/urlHelper');

class ScraperController {
  /**
   * POST /api/extract
   * Extract raw HTML and headers via proxy
   */
  async extractPost(req, res, next) {
    try {
      const targetUrl = (req.body.url || config.animeWorldIndiaUrl).trim();

      if (!isValidHttpUrl(targetUrl)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL. Must start with http:// or https://'
        });
      }

      const result = await scraperService.extractRaw(targetUrl, {
        userAgent: req.body.userAgent,
        headers: req.body.headers,
        timeout: req.body.timeout,
        referer: req.body.referer
      });

      res.status(result.statusCode >= 200 && result.statusCode < 400 ? 200 : result.statusCode || 500).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/extract
   */
  async extractGet(req, res, next) {
    try {
      const targetUrl = (req.query.url || config.animeWorldIndiaUrl).trim();

      if (!isValidHttpUrl(targetUrl)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL. Must start with http:// or https://'
        });
      }

      const result = await scraperService.extractRaw(targetUrl, {
        referer: req.query.referer
      });
      res.status(result.statusCode >= 200 && result.statusCode < 400 ? 200 : result.statusCode || 500).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/extract/raw
   */
  async extractRawText(req, res, next) {
    try {
      const targetUrl = (req.query.url || config.animeWorldIndiaUrl).trim();
      const result = await scraperService.extractRaw(targetUrl);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(result.html);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/animeworldin/home
   * Scrapes complete AnimeWorld India homepage into all 10 categorized sections
   */
  async getHome(req, res, next) {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const result = await scraperService.getHomePageData({ forceRefresh });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/animeworldin/animeinfo/*
   * Returns full anime details, synopsis, genres, seasons, and episodes list
   */
  async getAnimeInfo(req, res, next) {
    try {
      let rawId = req.params[0] || req.params.id || req.query.id;
      if (!rawId) {
        const match = req.originalUrl.match(/\/animeinfo\/(.+?)(?:\?|$)/);
        if (match) rawId = match[1];
      }

      if (!rawId) {
        return res.status(400).json({
          success: false,
          error: 'Missing anime ID parameter. Example: /api/v1/animeworldin/animeinfo/series/arifureta-from-commonplace-to-worlds-strongest'
        });
      }

      const forceRefresh = req.query.refresh === 'true';
      const result = await scraperService.getAnimeInfo(rawId, { forceRefresh });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/animeworldin/catalog
   */
  async getCatalog(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const catalog = await scraperService.getAnimeWorldCatalog(page);
      res.json(catalog);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/animeworldin/details?url=...
   */
  async getDetails(req, res, next) {
    try {
      const animeUrl = req.query.url;
      if (!animeUrl) {
        return res.status(400).json({ success: false, error: 'url parameter is required' });
      }
      const details = await scraperService.getAnimeDetails(animeUrl);
      res.json(details);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/animeworldin/players?url=...
   */
  async getPlayers(req, res, next) {
    try {
      const epUrl = req.query.url;
      if (!epUrl) {
        return res.status(400).json({ success: false, error: 'url parameter is required' });
      }
      const players = await scraperService.getEpisodePlayers(epUrl);
      res.json(players);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /episode/:id
   * Extracts episode streaming info (streamId from dub-player), anime details,
   * running episode, next episode, previous episode, etc.
   */
  async getEpisode(req, res, next) {
    try {
      let rawId = req.params[0] || req.params.id || req.query.id;
      if (!rawId) {
        const match = req.originalUrl.match(/\/episode\/(.+?)(?:\?|$)/);
        if (match) rawId = match[1];
      }

      if (!rawId) {
        return res.status(400).json({
          success: false,
          error: 'Missing episode ID. Example: /episode/fullmetal-alchemist-brotherhood-1x1'
        });
      }

      const forceRefresh = req.query.refresh === 'true';
      const result = await scraperService.getEpisodeDetails(rawId, { forceRefresh });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /stream/servers/?playXID=...&abyssId=... OR /stream/servers/:id
   * Extracts Abyss player streaming links & languages and PlayX (Ravok) direct HLS stream
   */
  async getStreamServers(req, res, next) {
    try {
      const abyssId = req.query.abyssId || req.query.abyssid || req.query.streamId || req.query.id || req.params.id || req.params[0];
      const playXID = req.query.playXID || req.query.playxid || req.query.playXId;

      let rawAbyssId = abyssId;
      if (!rawAbyssId && !playXID) {
        const match = req.originalUrl.match(/\/stream\/servers\/(.+?)(?:\?|$)/);
        if (match && match[1] && !match[1].startsWith('?')) {
          rawAbyssId = match[1];
        }
      }

      if (!rawAbyssId && !playXID) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters. Example: /stream/servers/?playXID=...&abyssId=... or /stream/servers/8545'
        });
      }

      const result = await scraperService.getStreamServers(
        { abyssId: rawAbyssId, playXID },
        { forceRefresh: true }
      );
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /movie/:id
   * Extracts movie info, direct streamId from dub-player, multiAudioPlayers, and player iframes
   */
  async getMovie(req, res, next) {
    try {
      let rawId = req.params[0] || req.params.id || req.query.id;
      if (!rawId) {
        const match = req.originalUrl.match(/\/(?:movies?|movieinfo)\/(.+?)(?:\?|$)/);
        if (match) rawId = match[1];
      }

      if (!rawId) {
        return res.status(400).json({
          success: false,
          error: 'Missing movie ID. Example: /movie/your-name or /movie/weathering-with-you'
        });
      }

      const forceRefresh = req.query.refresh === 'true';
      const result = await scraperService.getMovieDetails(rawId, { forceRefresh });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /search?s=...&page=...
   * Full search with current page, next page, total pages, and hasNextPage indicator
   */
  async getSearch(req, res, next) {
    try {
      const query = (req.query.s || req.query.q || req.query.query || '').trim();
      const page = parseInt(req.query.page, 10) || 1;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query parameter ?s= is required'
        });
      }

      const forceRefresh = req.query.refresh === 'true';
      const result = await scraperService.getListing('', page, { s: query }, { forceRefresh });
      res.json({
        success: true,
        query,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET or POST /search-suggestion (or /search-suggest)
   * Instant search autocomplete by anime/series name via action_tr_search_suggest
   */
  async getSearchSuggestions(req, res, next) {
    try {
      const term = (req.query.term || req.query.q || req.query.s || req.body?.term || '').trim();
      const nonce = req.query.nonce || req.body?.nonce || null;

      if (!term) {
        return res.json({
          success: true,
          term: '',
          totalResults: 0,
          suggestions: []
        });
      }

      const result = await scraperService.getSearchSuggestions(term, nonce);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /letter/:letter or /az-list/:letter
   * A-Z anime listing with pagination
   */
  async getLetterListing(req, res, next) {
    try {
      let letter = (req.params.letter || req.params[0] || 'a').trim().toLowerCase();
      if (letter === '#' || letter === '0-9' || /^\d+$/.test(letter)) {
        letter = '0-9';
      }
      const page = parseInt(req.query.page, 10) || 1;
      const forceRefresh = req.query.refresh === 'true';
      const result = await scraperService.getListing(`letter/${letter}`, page, {}, { forceRefresh });
      res.json({
        success: true,
        letter,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Universal taxonomy / category handler:
   * Handles:
   * - /network/:network
   * - /language/:language
   * - /franchise/:franchise
   * - /series
   * - /movies (catalog listing)
   * - /category/anime
   * - /category/cartoon
   * - /category/type/:category?type=movies|series
   */
  async getTaxonomyListing(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const forceRefresh = req.query.refresh === 'true';

      let basePath = '';
      const queryParams = {};

      if (req.params.genre) {
        basePath = `category/genre/${req.params.genre}`;
      } else if (req.params.network) {
        basePath = `category/network/${req.params.network}`;
      } else if (req.params.language) {
        basePath = `category/language/${req.params.language}`;
      } else if (req.params.franchise) {
        basePath = `category/franchise/${req.params.franchise}`;
      } else if (req.params.category && req.query.type) {
        basePath = `category/type/${req.params.category}`;
        queryParams.type = req.query.type;
      } else if (req.path.includes('/anime')) {
        basePath = 'category/anime';
      } else if (req.path.includes('/cartoon')) {
        basePath = 'category/cartoon';
      } else if (req.path.includes('/series')) {
        basePath = 'series';
      } else if (req.path.includes('/movies')) {
        basePath = 'movies';
      } else {
        basePath = req.path.replace(/^\/api\/v1\/animeworldin\//, '').replace(/^\/api\//, '').replace(/^\//, '');
      }

      if (req.query.type) {
        queryParams.type = req.query.type;
      }

      const result = await scraperService.getListing(basePath, page, queryParams, { forceRefresh });
      res.json({
        success: true,
        path: basePath,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /genres or /categories
   * Returns list of all available genres with slugs and paths
   */
  async getGenresList(req, res, next) {
    try {
      const genres = [
        { name: 'Action', slug: 'action' },
        { name: 'Action & Adventure', slug: 'action-adventure' },
        { name: 'Adult Cast', slug: 'adult-cast' },
        { name: 'Adventure', slug: 'adventure' },
        { name: 'Animation', slug: 'animation' },
        { name: 'Anthropomorphic', slug: 'anthropomorphic' },
        { name: 'Avant Garde', slug: 'avant-garde' },
        { name: 'Award Winning', slug: 'award-winning' },
        { name: 'Boys Love', slug: 'boys-love' },
        { name: 'Cars', slug: 'cars' },
        { name: 'CGDCT', slug: 'cgdct' },
        { name: 'Childcare', slug: 'childcare' },
        { name: 'Combat Sports', slug: 'combat-sports' },
        { name: 'Comedy', slug: 'comedy' },
        { name: 'Crossdressing', slug: 'crossdressing' },
        { name: 'Delinquents', slug: 'delinquents' },
        { name: 'Dementia', slug: 'dementia' },
        { name: 'Demons', slug: 'demons' },
        { name: 'Detective', slug: 'detective' },
        { name: 'Drama', slug: 'drama' },
        { name: 'Ecchi', slug: 'ecchi' },
        { name: 'Educational', slug: 'educational' },
        { name: 'Erotica', slug: 'erotica' },
        { name: 'Fantasy', slug: 'fantasy' },
        { name: 'Gag Humor', slug: 'gag-humor' },
        { name: 'Game', slug: 'game' },
        { name: 'Girls Love', slug: 'girls-love' },
        { name: 'Gore', slug: 'gore' },
        { name: 'Gourmet', slug: 'gourmet' },
        { name: 'Harem', slug: 'harem' },
        { name: 'Hentai', slug: 'hentai' },
        { name: 'High Stakes Game', slug: 'high-stakes-game' },
        { name: 'Historical', slug: 'historical' },
        { name: 'Horror', slug: 'horror' },
        { name: 'Idols (Female)', slug: 'idols-female' },
        { name: 'Idols (Male)', slug: 'idols-male' },
        { name: 'Isekai', slug: 'isekai' },
        { name: 'Iyashikei', slug: 'iyashikei' },
        { name: 'Josei', slug: 'josei' },
        { name: 'Kids', slug: 'kids' },
        { name: 'Love Polygon', slug: 'love-polygon' },
        { name: 'Magic', slug: 'magic' },
        { name: 'Martial Arts', slug: 'martial-arts' },
        { name: 'Mecha', slug: 'mecha' },
        { name: 'Medical', slug: 'medical' },
        { name: 'Military', slug: 'military' },
        { name: 'Music', slug: 'music' },
        { name: 'Mystery', slug: 'mystery' },
        { name: 'Mythology', slug: 'mythology' },
        { name: 'Organized Crime', slug: 'organized-crime' },
        { name: 'Otaku Culture', slug: 'otaku-culture' },
        { name: 'Parody', slug: 'parody' },
        { name: 'Performing Arts', slug: 'performing-arts' },
        { name: 'Pets', slug: 'pets' },
        { name: 'Police', slug: 'police' },
        { name: 'Psychological', slug: 'psychological' },
        { name: 'Racing', slug: 'racing' },
        { name: 'Reincarnation', slug: 'reincarnation' },
        { name: 'Reverse Harem', slug: 'reverse-harem' },
        { name: 'Romance', slug: 'romance' },
        { name: 'Samurai', slug: 'samurai' },
        { name: 'School', slug: 'school' },
        { name: 'Sci-Fi', slug: 'sci-fi' },
        { name: 'Seinen', slug: 'seinen' },
        { name: 'Shoujo', slug: 'shoujo' },
        { name: 'Shoujo Ai', slug: 'shoujo-ai' },
        { name: 'Shounen', slug: 'shounen' },
        { name: 'Shounen Ai', slug: 'shounen-ai' },
        { name: 'Showbiz', slug: 'showbiz' },
        { name: 'Slice of Life', slug: 'slice-of-life' },
        { name: 'Space', slug: 'space' },
        { name: 'Sports', slug: 'sports' },
        { name: 'Strategy Game', slug: 'strategy-game' },
        { name: 'Supernatural', slug: 'supernatural' },
        { name: 'Super Power', slug: 'super-power' },
        { name: 'Survival', slug: 'survival' },
        { name: 'Suspense', slug: 'suspense' },
        { name: 'Team Sports', slug: 'team-sports' },
        { name: 'Thriller', slug: 'thriller' },
        { name: 'Time Travel', slug: 'time-travel' },
        { name: 'Urban Fantasy', slug: 'urban-fantasy' },
        { name: 'Vampire', slug: 'vampire' },
        { name: 'Video Game', slug: 'video-game' },
        { name: 'Villainess', slug: 'villainess' },
        { name: 'Visual Arts', slug: 'visual-arts' },
        { name: 'Workplace', slug: 'workplace' },
      ];

      res.json({
        success: true,
        total: genres.length,
        genres: genres.map(g => ({
          ...g,
          endpoint: `/category/genre/${g.slug}`,
          sourceUrl: `https://watchanimeworld.one/category/genre/${g.slug}/`
        }))
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ScraperController();
