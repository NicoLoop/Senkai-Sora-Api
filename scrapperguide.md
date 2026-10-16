# 📚 Anime Stream Hindi — Comprehensive Scraper & API Guide

A complete technical reference for all scraping and extraction endpoints in the Anime Stream Hindi API. This guide details how to retrieve anime catalog feeds, comprehensive anime series details, multi-season episode lists, episode streaming servers (Abyss & PlayX multi-audio), standalone movies, full-text search, and taxonomies.

---

## 📑 Table of Contents

1. [Base Configuration & Conventions](#base-configuration--conventions)
2. [1. Home Feed & Spotlight Hero](#1-home-feed--spotlight-hero)
3. [2. Anime Information & Seasons Guide](#2-anime-information--seasons-guide)
4. [3. Episode Details & Stream Identifiers](#3-episode-details--stream-identifiers)
5. [4. Streaming Servers & Multi-Audio Decodes](#4-streaming-servers--multi-audio-decodes)
6. [5. Standalone Movies](#5-standalone-movies)
7. [6. Full Search & Autocomplete Suggestions](#6-full-search--autocomplete-suggestions)
8. [7. A – Z Alphabetical Listing](#7-a--z-alphabetical-listing)
9. [8. Taxonomy & Category Listings](#8-taxonomy--category-listings)
10. [9. Genres & Categories Reference](#9-genres--categories-reference)
11. [10. Direct Stream Extractor & Player Proxy](#10-direct-stream-extractor--player-proxy)
12. [11. Iframe Bypassing Proxy](#11-iframe-bypassing-proxy)
13. [TypeScript Types & Interfaces](#typescript-types--interfaces)

---

## Base Configuration & Conventions

- **Base URL (Local API):** `http://localhost:5000`
- **Prefixes:** Most endpoints can be called directly (e.g., `/animeinfo/:id`) or with the versioned prefix `/api/v1/animeworldin/:endpoint`.
- **Target Upstream:** `https://watchanimeworld.one/` (Configured via `ANIME_WORLD_INDIA_URL`)
- **Authentication:** Scraper endpoints do not require auth tokens; an optional `API_KEY` can be configured in `.env`.
- **In-Memory Caching:** All scrapers feature a 3-minute in-memory cache. Append `?refresh=true` to any query to force a live scrape.

---

## 1. Home Feed & Spotlight Hero

Retrieves the entire curated homepage parsed into 10 structured sections plus an enriched `spotlight` hero carousel containing wide 1280px landscape banners.

### HTTP Request
```http
GET /api/v1/animeworldin/home
GET /home
```

### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refresh` | `boolean` | No | Pass `true` to bypass the 3-minute in-memory cache and fetch fresh data. |

### Example
```bash
curl -s "http://localhost:5000/api/v1/animeworldin/home"
```

### Response Payload Structure
```json
{
  "success": true,
  "cached": false,
  "targetUrl": "https://watchanimeworld.one/",
  "elapsedMs": 412,
  "data": {
    "spotlight": [
      {
        "id": "series/jujutsu-kaisen",
        "title": "Jujutsu Kaisen",
        "banner": "https://image.tmdb.org/t/p/w1280/gmECkn137FpnVJnxdQI8EypzbSJ.jpg",
        "image": "https://image.tmdb.org/t/p/w500/hD8pZ5VvYFwE2l1e8yB5Vv.jpg",
        "synopsis": "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself...",
        "rating": "8.6",
        "genres": ["Action", "Fantasy", "Supernatural"],
        "season": "Season 2",
        "languages": ["Hindi", "English", "Japanese"]
      }
    ],
    "franchise": [
      {
        "name": "Dragon Ball",
        "slug": "dragon-ball",
        "id": "category/franchise/dragon-ball",
        "image": "https://watchanimeworld.one/wp-content/uploads/..."
      }
    ],
    "newest-drops": [
      {
        "title": "Solo Leveling Episode 12",
        "id": "episode/solo-leveling-1x12",
        "image": "https://watchanimeworld.one/wp-content/uploads/...",
        "season": "Season 1",
        "episode": "12"
      }
    ],
    "network": [
      {
        "name": "Crunchyroll",
        "slug": "crunchyroll",
        "id": "category/network/crunchyroll",
        "image": "https://watchanimeworld.one/wp-content/uploads/..."
      }
    ],
    "languages": [
      {
        "name": "Hindi Dub",
        "slug": "hindi",
        "id": "category/language/hindi"
      }
    ],
    "most-popular": [ ... ],
    "airing": [ ... ],
    "cartoons": [ ... ],
    "most-popular-movies": [ ... ],
    "latest-anime-movies": [ ... ],
    "latest-cartoon-movies": [ ... ]
  }
}
```

---

## 2. Anime Information & Seasons Guide

Fetches full series metadata (poster, synopsis, rating, release year, genres, audio languages, studio) and stitches **all seasons and episode listings** into a single structured response by automatically resolving season tabs via upstream AJAX.

### HTTP Request
```http
GET /animeinfo/{id}
GET /api/v1/animeworldin/animeinfo/{id}
GET /details/{id}
```

### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Slug or relative path of the anime (e.g. `series/arifureta-from-commonplace-to-worlds-strongest` or `naruto-shippuden`). |

### Example
```bash
curl -s "http://localhost:5000/animeinfo/series/arifureta-from-commonplace-to-worlds-strongest"
```

### Response Payload Structure
```json
{
  "success": true,
  "cached": false,
  "id": "series/arifureta-from-commonplace-to-worlds-strongest",
  "targetUrl": "https://watchanimeworld.one/series/arifureta-from-commonplace-to-worlds-strongest/",
  "data": {
    "id": "series/arifureta-from-commonplace-to-worlds-strongest",
    "title": "Arifureta: From Commonplace to World's Strongest",
    "nativeTitle": "ありふれた職業で世界最強",
    "synopsis": "Seventeen-year-old Hajime Nagumo is your average, everyday otaku...",
    "image": "https://watchanimeworld.one/wp-content/uploads/2021/05/arifureta.jpg",
    "rating": "7.2",
    "status": "Ongoing",
    "releaseYear": "2019",
    "type": "TV Series",
    "genres": ["Action", "Adventure", "Fantasy", "Harem", "Isekai"],
    "languages": ["Hindi", "English", "Japanese"],
    "totalSeasons": 3,
    "totalEpisodes": 39,
    "seasons": [
      {
        "seasonNumber": 1,
        "seasonTitle": "Season 1",
        "totalEpisodes": 13,
        "episodes": [
          {
            "episodeNumber": "1",
            "title": "The Monster of the Abyss",
            "id": "episode/arifureta-from-commonplace-to-worlds-strongest-1x1",
            "image": "https://watchanimeworld.one/wp-content/uploads/...",
            "releaseDate": "July 8, 2019"
          },
          {
            "episodeNumber": "2",
            "title": "Pandora's Box",
            "id": "episode/arifureta-from-commonplace-to-worlds-strongest-1x2",
            "image": "https://watchanimeworld.one/wp-content/uploads/...",
            "releaseDate": "July 15, 2019"
          }
        ]
      },
      {
        "seasonNumber": 2,
        "seasonTitle": "Season 2",
        "totalEpisodes": 13,
        "episodes": [ ... ]
      }
    ]
  }
}
```

---

## 3. Episode Details & Stream Identifiers

Parses an episode page to retrieve running episode numbers, series backlink, next/previous episode navigation, and crucially extracts the stream identifiers:
- `abyssId`: Numeric ID for the Abyss multi-audio dub player (e.g. `8545`).
- `playXID`: 32-character hexadecimal video token for PlayX / Ravok direct HLS streams (e.g. `b51a15f382ac914391a58850ab343b00`).

### HTTP Request
```http
GET /episode/{id}
GET /api/v1/animeworldin/episode/{id}
```

### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Episode slug with or without `episode/` prefix (e.g. `fullmetal-alchemist-brotherhood-1x1` or `episode/naruto-shippuden-1x1`). |

### Example
```bash
curl -s "http://localhost:5000/episode/fullmetal-alchemist-brotherhood-1x1"
```

### Response Payload Structure
```json
{
  "success": true,
  "cached": false,
  "episodeId": "episode/fullmetal-alchemist-brotherhood-1x1",
  "targetUrl": "https://watchanimeworld.one/episode/fullmetal-alchemist-brotherhood-1x1/",
  "data": {
    "episodeId": "episode/fullmetal-alchemist-brotherhood-1x1",
    "title": "Fullmetal Alchemist: Brotherhood 1x1",
    "episodeTitle": "Fullmetal Alchemist",
    "season": "1",
    "episode": "1",
    "series": {
      "title": "Fullmetal Alchemist: Brotherhood",
      "id": "series/fullmetal-alchemist-brotherhood",
      "endpoint": "/animeinfo/series/fullmetal-alchemist-brotherhood"
    },
    "streamInfo": {
      "hasDubPlayer": true,
      "streamId": "8545",
      "abyssId": "8545",
      "playXID": "b51a15f382ac914391a58850ab343b00",
      "serversEndpoint": "/stream/servers/?playXID=b51a15f382ac914391a58850ab343b00&abyssId=8545"
    },
    "navigation": {
      "previousEpisode": null,
      "nextEpisode": {
        "title": "Episode 2",
        "id": "episode/fullmetal-alchemist-brotherhood-1x2",
        "endpoint": "/episode/fullmetal-alchemist-brotherhood-1x2"
      }
    },
    "players": [
      {
        "name": "Dub Audio Player",
        "embedUrl": "https://watchanimeworld.one/dub-player/t/8545/",
        "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://watchanimeworld.one/dub-player/t/8545/"
      },
      {
        "name": "Zephyrix HD (Recommended)",
        "embedUrl": "https://play.zephyrix.org/video/64c32b8eb5304d80ba093227975ece13",
        "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://play.zephyrix.org/video/64c32b8eb5304d80ba093227975ece13"
      }
    ]
  }
}
```

---

## 4. Streaming Servers & Multi-Audio Decodes

Decodes the underlying stream servers for both **Abyss Player** and **PlayX (Ravok)**. Returns multi-language audio tracks (Hindi, Tamil, Telugu, English, Japanese) with direct source URLs and proxied player embeds.

### HTTP Request
```http
GET /stream/servers/{streamId}
GET /stream/servers/?abyssId={abyssId}&playXID={playXID}
GET /api/v1/animeworldin/stream/servers/{streamId}
```

### Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `streamId` / `abyssId` | `string` | Conditional | Numeric ID from episode stream info (e.g. `8545`). |
| `playXID` | `string` | Conditional | 32-character video hash from episode stream info (e.g. `b51a15f382ac914391a58850ab343b00`). |

*(At least one of `abyssId` or `playXID` must be provided)*

### Example
```bash
curl -s "http://localhost:5000/stream/servers/?playXID=b51a15f382ac914391a58850ab343b00&abyssId=8545"
```

### Response Payload Structure
```json
{
  "success": true,
  "cached": false,
  "streamId": "8545",
  "abyssId": "8545",
  "playXID": "b51a15f382ac914391a58850ab343b00",
  "data": {
    "title": "Demon Slayer - S1 E1",
    "season": 1,
    "episode": 1,
    "defaultSource": {
      "serverName": "abyss",
      "language": "Hindi",
      "streamUrl": "https://player.abyssplayer.com/4VL4zDfX7"
    },
    "servers": [
      {
        "serverName": "abyss",
        "server": "Abyss",
        "languages": [
          {
            "language": "Hindi",
            "code": "hin",
            "short": "HIN",
            "video_id": "4VL4zDfX7",
            "streamUrl": "https://player.abyssplayer.com/4VL4zDfX7",
            "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://player.abyssplayer.com/4VL4zDfX7"
          },
          {
            "language": "English",
            "code": "eng",
            "short": "ENG",
            "video_id": "8KL1aZkP9",
            "streamUrl": "https://player.abyssplayer.com/8KL1aZkP9",
            "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://player.abyssplayer.com/8KL1aZkP9"
          },
          {
            "language": "Japanese",
            "code": "jpn",
            "short": "JPN",
            "video_id": "9MZ3bXvT2",
            "streamUrl": "https://player.abyssplayer.com/9MZ3bXvT2",
            "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://player.abyssplayer.com/9MZ3bXvT2"
          }
        ]
      },
      {
        "serverName": "playx",
        "server": "PlayX",
        "hls": true,
        "streamUrl": "https://ravok.buzz/cdn/hls/9e2bab25af3748251148d6078918ab0e/master.m3u8?md5=...&expires=...",
        "languages": [
          {
            "language": "multi",
            "code": "multi",
            "short": "MULTI",
            "video_id": "b51a15f382ac914391a58850ab343b00",
            "streamUrl": "https://ravok.buzz/cdn/hls/9e2bab25af3748251148d6078918ab0e/master.m3u8?md5=...&expires=...",
            "hls": true
          }
        ]
      }
    ]
  }
}
```

---

## 5. Standalone Movies

Feature films do not have multi-season episode lists. This endpoint extracts the movie poster, banner, synopsis, and direct multi-audio players in a single call.

### HTTP Request
```http
GET /movie/{id}
GET /movies/{id}
GET /api/v1/animeworldin/movie/{id}
```

### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Movie slug with or without `movies/` prefix (e.g. `your-name` or `movies/jujutsu-kaisen-0`). |

### Example
```bash
curl -s "http://localhost:5000/movie/your-name"
```

### Response Payload Structure
```json
{
  "success": true,
  "movieId": "movies/your-name",
  "data": {
    "id": "movies/your-name",
    "title": "Your Name.",
    "synopsis": "High schoolers Mitsuha and Taki are complete strangers living separate lives...",
    "image": "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
    "banner": "https://image.tmdb.org/t/p/w1280/8x9iKH8kWA0zdkgNdpAew7OstYe.jpg",
    "rating": "8.4",
    "genres": ["Drama", "Romance", "Supernatural"],
    "languages": ["Hindi", "English", "Japanese"],
    "releaseYear": "2016",
    "isMovie": true,
    "multiAudioPlayers": [
      {
        "language": "Hindi",
        "sourceUrl": "https://short.icu/Ygwkuw1ea",
        "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://short.icu/Ygwkuw1ea"
      },
      {
        "language": "Japanese",
        "sourceUrl": "https://short.icu/QtONOff32",
        "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://short.icu/QtONOff32"
      }
    ],
    "players": [
      {
        "name": "Zephyrix HD (Recommended)",
        "embedUrl": "https://play.zephyrix.org/video/46a731f4af282372a4097ba1e4d76b95",
        "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://play.zephyrix.org/video/46a731f4af282372a4097ba1e4d76b95"
      }
    ]
  }
}
```

---

## 6. Full Search & Autocomplete Suggestions

### 6.1 Full Catalog Search with Pagination

Searches across all anime, series, and movies with complete pagination metadata (`currentPage`, `nextPage`, `totalPages`, `hasNextPage`).

#### HTTP Request
```http
GET /search?s={query}&page={page}
GET /api/v1/animeworldin/search?s={query}&page={page}
```

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `s` / `q` | `string` | **Yes** | Search keyword or title phrase (e.g. `naruto`, `solo leveling`). |
| `page` | `integer`| No | Page number (defaults to `1`). |

#### Example
```bash
curl -s "http://localhost:5000/search?s=demon+slayer&page=1"
```

#### Response Example
```json
{
  "success": true,
  "query": "demon slayer",
  "currentPage": 1,
  "nextPage": 2,
  "totalPages": 3,
  "hasNextPage": true,
  "totalResults": 10,
  "results": [
    {
      "title": "Demon Slayer: Kimetsu no Yaiba",
      "id": "series/demon-slayer-kimetsu-no-yaiba",
      "image": "https://watchanimeworld.one/wp-content/uploads/...",
      "season": "Season 1",
      "episode": "26 Episodes"
    }
  ]
}
```

---

### 6.2 Instant Search Suggestions (Autocomplete)

Ultra-fast typeahead autocomplete powered by upstream `action_tr_search_suggest`.

#### HTTP Request
```http
GET /search-suggestion?term={query}
GET /search-suggest?term={query}
POST /search-suggestion (body: { "term": "naruto" })
```

#### Example
```bash
curl -s "http://localhost:5000/search-suggestion?term=attack"
```

#### Response Example
```json
{
  "success": true,
  "term": "attack",
  "totalResults": 3,
  "suggestions": [
    {
      "title": "Attack on Titan",
      "id": "series/attack-on-titan",
      "image": "https://watchanimeworld.one/wp-content/uploads/...",
      "extra": "TV Series"
    },
    {
      "title": "Attack on Titan: The Final Season",
      "id": "series/attack-on-titan-the-final-season",
      "image": "https://watchanimeworld.one/wp-content/uploads/...",
      "extra": "TV Series"
    }
  ]
}
```

---

## 7. A – Z Alphabetical Listing

Browses all anime titles starting with a specific letter or numeric character (`0-9`).

### HTTP Request
```http
GET /letter/{letter}?page={page}
GET /az-list/{letter}?page={page}
```

### Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `letter` | `string` | **Yes** | Single character `a` through `z` or `0-9` (or `#`). |

### Example
```bash
curl -s "http://localhost:5000/letter/d?page=1"
```

---

## 8. Taxonomy & Category Listings

All category listings automatically paginate and return structured card items.

| Category Type | Endpoint Pattern | Working Example |
| :--- | :--- | :--- |
| **TV Networks** | `GET /network/{networkName}?page={n}` | `GET /network/cartoon-network` |
| **Audio Languages** | `GET /language/{languageName}?page={n}`| `GET /language/hindi` |
| **Franchises** | `GET /franchise/{franchiseName}?page={n}`| `GET /franchise/pokemon` |
| **All Series** | `GET /series?page={n}` | `GET /series?page=1` |
| **All Movies** | `GET /movies?page={n}` | `GET /movies?page=1` |
| **Anime Catalog** | `GET /category/anime?page={n}` | `GET /category/anime` |
| **Cartoon Catalog**| `GET /category/cartoon?page={n}` | `GET /category/cartoon` |
| **Anime Movies** | `GET /category/type/anime?type=movies` | `GET /category/type/anime?type=movies` |
| **Cartoon Series** | `GET /category/type/cartoon?type=series`| `GET /category/type/cartoon?type=series` |

### Standard Category Response Example
```json
{
  "success": true,
  "path": "category/network/cartoon-network",
  "currentPage": 1,
  "nextPage": 2,
  "totalPages": 5,
  "hasNextPage": true,
  "totalResults": 12,
  "results": [
    {
      "title": "Ben 10: Omniverse",
      "id": "series/ben-10-omniverse",
      "image": "https://watchanimeworld.one/wp-content/uploads/...",
      "season": "Season 8"
    }
  ]
}
```

---

## 9. Genres & Categories Reference

Returns a complete master list of all 77 available anime genres with their URL slugs.

### HTTP Request
```http
GET /genres
GET /categories
```

### Example
```bash
curl -s "http://localhost:5000/genres"
```

---

## 10. Direct Stream Extractor & Player Proxy

Extracts the raw HLS `.m3u8` master playlist, auto-converted WebVTT subtitles, and intro/outro timestamps directly from Ravok / PlayX (`https://ravok.buzz/video/:id`).

> [!NOTE]
> Ravok uses Nginx Secure Link MD5 tokens bound to the requesting IP. To prevent `403 Forbidden` errors, extraction is executed via the dedicated proxy server (`env.abyss_proxy_url`), allowing Video.js to play without interruptions.

### 10.1 Video Data Extraction
```http
GET /api/player/data/{videoId}
```
*Example:* `GET http://localhost:5000/api/player/data/b51a15f382ac914391a58850ab343b00`

### 10.2 HLS Stream Proxy
```http
GET {abyss_proxy_url}/player/stream/proxy?url={m3u8Url}&videoId={videoId}
```

### 10.3 Disguised Subtitle to WebVTT Proxy
```http
GET {abyss_proxy_url}/player/subtitle/proxy?url={subtitleJpgUrl}
```

---

## 11. Iframe Bypassing Proxy

For third-party embed players (Zephyrix, Abyss Player, Synthnova) that set `X-Frame-Options: SAMEORIGIN` or CSP `frame-ancestors 'self'`, this proxy strips restrictive headers and disables window frame-busting scripts.

### HTTP Request
```http
GET /api/v1/animeworldin/player/proxy/url={encodedVideoUrl}
GET /api/v1/animeworldin/player/proxy?url={encodedVideoUrl}
```

### HTML Embedding Example
```html
<iframe
  src="http://localhost:5000/api/v1/animeworldin/player/proxy/url=https://player.abyssplayer.com/4VL4zDfX7"
  width="100%"
  height="100%"
  allowfullscreen
  frameborder="0"
  allow="encrypted-media; autoplay">
</iframe>
```

---

## TypeScript Types & Interfaces

```typescript
// Standard Card Item (Listings, Search, Drops)
export interface AnimeCard {
  title: string;
  id: string; // e.g. "series/jujutsu-kaisen" or "episode/naruto-1x1"
  image: string;
  season?: string;
  episode?: string;
}

// Spotlight Hero Item
export interface SpotlightHeroItem extends AnimeCard {
  banner: string; // High-res 1280px backdrop
  synopsis: string;
  rating: string;
  genres: string[];
  languages?: string[];
}

// Full Anime Details
export interface AnimeDetails {
  id: string;
  title: string;
  nativeTitle?: string;
  synopsis: string;
  image: string;
  rating: string;
  status: string;
  releaseYear: string;
  type: string;
  genres: string[];
  languages: string[];
  totalSeasons: number;
  totalEpisodes: number;
  seasons: Array<{
    seasonNumber: number;
    seasonTitle: string;
    totalEpisodes: number;
    episodes: Array<{
      episodeNumber: string;
      title: string;
      id: string;
      image: string;
      releaseDate?: string;
    }>;
  }>;
}

// Episode Details & Stream Info
export interface EpisodeDetails {
  episodeId: string;
  title: string;
  episodeTitle: string;
  season: string;
  episode: string;
  series: {
    title: string;
    id: string;
    endpoint: string;
  };
  streamInfo: {
    hasDubPlayer: boolean;
    streamId: string | null;
    abyssId: string | null;
    playXID: string | null;
    serversEndpoint: string | null;
  };
  navigation: {
    previousEpisode: { title: string; id: string; endpoint: string } | null;
    nextEpisode: { title: string; id: string; endpoint: string } | null;
  };
  players: Array<{
    name: string;
    embedUrl: string;
    proxyUrl: string;
  }>;
}

// Streaming Server Decodes
export interface StreamServersResponse {
  streamId: string;
  abyssId: string | null;
  playXID: string | null;
  title: string;
  season: number;
  episode: number;
  defaultSource: {
    serverName: string;
    language: string;
    streamUrl: string;
  } | null;
  servers: Array<{
    serverName: string;
    server: string;
    hls?: boolean;
    streamUrl?: string;
    languages: Array<{
      language: string;
      code: string;
      short: string;
      video_id: string;
      streamUrl: string;
      proxyUrl?: string;
      hls?: boolean;
    }>;
  }>;
}

// Paginated Listing Response (Search, Letters, Taxonomies)
export interface PaginatedListingResponse<T = AnimeCard> {
  success: boolean;
  currentPage: number;
  nextPage: number | null;
  totalPages: number;
  hasNextPage: boolean;
  totalResults: number;
  results: T[];
}
```
