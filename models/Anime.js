/**
 * Anime & Streaming Data Models
 */

class AnimeModel {
  constructor({
    id,
    title,
    originalTitle = '',
    slug = '',
    poster = '',
    backdrop = '',
    synopsis = '',
    genres = [],
    rating = 'N/A',
    year = new Date().getFullYear(),
    status = 'Ongoing',
    episodes = [],
    sourceUrl = ''
  }) {
    this.id = id || slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    this.title = title;
    this.originalTitle = originalTitle;
    this.slug = slug;
    this.poster = poster;
    this.backdrop = backdrop;
    this.synopsis = synopsis;
    this.genres = genres;
    this.rating = rating;
    this.year = year;
    this.status = status;
    this.episodes = episodes;
    this.sourceUrl = sourceUrl;
    this.createdAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      originalTitle: this.originalTitle,
      poster: this.poster,
      backdrop: this.backdrop,
      synopsis: this.synopsis,
      genres: this.genres,
      rating: this.rating,
      year: this.year,
      status: this.status,
      episodesCount: this.episodes.length,
      episodes: this.episodes,
      sourceUrl: this.sourceUrl
    };
  }
}

class EpisodeModel {
  constructor({ number, title, url, servers = [] }) {
    this.number = number;
    this.title = title || `Episode ${number}`;
    this.url = url;
    this.servers = servers;
  }
}

class StreamServerModel {
  constructor({ name, embedUrl, proxyUrl = null }) {
    this.name = name;
    this.embedUrl = embedUrl;
    this.proxyUrl = proxyUrl;
  }
}

module.exports = {
  AnimeModel,
  EpisodeModel,
  StreamServerModel
};
