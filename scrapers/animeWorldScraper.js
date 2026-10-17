const cheerio = require('cheerio');
const config = require('../config');

function normalizeUrl(url, base = config.animeWorldIndiaUrl) {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http')) return url;
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

/**
 * Trims base URL and leading/trailing slashes to produce a clean relative ID
 * Example: "https://watchanimeworld.one/series/tokyo-revengers/" -> "series/tokyo-revengers"
 */
function extractIdFromUrl(url, base = config.animeWorldIndiaUrl) {
  if (!url) return '';
  let id = url.trim();
  const cleanBase = (base || '').replace(/\/+$/, '');
  if (id.startsWith(cleanBase)) {
    id = id.slice(cleanBase.length);
  } else {
    try {
      const parsed = new URL(id);
      id = parsed.pathname;
    } catch {
      // already path
    }
  }
  return id.replace(/^\/+|\/+$/g, '');
}

function cleanTitle(str) {
  if (!str) return '';
  return str.replace(/^Image\s+/i, '').replace(/\s+/g, ' ').trim();
}

function parseCard($, el, baseUrl = config.animeWorldIndiaUrl) {
  const $el = $(el);
  const a = $el.is('a') ? $el : $el.find('a.lnk-blk, a').first();
  const title = cleanTitle(
    $el.find('.entry-title, h2, h3, .title').first().text() ||
    $el.find('img').attr('alt') ||
    a.attr('title') ||
    ''
  );
  const href = normalizeUrl(a.attr('href'), baseUrl);
  const id = extractIdFromUrl(href, baseUrl);
  const imgEl = $el.find('img').first();
  const image = normalizeUrl(imgEl.attr('data-src') || imgEl.attr('src'), baseUrl);
  const season = $el.find('.post-ql').first().text().trim() || null;
  const episode = $el.find('.year, .ep, .episode').first().text().trim() || null;

  return {
    title,
    id,
    image,
    ...(season ? { season } : {}),
    ...(episode ? { episode } : {})
  };
}

class AnimeWorldScraper {
  /**
   * Parse complete AnimeWorld India homepage into all 10 requested sections
   * using relative IDs instead of full URLs
   */
  parseHomePage(html, baseUrl = config.animeWorldIndiaUrl) {
    const $ = cheerio.load(html);

    // 1. Franchise
    const franchise = [];
    const seenFranchise = new Set();
    $('#block-10 a, a[href*="/category/franchise/"]').each((_, el) => {
      const href = normalizeUrl($(el).attr('href'), baseUrl);
      const id = extractIdFromUrl(href, baseUrl);
      if (!id || seenFranchise.has(id)) return;
      seenFranchise.add(id);
      const img = normalizeUrl($(el).find('img').attr('data-src') || $(el).find('img').attr('src'), baseUrl);
      const slug = id.split('/').filter(Boolean).pop();
      const rawName = cleanTitle($(el).find('img').attr('alt') || $(el).text()) || slug;
      const name = rawName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      franchise.push({ name, slug, id, image: img });
    });

    // 2. Newest Drops
    const newestDrops = [];
    $('#widget_list_episodes-5 article.post, [id*="list_episodes"] article.post').each((_, el) => {
      const card = parseCard($, el, baseUrl);
      if (card.title && card.id) newestDrops.push(card);
    });

    // 3. Network
    const network = [];
    const seenNetwork = new Set();
    $('#block-21 a, a[href*="/category/network/"]').each((_, el) => {
      const href = normalizeUrl($(el).attr('href'), baseUrl);
      const id = extractIdFromUrl(href, baseUrl);
      if (!id || seenNetwork.has(id)) return;
      seenNetwork.add(id);
      const img = normalizeUrl($(el).find('img').attr('data-src') || $(el).find('img').attr('src'), baseUrl);
      const slug = id.split('/').filter(Boolean).pop();
      const rawName = cleanTitle($(el).find('img').attr('alt') || $(el).text()) || slug;
      const name = rawName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      network.push({ name, slug, id, image: img });
    });

    // 4. Languages
    const languages = [];
    const seenLanguages = new Set();
    $('#block-32 a, a[href*="/category/language/"]').each((_, el) => {
      const href = normalizeUrl($(el).attr('href'), baseUrl);
      const id = extractIdFromUrl(href, baseUrl);
      if (!id || seenLanguages.has(id)) return;
      seenLanguages.add(id);
      const img = normalizeUrl($(el).find('img').attr('data-src') || $(el).find('img').attr('src'), baseUrl);
      const slug = id.split('/').filter(Boolean).pop();
      const rawName = cleanTitle($(el).find('img').attr('alt') || $(el).text()) || slug;
      const name = rawName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      languages.push({ name, slug, id, image: img });
    });

    // 5. Most Popular Shows
    const mostPopular = [];
    const seenPopular = new Set();
    $('#torofilm_wdgt_popular-3 .item__card, #torofilm_wdgt_popular-3 a.lnk-blk').each((_, el) => {
      const href = normalizeUrl($(el).attr('href'), baseUrl);
      const id = extractIdFromUrl(href, baseUrl);
      if (!id || seenPopular.has(id)) return;
      seenPopular.add(id);
      const img = normalizeUrl($(el).find('img').attr('data-src') || $(el).find('img').attr('src'), baseUrl);
      const title = cleanTitle($(el).find('img').attr('alt') || $(el).attr('title'));
      if (title) mostPopular.push({ title, id, image: img });
    });

    // 6. Airing / New Anime Arrivals
    const airing = [];
    $('#widget_list_movies_series-2 article.post').each((_, el) => {
      const card = parseCard($, el, baseUrl);
      if (card.title && card.id) airing.push(card);
    });

    // 7. Cartoons
    const cartoons = [];
    $('#widget_list_movies_series-8 article.post').each((_, el) => {
      const card = parseCard($, el, baseUrl);
      if (card.title && card.id) cartoons.push(card);
    });

    // 8. Most Popular Movies
    const mostPopularMovies = [];
    const seenPopMovies = new Set();
    $('#torofilm_wdgt_popular-5 .item__card, #torofilm_wdgt_popular-5 a.lnk-blk').each((_, el) => {
      const href = normalizeUrl($(el).attr('href'), baseUrl);
      const id = extractIdFromUrl(href, baseUrl);
      if (!id || seenPopMovies.has(id)) return;
      seenPopMovies.add(id);
      const img = normalizeUrl($(el).find('img').attr('data-src') || $(el).find('img').attr('src'), baseUrl);
      const title = cleanTitle($(el).find('img').attr('alt') || $(el).attr('title'));
      if (title) mostPopularMovies.push({ title, id, image: img });
    });

    // 9. Latest Anime Movies
    const latestAnimeMovies = [];
    $('#widget_list_movies_series-4 article.post').each((_, el) => {
      const card = parseCard($, el, baseUrl);
      if (card.title && card.id) latestAnimeMovies.push(card);
    });

    // 10. Latest Cartoon Movies
    const latestCartoonMovies = [];
    $('#widget_list_movies_series-11 article.post').each((_, el) => {
      const card = parseCard($, el, baseUrl);
      if (card.title && card.id) latestCartoonMovies.push(card);
    });

    return {
      franchise,
      "newest-drops": newestDrops,
      network,
      languages,
      "most-popular": mostPopular,
      airing,
      cartoons,
      "most-popular-movies": mostPopularMovies,
      "latest anime movies": latestAnimeMovies,
      "latest-anime-movies": latestAnimeMovies,
      "latest cartoon movies": latestCartoonMovies,
      "latest-cartoon-movies": latestCartoonMovies
    };
  }

  /**
   * Parse complete Anime Details including synopsis, poster, metadata,
   * seasons list, and all episodes per season
   */
  async parseAnimeDetailsWithSeasons(html, pageUrl, fetchSeasonAjaxFn) {
    const $ = cheerio.load(html);
    const id = extractIdFromUrl(pageUrl);

    // Title & Synopsis
    const title = cleanTitle($('h1.entry-title, h1').first().text());
    const synopsis = $('.description p, .description, .entry-content p, .synopsis p')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    // Poster & Banner
    let posterImg = $('h1.entry-title').closest('div').find('img').first();
    if (!posterImg.length || (posterImg.attr('src') || '').includes('logo') || (posterImg.attr('src') || '').includes('SiteTitle')) {
      posterImg = $('img[alt^="Image "], .post-thumbnail img, .thumb img, .poster img')
        .not('[src*="logo"]')
        .not('[src*="SiteTitle"]')
        .first();
    }
    const poster = normalizeUrl(posterImg.attr('src') || posterImg.attr('data-src'));

    const bannerImg = $('.bghd img, .bgft img').first();
    const banner = normalizeUrl(bannerImg.attr('src') || bannerImg.attr('data-src'));

    // Rating
    const ratingText = $('.post-ql, .vote, .rating, .dtl-rating').first().text().trim();
    const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
    const rating = ratingMatch ? ratingMatch[1] : null;

    // Genres
    const genres = [];
    $('a[href*="/category/genre/"]').each((_, el) => {
      const g = $(el).text().trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    // Languages / Audio Dubs
    const languages = [];
    $('a[href*="/category/language/"]').each((_, el) => {
      const lang = $(el).text().trim();
      if (lang && !languages.includes(lang)) languages.push(lang);
    });

    // Networks
    const networks = [];
    $('a[href*="/category/network/"]').each((_, el) => {
      const net = $(el).text().trim() || $(el).attr('href').split('/').filter(Boolean).pop();
      if (net && !networks.includes(net)) networks.push(net);
    });

    // Detected Seasons from .choose-season
    const seasonTabs = [];
    const seenSeasons = new Set();
    $('.choose-season .sel-temp a, .choose-season a, [data-season]').each((_, el) => {
      const sNum = $(el).attr('data-season');
      const post = $(el).attr('data-post') || $('article[id*="post-"]').attr('id')?.replace(/\D+/g, '') || $('input[name="post_id"]').val();
      if (!sNum || seenSeasons.has(sNum)) return;
      seenSeasons.add(sNum);
      const sName = $(el).text().trim() || `Season ${sNum}`;
      seasonTabs.push({ season: parseInt(sNum, 10), post, name: sName });
    });

    // Pre-extract any episodes directly present on initial page HTML (e.g. active season)
    const mainPageEpisodes = [];
    const seenMain = new Set();
    $('#episode_by_temp article.post, ul.post-lst article.post, a[href*="/episode/"]').each((_, el) => {
      const $el = $(el);
      const a = $el.is('a') ? $el : $el.find('a.lnk-blk, a[href*="/episode/"]').first();
      const href = a.attr('href');
      if (!href || seenMain.has(href)) return;
      seenMain.add(href);

      const epId = extractIdFromUrl(href);
      const epTitle = cleanTitle($el.find('.entry-title, h2, h3').text()) || cleanTitle(a.attr('title'));
      const epImg = normalizeUrl($el.find('img').attr('data-src') || $el.find('img').attr('src'));
      const numMatch = epId.match(/(?:(\d+)x)?(\d+)/);
      const sNum = numMatch && numMatch[1] ? parseInt(numMatch[1], 10) : null;
      const epNum = numMatch && numMatch[2] ? parseInt(numMatch[2], 10) : mainPageEpisodes.length + 1;

      mainPageEpisodes.push({
        season: sNum,
        episode: epNum,
        title: epTitle || `Episode ${epNum}`,
        id: epId,
        link: href ? normalizeUrl(href) : null,
        url: href ? normalizeUrl(href) : null,
        image: epImg || null
      });
    });

    // Extract episodes:
    let seasonsData = [];

    if (seasonTabs.length > 0 && typeof fetchSeasonAjaxFn === 'function') {
      // Fetch episodes for all seasons in parallel
      seasonsData = await Promise.all(
        seasonTabs.map(async (s) => {
          try {
            const rawAjaxHtml = await fetchSeasonAjaxFn(s.season, s.post);
            const $s = cheerio.load(rawAjaxHtml);
            const episodes = [];
            const seen = new Set();

            $s('article.post, .item, li').each((_, el) => {
              const a = $s(el).find('a.lnk-blk, a[href*="/episode/"]').first();
              const href = a.attr('href');
              if (!href || seen.has(href)) return;
              seen.add(href);

              const epId = extractIdFromUrl(href);
              const epTitle = cleanTitle($s(el).find('.entry-title, h2, h3').text());
              const epImg = normalizeUrl($s(el).find('img').attr('data-src') || $s(el).find('img').attr('src'));
              const numMatch = epId.match(/(\d+)x(\d+)/);
              const epNum = numMatch ? parseInt(numMatch[2], 10) : episodes.length + 1;

              episodes.push({
                episode: epNum,
                title: epTitle || `Episode ${epNum}`,
                id: epId,
                link: href ? normalizeUrl(href) : null,
                url: href ? normalizeUrl(href) : null,
                image: epImg || null
              });
            });

            // If ajax returned no episodes, fallback to main page episodes matching this season
            if (episodes.length === 0 && mainPageEpisodes.length > 0) {
              const matching = mainPageEpisodes.filter(e => e.season === s.season || (!e.season && s.season === 1));
              if (matching.length > 0) {
                episodes.push(...matching);
              }
            }

            return {
              season: s.season,
              name: s.name,
              title: s.name,
              episodesCount: episodes.length,
              episodes
            };
          } catch (e) {
            console.warn(`[Scraper] Season ${s.season} AJAX error:`, e.message);
            const matching = mainPageEpisodes.filter(e => e.season === s.season || (!e.season && s.season === 1));
            return {
              season: s.season,
              name: s.name,
              title: s.name,
              episodesCount: matching.length,
              episodes: matching
            };
          }
        })
      );
    } else {
      // Single season or direct episodes list on page
      const episodes = mainPageEpisodes.length > 0 ? mainPageEpisodes : [];
      seasonsData = [
        {
          season: 1,
          name: 'Season 1',
          title: 'Season 1',
          episodesCount: episodes.length,
          episodes
        }
      ];
    }

    // Recommended / Related series on this page
    const related = [];
    const seenRelated = new Set();
    const recommendedSection = $('section, .widget').filter((_, el) => {
      const heading = $(el).find('h2, h3, .widget-title, .caption').text().toLowerCase();
      return heading.includes('recommended') || heading.includes('related');
    });

    const targetRelatedArticles = recommendedSection.length > 0
      ? recommendedSection.find('article.post')
      : $('.widget_list_movies_series article.post');

    targetRelatedArticles.each((_, el) => {
      const card = parseCard($, el, config.animeWorldIndiaUrl);
      if (card.title && card.id && card.id !== id && !card.id.startsWith('episode/') && !seenRelated.has(card.id)) {
        seenRelated.add(card.id);
        related.push(card);
      }
    });

    const totalEpisodes = seasonsData.reduce((acc, s) => acc + s.episodesCount, 0);

    return {
      id,
      title,
      synopsis,
      image: poster,
      banner: banner || null,
      rating,
      genres,
      languages,
      networks,
      totalSeasons: seasonsData.length,
      totalEpisodes,
      seasons: seasonsData,
      related: related.slice(0, 12)
    };
  }

  /**
   * Parse anime cards from search or catalog pages
   */
  parseCatalog(html, baseUrl = config.animeWorldIndiaUrl) {
    const $ = cheerio.load(html);
    const results = [];

    $('article, .bsx, .animposx, .film-item, .post-item, .item').each((_, el) => {
      const card = parseCard($, el, baseUrl);
      if (card.title && card.id) {
        results.push(card);
      }
    });

    return results;
  }

  /**
   * Parse episode streaming page:
   * Extracts anime series info, running episode, next/prev episodes,
    * dub-player stream ID (trimmed from /dub-player/t/{id}/), and other player sources.
   */
  parseEpisodePage(html, pageUrl, extraData = {}) {
    const $ = cheerio.load(html);
    const id = extractIdFromUrl(pageUrl);
    const cleanId = id.replace(/^episode\//, '');

    // 1. Extract Stream ID / Abyss ID from dub-player iframe (/dub-player/t/{streamId}/)
    let streamId = null;
    let dubPlayerRawSrc = null;

    $('iframe').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src') || '';
      const match = src.match(/\/dub-player\/t\/(\d+)\/?/i);
      if (match && match[1]) {
        streamId = match[1];
        dubPlayerRawSrc = src;
      }
    });

    // Fallback: regex search on raw HTML if iframe attributes didn't match
    if (!streamId) {
      const htmlMatch = html.match(/\/dub-player\/t\/(\d+)\/?/i);
      if (htmlMatch && htmlMatch[1]) {
        streamId = htmlMatch[1];
        dubPlayerRawSrc = `/dub-player/t/${streamId}/`;
      }
    }

    const hasDubPlayer = Boolean(streamId);

    // 2. Extract Other Video Players (e.g. Zephyrix)
    const otherPlayers = [];
    $('iframe').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !src.includes('/dub-player/')) {
        if (src.startsWith('//')) src = `https:${src}`;
        else if (src.startsWith('/')) src = normalizeUrl(src);

        let name = 'Main Player';
        if (src.includes('zephyrix')) name = 'Zephyrix HD (Recommended)';
        else if (src.includes('synthnova')) name = 'Synthnova';
        else if (src.includes('ravok.buzz')) name = 'PlayX (Ravok)';
        else name = `Server ${otherPlayers.length + 1}`;

        otherPlayers.push({
          name,
          embedUrl: src,
          proxyUrl: `/api/v1/animeworldin/player/proxy/url=${src}`
        });
      }
    });

    // 3. Extract playXID (either passed from AnimeSalt scrape or extracted from page/otherPlayers)
    let playXID = (extraData && extraData.playXID) ? extraData.playXID : null;
    if (!playXID) {
      playXID = this.extractPlayXId(html);
    }
    if (!playXID && otherPlayers.length > 0) {
      for (const p of otherPlayers) {
        const pMatch = (p.embedUrl || '').match(/\/video\/([a-zA-Z0-9_-]+)/i);
        if (pMatch && pMatch[1]) {
          playXID = pMatch[1];
          break;
        }
      }
    }

    // 3. Extract Titles & Season / Episode Numbers
    // Parse Season & Episode numbers from cleanId first (most reliable source of truth)
    const numMatch = cleanId.match(/(\d+)x(\d+)/i) || cleanId.match(/season-(\d+)-episode-(\d+)/i) || cleanId.match(/episode-(\d+)/i);
    const season = numMatch && numMatch[1] ? parseInt(numMatch[1], 10) : 1;
    const episodeNum = numMatch && numMatch[2] ? parseInt(numMatch[2], 10) : (numMatch && numMatch[1] && !cleanId.includes('x') ? parseInt(numMatch[1], 10) : 1);

    const rawHeading = cleanTitle($('h1.entry-title, .data h1, .epheader h1, h1').first().text()) || cleanTitle($('h2.entry-title, .entry-title').first().text()) || cleanTitle($('title').text().split('-')[0]);

    // 4. Extract Anime Series Information & Poster
    let seriesUrl = null;
    let seriesId = null;
    let seriesTitle = '';

    const seriesLink = $('a[href*="/series/"]').not('[href$="/series/"]').first();
    if (seriesLink.length > 0) {
      seriesUrl = normalizeUrl(seriesLink.attr('href'));
      seriesId = extractIdFromUrl(seriesUrl);
      const text = cleanTitle(seriesLink.text());
      seriesTitle = (text && text.toLowerCase() !== 'seasons' && text.toLowerCase() !== 'series' && text.toLowerCase() !== 'homecoming') ? text : '';
    }

    if (!seriesTitle && seriesId) {
      const slug = seriesId.replace(/^series\//, '').replace(/\/+$/, '');
      seriesTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    if (!seriesTitle) {
      seriesTitle = rawHeading.replace(/\s*\d+x\d+.*$/i, '').replace(/Episode\s*\d+.*$/i, '').trim();
    }

    if (!seriesId && seriesTitle) {
      seriesId = `series/${seriesTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }

    const posterImg = $('.thumb img, .poster img, .entry-content img, .post-thumbnail img').first();
    const poster = normalizeUrl(posterImg.attr('src') || posterImg.attr('data-src'));

    // 5. Extract Episodes Lineup to determine Next & Previous Episode
    const episodesList = [];
    const seenEp = new Set();

    $('article.post, article.episodes, .episodes-list li, .post-lst li').each((_, el) => {
      const a = $(el).find('a[href*="/episode/"]').first();
      const href = a.attr('href');
      if (!href) return;
      const epId = extractIdFromUrl(href);
      if (!epId || !epId.startsWith('episode/')) return;

      const numText = $(el).find('.num-epi').text().trim();
      const epTitle = cleanTitle($(el).find('.entry-title, h2, h3').text()) || cleanTitle(a.attr('title')) || epId.split('/').pop();
      const img = normalizeUrl($(el).find('.post-thumbnail img, figure img, img').first().attr('src') || $(el).find('.post-thumbnail img, figure img, img').first().attr('data-src'));

      const epMatch = numText.match(/(?:(\d+)x)?(\d+)/) || epId.match(/(?:(\d+)x)?(\d+)/);
      const epN = epMatch && epMatch[2] ? parseInt(epMatch[2], 10) : episodesList.length + 1;
      const sN = epMatch && epMatch[1] ? parseInt(epMatch[1], 10) : season;

      if (seenEp.has(epId)) {
        const existing = episodesList.find(e => e.id === epId);
        if (existing && !existing.image && img) {
          existing.image = img;
        }
        return;
      }
      seenEp.add(epId);

      episodesList.push({
        id: epId,
        episode: epN,
        season: sN,
        title: epTitle,
        image: img || null
      });
    });

    // Fallback if no structured articles found
    if (episodesList.length === 0) {
      $('a[href*="/episode/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        const epId = extractIdFromUrl(href);
        if (!epId || !epId.startsWith('episode/') || seenEp.has(epId)) return;
        seenEp.add(epId);

        const epTitle = cleanTitle($(el).text()) || epId.split('/').pop();
        const epMatch = epId.match(/(?:(\d+)x)?(\d+)/);
        const epN = epMatch && epMatch[2] ? parseInt(epMatch[2], 10) : episodesList.length + 1;
        const sN = epMatch && epMatch[1] ? parseInt(epMatch[1], 10) : season;

        episodesList.push({
          id: epId,
          episode: epN,
          season: sN,
          title: epTitle,
          image: null
        });
      });
    }

    // Sort lineup chronologically by season and episode number
    episodesList.sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.episode - b.episode;
    });

    // Locate current running episode in lineup
    const currentCanonicalId = `episode/${cleanId}`;
    const currentIndex = episodesList.findIndex(e => e.id === currentCanonicalId || e.id === id);

    let nextEpisode = null;
    let prevEpisode = null;

    if (currentIndex !== -1) {
      if (currentIndex + 1 < episodesList.length) {
        nextEpisode = episodesList[currentIndex + 1];
      }
      if (currentIndex > 0) {
        prevEpisode = episodesList[currentIndex - 1];
      }
    } else if (episodesList.length > 0) {
      const foundIdx = episodesList.findIndex(e => e.episode === episodeNum && e.season === season);
      if (foundIdx !== -1) {
        if (foundIdx + 1 < episodesList.length) nextEpisode = episodesList[foundIdx + 1];
        if (foundIdx > 0) prevEpisode = episodesList[foundIdx - 1];
      }
    }

    let serversEndpoint = null;
    if (streamId && playXID) {
      serversEndpoint = `/stream/servers/?playXID=${encodeURIComponent(playXID)}&abyssId=${encodeURIComponent(streamId)}`;
    } else if (streamId) {
      serversEndpoint = `/stream/servers/${streamId}`;
    } else if (playXID) {
      serversEndpoint = `/stream/servers/?playXID=${encodeURIComponent(playXID)}`;
    }

    // Construct verified canonical episode title
    let canonicalEpisodeTitle = rawHeading || `Episode ${episodeNum}`;
    const matchedFromList = episodesList.find(e => e.id === currentCanonicalId || (e.season === season && e.episode === episodeNum));
    if (matchedFromList && matchedFromList.title && !matchedFromList.title.toLowerCase().startsWith('season')) {
      canonicalEpisodeTitle = matchedFromList.title;
    } else if (seriesTitle && (canonicalEpisodeTitle.includes('1x1') && episodeNum !== 1)) {
      canonicalEpisodeTitle = `${seriesTitle} ${season}x${episodeNum}`;
    } else if (seriesTitle && !canonicalEpisodeTitle.includes(`${season}x${episodeNum}`) && !canonicalEpisodeTitle.includes(`Episode ${episodeNum}`)) {
      canonicalEpisodeTitle = `${seriesTitle} ${season}x${episodeNum}`;
    }

    return {
      episodeId: currentCanonicalId,
      title: canonicalEpisodeTitle,
      runningEpisode: {
        episode: episodeNum,
        season,
        title: canonicalEpisodeTitle,
        id: currentCanonicalId
      },
        nextEpisode: nextEpisode ? {
          id: nextEpisode.id,
          episode: nextEpisode.episode,
          season: nextEpisode.season,
          title: nextEpisode.title
        } : null,
        prevEpisode: prevEpisode ? {
          id: prevEpisode.id,
          episode: prevEpisode.episode,
          season: prevEpisode.season,
          title: prevEpisode.title
        } : null,
        streamInfo: {
          hasDubPlayer,
          abyssId: streamId || null,
          playXID: playXID || null,
          streamId: streamId || null,
          dubPlayerSrc: dubPlayerRawSrc || null,
          message: hasDubPlayer ? null : 'No episode sources found',
          serversEndpoint
        },
        abyssId: streamId || null,
        playXID: playXID || null,
      anime: {
        id: seriesId,
        title: seriesTitle,
        url: seriesUrl,
        image: poster || null
      },
      otherPlayers,
      totalEpisodesInView: episodesList.length,
      episodesList: episodesList.slice(0, 100)
    };
  }

  /**
   * Extract playXID from HTML (e.g. from animesalt.cx raw response)
   * Finds <iframe src="https://ravok.buzz/video/{id}" ...> and trims out the video ID.
   */
  extractPlayXId(html) {
    if (!html || typeof html !== 'string') return null;
    try {
      const $ = cheerio.load(html);
      let playXId = null;

      // 1. Look for iframe with src or data-src pointing to ravok.buzz/video/
      $('iframe').each((_, el) => {
        if (playXId) return;
        const src = $(el).attr('src') || $(el).attr('data-src') || '';
        const match = src.match(/ravok\.buzz\/video\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) {
          playXId = match[1];
        }
      });

      // 2. Look for any iframe with /video/{id}
      if (!playXId) {
        $('iframe').each((_, el) => {
          if (playXId) return;
          const src = $(el).attr('src') || $(el).attr('data-src') || '';
          const match = src.match(/\/video\/([a-zA-Z0-9_-]+)/i);
          if (match && match[1] && !src.includes('player.php')) {
            playXId = match[1];
          }
        });
      }

      // 3. Fallback: regex search on raw HTML string
      if (!playXId) {
        const rawMatch = html.match(/ravok\.buzz\/video\/([a-zA-Z0-9_-]+)/i)
          || html.match(/https?:\/\/[^\s"'<>]+\/video\/([a-zA-Z0-9_-]{16,64})/i);
        if (rawMatch && rawMatch[1]) {
          playXId = rawMatch[1];
        }
      }

      return playXId;
    } catch {
      return null;
    }
  }

  /**
   * Parse dub player HTML page to extract CONFIG and build streaming servers & languages
   */
  parseDubPlayerConfig(html, streamId) {
    if (!html || typeof html !== 'string') {
      throw new Error('Empty response from dub player page');
    }

    const configMatch = html.match(/var\s+CONFIG\s*=\s*({[\s\S]*?});/);
    if (!configMatch) {
      throw new Error('Could not find CONFIG object in dub player HTML');
    }

    let configObj;
    try {
      configObj = JSON.parse(configMatch[1]);
    } catch (err) {
      throw new Error(`Failed to parse CONFIG JSON: ${err.message}`);
    }

    const ready = configObj.ready || {};
    const langMeta = configObj.lang || {};

    const languages = [];
    for (const [code, streamKey] of Object.entries(ready)) {
      if (!streamKey) continue;
      const meta = langMeta[code] || {};
      const langName = meta.name || code.toUpperCase();
      const shortCode = meta.short || code.toUpperCase();

      languages.push({
        language: langName,
        code,
        short: shortCode,
        video_id: streamKey
      });
    }

    // Default primary language: Hindi (if available, otherwise first)
    const hindiLang = languages.find(l => l.code === 'hin' || l.language.toLowerCase() === 'hindi') || languages[0] || null;

    const servers = [
      {
        serverName: 'abyss',
        server: 'ABYSS',
        languages
      }
    ];

    return {
      streamId: String(streamId || ''),
      abyssId: String(streamId || ''),
      title: configObj.title || '',
      season: configObj.season || 1,
      episode: configObj.episode || 1,
      targetOrigin: configObj.targetOrigin || 'https://watchanimeworld.one',
      servers,
      defaultSource: hindiLang ? {
        serverName: 'abyss',
        language: hindiLang.language,
        video_id: hindiLang.video_id
      } : null
    };
  }

  /**
   * Parse movie details page:
   * Extracts metadata, poster, banner, direct stream ID from dub-player,
   * multi-audio player decode (from player1.php?data=...), and all player iframes.
   */
  parseMoviePage(html, pageUrl) {
    const $ = cheerio.load(html);
    const id = extractIdFromUrl(pageUrl);

    // 1. Title & Synopsis
    const title = cleanTitle($('h1.entry-title, h1').first().text()) || cleanTitle($('title').text().split('-')[0]);
    const synopsis = $('.description p, .synopsis p, .entry-content p')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim();

    // 2. Poster & Banner
    let posterImg = $('h1.entry-title').closest('div').find('img').first();
    if (!posterImg.length || (posterImg.attr('src') || '').includes('logo') || (posterImg.attr('src') || '').includes('SiteTitle')) {
      posterImg = $('img[alt^="Image "], .post-thumbnail img, .thumb img, .poster img')
        .not('[src*="logo"]')
        .not('[src*="SiteTitle"]')
        .first();
    }
    const poster = normalizeUrl(posterImg.attr('src') || posterImg.attr('data-src'));

    const bannerImg = $('.bghd img, .bgft img').first();
    const banner = normalizeUrl(bannerImg.attr('src') || bannerImg.attr('data-src'));

    // 3. Rating & Metadata
    const ratingText = $('.post-ql, .vote, .rating, .dtl-rating').first().text().trim();
    const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
    const rating = ratingMatch ? ratingMatch[1] : null;

    const genres = [];
    $('a[href*="/category/genre/"]').each((_, el) => {
      const g = $(el).text().trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    const languages = [];
    $('a[href*="/category/language/"]').each((_, el) => {
      const lang = $(el).text().trim();
      if (lang && !languages.includes(lang)) languages.push(lang);
    });

    const releaseYear = $('.release, .year, .date').first().text().trim() || null;

    // 4. Stream ID from dub-player iframe (if present)
    let streamId = null;
    let dubPlayerRawSrc = null;

    $('iframe').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src') || '';
      const match = src.match(/\/dub-player\/t\/(\d+)\/?/i);
      if (match && match[1]) {
        streamId = match[1];
        dubPlayerRawSrc = src;
      }
    });

    if (!streamId) {
      const htmlMatch = html.match(/\/dub-player\/t\/(\d+)\/?/i);
      if (htmlMatch && htmlMatch[1]) {
        streamId = htmlMatch[1];
        dubPlayerRawSrc = `/dub-player/t/${streamId}/`;
      }
    }

    const hasDubPlayer = Boolean(streamId);

    // 5. Multi-Audio Player Decode (watchanimeworld.top/api/player1.php?data=...)
    let multiAudioPlayers = [];
    $('iframe').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src') || '';
      if (src.includes('player1.php') && src.includes('data=')) {
        try {
          const match = src.match(/data=([^&]+)/);
          if (match && match[1]) {
            const rawDecoded = decodeURIComponent(match[1]);
            const jsonText = Buffer.from(rawDecoded, 'base64').toString('utf8');
            const parsed = JSON.parse(jsonText);
            if (Array.isArray(parsed)) {
              multiAudioPlayers = parsed.map(item => ({
                language: item.language || 'Unknown',
                sourceUrl: item.link || '',
                proxyUrl: item.link ? `/api/v1/animeworldin/player/proxy/url=${item.link}` : null
              }));
            }
          }
        } catch (e) {
          // ignore decode error
        }
      }
    });

    // 6. Other video players (Zephyrix, etc.)
    const players = [];
    $('iframe').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        if (src.startsWith('//')) src = `https:${src}`;
        else if (src.startsWith('/')) src = normalizeUrl(src);

        let name = 'Main Player';
        if (src.includes('zephyrix')) name = 'Zephyrix HD (Recommended)';
        else if (src.includes('dub-player')) name = 'Dub Audio Player';
        else if (src.includes('player1.php')) name = 'Multi-Audio Player';
        else if (src.includes('synthnova')) name = 'Synthnova';
        else name = `Server ${players.length + 1}`;

        players.push({
          name,
          embedUrl: src,
          proxyUrl: `/api/v1/animeworldin/player/proxy/url=${src}`
        });
      }
    });

    // 7. Related movies
    const related = [];
    const seenRelated = new Set();
    $('article.post').each((_, el) => {
      const card = parseCard($, el, config.animeWorldIndiaUrl);
      if (card.title && card.id && card.id !== id && !seenRelated.has(card.id)) {
        seenRelated.add(card.id);
        related.push(card);
      }
    });

    return {
      id,
      title,
      synopsis,
      image: poster,
      banner: banner || null,
      rating,
      genres,
      languages,
      releaseYear,
      isMovie: true,
      streamInfo: {
        hasDubPlayer,
        abyssId: streamId || null,
        playXID: null,
        streamId: streamId || null,
        dubPlayerSrc: dubPlayerRawSrc || null,
        message: hasDubPlayer ? null : (multiAudioPlayers.length > 0 ? 'Multi-audio sources available directly' : 'No dub-player source found'),
        serversEndpoint: streamId ? `/stream/servers/${streamId}` : null
      },
      abyssId: streamId || null,
      playXID: null,
      multiAudioPlayers,
      players,
      related: related.slice(0, 10)
    };
  }

  /**
   * Parse listing page with full pagination:
   * Supports Search, Letters (A-Z), Networks, Languages, Franchises, Series, and Categories.
   */
  parseListingPage(html, currentUrl, requestedPage = 1) {
    const $ = cheerio.load(html);
    const results = [];
    const seen = new Set();

    $('article.post, .film-item, .bsx, .animposx, .item').each((_, el) => {
      const card = parseCard($, el, config.animeWorldIndiaUrl);
      if (card.title && card.id && !seen.has(card.id)) {
        seen.add(card.id);
        results.push(card);
      }
    });

    let currentPage = parseInt(requestedPage, 10) || 1;
    let totalPages = currentPage;
    let hasNextPage = false;
    let nextPage = null;

    const pageNumbers = [];
    $('.nav-links a, .nav-links span, .pagination a, .pagination span, .wp-pagenavi a, .wp-pagenavi span, .page-numbers').each((_, el) => {
      const text = $(el).text().trim();
      const num = parseInt(text, 10);
      if (!isNaN(num) && num > 0) {
        pageNumbers.push(num);
      }
      if ($(el).hasClass('current')) {
        if (!isNaN(num)) currentPage = num;
      }
    });

    if (pageNumbers.length > 0) {
      totalPages = Math.max(...pageNumbers);
    }

    const nextEl = $('a:contains("NEXT"), a:contains("Next"), a.next, .nav-links a.next').first();
    if (nextEl.length > 0) {
      hasNextPage = true;
      nextPage = currentPage + 1;
    } else if (currentPage < totalPages) {
      hasNextPage = true;
      nextPage = currentPage + 1;
    }

    return {
      currentPage,
      nextPage: hasNextPage ? nextPage : null,
      totalPages,
      hasNextPage,
      totalResults: results.length,
      results
    };
  }

  /**
   * Parse search suggestions from admin-ajax.php action_tr_search_suggest HTML
   */
  parseSearchSuggestions(html) {
    if (!html || typeof html !== 'string') return [];
    const $ = cheerio.load(html);
    const suggestions = [];

    $('li.fa-play-circle a, li a').not('#more-shm').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.includes('javascript:')) return;
      const typeSpan = $(el).find('span').first();
      const type = typeSpan.text().trim() || 'anime';
      typeSpan.remove();
      const title = cleanTitle($(el).text());
      const id = extractIdFromUrl(href, config.animeWorldIndiaUrl);

      if (title && id) {
        suggestions.push({
          id,
          title,
          type,
          url: normalizeUrl(href, config.animeWorldIndiaUrl)
        });
      }
    });

    return suggestions;
  }
}

module.exports = new AnimeWorldScraper();
