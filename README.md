# 🎬 Anime Stream Hindi — Scraper & Video Proxy API

A high-performance Express.js API designed for streaming anime and cartoons with regional Hindi, Tamil, Telugu, English, and Japanese multi-audio dubs. It provides dynamic scraping of catalog metadata, multi-season episode lists, standalone movies, instant search autocomplete, and an iframe proxy that strips restrictive headers (`X-Frame-Options`, CSP `frame-ancestors`) to seamlessly embed video players inside modern web apps.

---

## ⚡ Core Capabilities

- **🎬 Direct HLS Video Stream Extractor & Video.js Proxy:** Reverse-engineers underlying hosts (such as **Ravok** / `ravok.buzz` / PlayX) to extract raw master HLS playlists (`.m3u8`), subtitle files disguised as `.jpg`, and intro/outro timestamps for custom **Video.js** / **Hls.js** integration.
- **🛡️ Secure IP-Bound Token Proxy & Auto-Healing:** Resolves Nginx Secure Link MD5 client-IP binding issues by executing stream token requests directly on the dedicated proxy (`env.abyss_proxy_url`), with automatic 403 token refresh and segment rewriting.
- **💬 Disguised Subtitle to WebVTT Converter:** Automatically intercepts disguised `.jpg` SubRip subtitle files, normalizes timestamps, and transforms them into valid `text/vtt` for native browser captioning.
- **📺 Video Player Iframe Proxy:** Bypasses `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'`, and `window.top` frame-busting scripts from video hosts such as **Zephyrix** (`play.zephyrix.org`), **Abyss Player** (`player.abyssplayer.com`), and **Synthnova**.
- **🌟 Curated Home Feed with Spotlight:** Returns all 10 homepage sections plus a high-res `spotlight` hero carousel where only spotlight items include wide landscape `banner` backdrops.
- **🔄 Multi-Season Episode Extractor:** Intercepts AJAX season selectors (`action_select_season`) to fetch and stitch complete multi-season episode guides in a single call.
- **⚡ Stream ID & Multi-Audio Extractor:** Extracts the underlying `streamId` from `/dub-player/t/{id}/` iframes and decodes multi-language audio stream URLs directly.
- **🔍 Full Search & Instant Autocomplete:** Native full-text search with pagination metadata (`currentPage`, `nextPage`, `totalPages`, `hasNextPage`) and instant typeahead suggestions via `action_tr_search_suggest`.
- **🔤 Alphabetical & Category Browsing:** A–Z listings (`/letter/:letter`), Networks (`/network/:id`), Languages (`/language/:id`), Franchises (`/franchise/:id`), Series, Cartoons, and Type filters.
- **⚡ In-Memory Caching & Resiliency:** Fast memory caching (3-minute TTL) on all scrapers with fallback defaults to prevent site downtime.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- npm or yarn

### Installation
```bash
cd api
npm install
```

### Environment Configuration
Create a `.env` file in the `api` root directory:
```env
PORT=5000
NODE_ENV=development

# Target Scraper Base URL
ANIME_WORLD_INDIA_URL=https://watchanimeworld.one/

# Request Settings
SCRAPER_TIMEOUT_MS=15000
API_KEY=ash_live_k82f9d1e4c3a0b57e62a9b

# Dedicated Stream Proxy Server (Required for HLS stream proxying & IP-bound token extraction)
abyss_proxy_url=https://abyss-proxies-production.up.railway.app
NEXT_PUBLIC_ABYSS_PROXY_URL=https://abyss-proxies-production.up.railway.app
```

### Running Locally
```bash
# Development mode with Nodemon (auto-reloading)
npm run dev

# Production mode
npm start
```

Base API URL: `http://localhost:5000`

---

## 📑 Complete API Endpoints Reference

### Table of Contents
1. [System & Developer Dashboards](#1-system--developer-dashboards)
2. [Home Feed & Spotlight](#2-home-feed--spotlight)
3. [Anime Details & Seasons Guide](#3-anime-details--seasons-guide)
4. [Episode Details & Stream Info](#4-episode-details--stream-info)
5. [Streaming Servers & Multi-Audio Tracks](#5-streaming-servers--multi-audio-tracks)
6. [Standalone Movies](#6-standalone-movies)
7. [Search & Autocomplete Suggestions](#7-search--autocomplete-suggestions)
8. [A – Z Alphabetical Listing](#8-a--z-alphabetical-listing)
9. [Taxonomy & Category Listings](#9-taxonomy--category-listings)
10. [Video Player Iframe Proxy](#10-video-player-iframe-proxy)
11. [Direct Video Stream Extractor & Video.js HLS Proxy (Ravok / PlayX)](#11-direct-video-stream-extractor--videojs-hls-proxy-ravok--playx)
    - [🧠 Architecture & Ravok Obfuscation Breakdown](#-architecture--how-ravok-obfuscation-works)
    - [🛡️ The IP-Binding Token Security Feature (403 Forbidden Resolved)](#%EF%B8%8F-the-ip-binding-security-feature-why-local-extraction-fails-with-403)
    - [🚀 How to Get the Video Stream Link (Step-by-Step)](#-how-to-get-the-video-stream-link-step-by-step)
    - [📡 Endpoints Reference](#-endpoints-reference)
    - [📊 Complete JSON Response Schema](#-complete-json-response-schema)
    - [💬 Subtitle WebVTT Conversion](#-subtitle-handling--on-the-fly-webvtt-conversion)
    - [⏩ Intro & Outro Auto-Skip Integration](#-intro--outro-auto-skip-integration)
    - [💻 Video.js Frontend Integration Code Examples](#-frontend-integration-examples)

---

### 1. System & Developer Dashboards

#### 🔹 API Sitemap & Service Overview
```http
GET /
```
Returns a JSON sitemap listing all active endpoints and system configurations.

#### 🔹 Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-14T12:00:00.000Z",
  "service": "Anime Stream Hindi API & Proxy",
  "config": {
    "port": 5000,
    "animeWorldIndiaUrl": "https://watchanimeworld.one/",
    "apiKeyConfigured": true
  }
}
```

#### 🔹 In-Browser Developer Tools
Open these directly in any web browser for interactive debugging:
- **Scraper HTML Extractor:** `http://localhost:5000/dev/extract`
- **Iframe Proxy Live Tester:** `http://localhost:5000/dev/iframe`

---

### 2. Home Feed & Spotlight

Fetches the complete categorized homepage feed with all 10 sections and the featured `spotlight` collection.

```http
GET /api/v1/animeworldin/home
GET /home
GET /api/home
```

#### Query Parameters:
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refresh` | boolean | No | Set `true` to bypass the 3-minute in-memory cache |

> [!NOTE]
> The `banner` property is **strictly present only on items inside `spotlight`**. All other sections (`most-popular`, `newest-drops`, `airing`, etc.) contain only standard poster `image` properties.

#### Response Example:
```json
{
  "success": true,
  "cached": false,
  "data": {
    "spotlight": [
      {
        "id": "series/solo-leveling",
        "title": "Solo Leveling",
        "banner": "https://image.tmdb.org/t/p/w1280/8j8kuMcdJKMVFoNJysNlXFDjY7s.jpg",
        "image": "https://image.tmdb.org/t/p/w500/rsOApVLbIQEcNkqSlOxNPyg3FyI.jpg",
        "synopsis": "In a world where hunters must battle deadly monsters...",
        "rating": "8.7",
        "genres": ["Action", "Adventure", "Fantasy"],
        "season": "Season 2",
        "languages": ["Hindi", "English", "Japanese"]
      }
    ],
    "franchise": [
      {
        "name": "Pokemon",
        "slug": "pokemon",
        "id": "category/franchise/pokemon",
        "image": "https://watchanimeworld.one/wp-content/..."
      }
    ],
    "newest-drops": [
      {
        "title": "Arifureta: From Commonplace to World's Strongest",
        "id": "series/arifureta-from-commonplace-to-worlds-strongest",
        "image": "https://image.tmdb.org/t/p/w500/...",
        "season": "Season 3",
        "episode": "EP:1-16"
      }
    ],
    "network": [ ... ],
    "languages": [ ... ],
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

### 3. Anime Details & Seasons Guide

Returns full series metadata, synopsis, audio dub languages, genres, rating, banner, and **all seasons with all episodes** (automatically queries secondary seasons via AJAX).

```http
GET /animeinfo/{id}
GET /api/animeinfo/{id}
GET /api/v1/animeworldin/animeinfo/{id}
```

#### Path Parameters:
- `id` *(string, required)*: Anime series slug (e.g. `series/arifureta-from-commonplace-to-worlds-strongest` or `series/solo-leveling`)

#### Example:
```http
GET http://localhost:5000/animeinfo/series/arifureta-from-commonplace-to-worlds-strongest
```

#### Response Example:
```json
{
  "success": true,
  "id": "series/arifureta-from-commonplace-to-worlds-strongest",
  "data": {
    "id": "series/arifureta-from-commonplace-to-worlds-strongest",
    "title": "Arifureta: From Commonplace to World's Strongest",
    "synopsis": "Seventeen-year-old Hajime Nagumo is your average, everyday otaku...",
    "image": "https://image.tmdb.org/t/p/w500/...",
    "banner": "https://image.tmdb.org/t/p/w1280/1lL1ts7dzTUp0eOTHvMqfw6zFJn.jpg",
    "rating": "8.1",
    "genres": ["Action", "Adventure", "Fantasy"],
    "languages": ["Hindi", "English", "Japanese"],
    "networks": ["AT-X", "Tokyo MX"],
    "totalSeasons": 3,
    "totalEpisodes": 42,
    "seasons": [
      {
        "season": 1,
        "name": "Season 1",
        "episodesCount": 13,
        "episodes": [
          {
            "episode": 1,
            "title": "The Monster of the Abyss",
            "id": "episode/arifureta-from-commonplace-to-worlds-strongest-1x1",
            "image": "https://img.watchanimeworld.one/img/thumb_2066_s1e1.webp"
          }
        ]
      }
    ],
    "related": [ ... ]
  }
}
```

---

### 4. Episode Details & Stream Info

Scrapes an episode page, extracts the parent anime series information, identifies the running episode, computes next and previous episodes in strict chronological order, and extracts the **`streamId`** from `<iframe data-src="/dub-player/t/{streamId}/">`.

```http
GET /episode/{id}
GET /api/episode/{id}
GET /api/v1/animeworldin/episode/{id}
```

#### Path Parameters:
- `id` *(string, required)*: Episode slug with or without `episode/` prefix (e.g. `fullmetal-alchemist-brotherhood-1x1` or `episode/fullmetal-alchemist-brotherhood-1x1`)

#### Example:
```http
GET http://localhost:5000/episode/fullmetal-alchemist-brotherhood-1x1
```

#### Response Example:
```json
{
  "success": true,
  "episodeId": "episode/fullmetal-alchemist-brotherhood-1x1",
  "data": {
    "episodeId": "episode/fullmetal-alchemist-brotherhood-1x1",
    "title": "Fullmetal Alchemist: Brotherhood 1x1",
    "runningEpisode": {
      "episode": 1,
      "season": 1,
      "title": "Fullmetal Alchemist: Brotherhood 1x1",
      "id": "episode/fullmetal-alchemist-brotherhood-1x1"
    },
    "nextEpisode": {
      "id": "episode/fullmetal-alchemist-brotherhood-1x2",
      "episode": 2,
      "season": 1,
      "title": "fullmetal-alchemist-brotherhood-1x2"
    },
    "prevEpisode": null,
    "streamInfo": {
      "hasDubPlayer": true,
      "streamId": "18620",
      "dubPlayerSrc": "/dub-player/t/18620/",
      "message": null,
      "serversEndpoint": "/stream/servers/18620"
    },
    "anime": {
      "id": "series/fullmetal-alchemist-brotherhood",
      "title": "Fullmetal Alchemist: Brotherhood",
      "url": "https://watchanimeworld.one/series/fullmetal-alchemist-brotherhood/",
      "image": "https://img.watchanimeworld.one/img/thumb_1723_s1e1.webp"
    },
    "otherPlayers": [
      {
        "name": "Zephyrix HD (Recommended)",
        "embedUrl": "https://play.zephyrix.org/video/64c32b8eb5304d80ba093227975ece13",
        "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://play.zephyrix.org/video/64c32b8eb5304d80ba093227975ece13"
      }
    ],
    "totalEpisodesInView": 64
  }
}
```

*(If an episode has no dub player, `streamInfo` automatically responds with:)*
```json
"streamInfo": {
  "hasDubPlayer": false,
  "streamId": null,
  "dubPlayerSrc": null,
  "message": "No episode sources found",
  "serversEndpoint": null
}
```

---

### 5. Streaming Servers & Multi-Audio Tracks

Extracts the embedded JavaScript `CONFIG` object from `https://watchanimeworld.one/dub-player/t/{streamId}/` and resolves streaming URLs for all audio languages on the **Abyss Player** network.

```http
GET /stream/servers/{streamId}
GET /api/stream/servers/{streamId}
GET /api/v1/animeworldin/stream/servers/{streamId}
```

#### Path Parameters:
- `streamId` *(string/number, required)*: The numeric stream ID extracted from `/episode/{id}` (e.g. `18620`)

#### Example:
```http
GET http://localhost:5000/stream/servers/18620
```

#### Response Example:
```json
{
  "success": true,
  "streamId": "18620",
  "data": {
    "streamId": "18620",
    "title": "Fullmetal Alchemist: Brotherhood",
    "season": 1,
    "episode": 1,
    "targetOrigin": "https://watchanimeworld.one",
    "servers": [
      {
        "serverName": "abyss",
        "server": "ABYSS",
        "languages": [
          {
            "language": "Hindi",
            "code": "hin",
            "short": "HI",
            "video_id": "4VL4zDfX7"
          },
          {
            "language": "Tamil",
            "code": "tam",
            "short": "TA",
            "video_id": "Mroc0-082M"
          },
          {
            "language": "Telugu",
            "code": "tel",
            "short": "TE",
            "video_id": "oDh3Hl4X0"
          },
          {
            "language": "English",
            "code": "eng",
            "short": "EN",
            "video_id": "SOtgCy3hI"
          },
          {
            "language": "Japanese",
            "code": "jpn",
            "short": "JA",
            "video_id": "KPwvpKLL6"
          }
        ]
      }
    ],
    "defaultSource": {
      "serverName": "abyss",
      "language": "Hindi",
      "video_id": "4VL4zDfX7"
    }
  }
}
```

---

### 6. Standalone Movies

Movies are single-unit feature films. This endpoint extracts the movie metadata, poster, banner, and streaming sources directly on the same page without requiring a secondary episode call.

```http
GET /movie/{id}
GET /api/movie/{id}
GET /movies/{id}
```

#### Path Parameters:
- `id` *(string, required)*: Movie slug with or without `movies/` prefix (e.g. `your-name`, `movies/your-name`, or `movies/jujutsu-kaisen-0`)

#### Example:
```http
GET http://localhost:5000/movie/your-name
```

#### Response Example:
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
    "genres": ["Award Winning", "Drama", "Romance"],
    "languages": ["Hindi", "English", "Japanese"],
    "releaseYear": "2016",
    "isMovie": true,
    "streamInfo": {
      "hasDubPlayer": false,
      "streamId": null,
      "message": "Multi-audio sources available directly",
      "serversEndpoint": null
    },
    "multiAudioPlayers": [
      {
        "language": "Hindi",
        "sourceUrl": "https://short.icu/Ygwkuw1ea",
        "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://short.icu/Ygwkuw1ea"
      },
      {
        "language": "English",
        "sourceUrl": "https://short.icu/I8aSFkcqS",
        "proxyUrl": "/api/v1/animeworldin/player/proxy/url=https://short.icu/I8aSFkcqS"
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

### 7. Search & Autocomplete Suggestions

#### 🔹 Full Search with Pagination
Searches across series and movies, returning complete pagination metadata.

```http
GET /search?s={query}&page={page}
GET /api/search?s={query}&page={page}
```

#### Query Parameters:
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `s` | string | Yes | — | Search term (e.g. `naruto`, `solo`, `a`) |
| `page` | number | No | `1` | Page number |

#### Example:
```http
GET http://localhost:5000/search?s=a&page=2
```

#### Response Example:
```json
{
  "success": true,
  "query": "a",
  "currentPage": 2,
  "nextPage": 3,
  "totalPages": 47,
  "hasNextPage": true,
  "totalResults": 10,
  "results": [
    {
      "title": "Attack on Titan",
      "id": "series/attack-on-titan",
      "image": "https://image.tmdb.org/t/p/w500/...",
      "season": "Final Season",
      "episode": "EP:1-28"
    }
  ]
}
```

#### 🔹 Instant Search Autocomplete
Provides instant typeahead suggestions for search bars via WordPress AJAX backend.

```http
GET /search-suggestion?term={query}
POST /search-suggestion (Body: { "term": "solo" })
GET /search-suggest?term={query}
```

#### Example:
```http
GET http://localhost:5000/search-suggestion?term=solo
```

#### Response Example:
```json
{
  "success": true,
  "term": "solo",
  "totalResults": 1,
  "suggestions": [
    {
      "id": "series/solo-leveling",
      "title": "Solo Leveling",
      "type": "series",
      "url": "https://watchanimeworld.one/series/solo-leveling/"
    }
  ]
}
```

---

### 8. A – Z Alphabetical Listing

Browses anime titles starting with a specific letter or number.

```http
GET /letter/{letter}?page={page}
GET /az-list/{letter}?page={page}
```

#### Path Parameters:
- `letter` *(string, required)*: Any letter `a` through `z`, or `0-9` (or `#` for numbers).

#### Query Parameters:
- `page` *(number, optional)*: Page number (default: `1`)

#### Example:
```http
GET http://localhost:5000/letter/a?page=1
GET http://localhost:5000/letter/0-9
```

#### Response Example:
```json
{
  "success": true,
  "letter": "a",
  "currentPage": 1,
  "nextPage": 2,
  "totalPages": 3,
  "hasNextPage": true,
  "totalResults": 10,
  "results": [ ... ]
}
```

---

### 9. Taxonomy & Category Listings

All category and taxonomy endpoints automatically parse page numbers and return standardized pagination headers (`currentPage`, `nextPage`, `totalPages`, `hasNextPage`).

| Category | Endpoint Pattern | Example |
| :--- | :--- | :--- |
| **TV Networks** | `GET /network/{networkName}?page={n}` | `GET /network/disney-channel` |
| **Audio Languages** | `GET /language/{languageName}?page={n}` | `GET /language/korean` |
| **Franchises** | `GET /franchise/{franchiseName}?page={n}` | `GET /franchise/beyblade` |
| **All Series Archive** | `GET /series?page={n}` | `GET /series?page=1` |
| **All Movies Archive** | `GET /movies?page={n}` | `GET /movies?page=1` |
| **Anime Category** | `GET /category/anime?page={n}` | `GET /category/anime?page=1` |
| **Cartoon Category** | `GET /category/cartoon?page={n}` | `GET /category/cartoon?page=1` |
| **Anime Movies** | `GET /category/type/anime?type=movies&page={n}` | `GET /category/type/anime?type=movies` |
| **Anime Series** | `GET /category/type/anime?type=series&page={n}` | `GET /category/type/anime?type=series` |
| **Cartoon Movies** | `GET /category/type/cartoon?type=movies&page={n}` | `GET /category/type/cartoon?type=movies` |
| **Cartoon Series** | `GET /category/type/cartoon?type=series&page={n}` | `GET /category/type/cartoon?type=series` |

#### Standard Category Response:
```json
{
  "success": true,
  "path": "category/network/disney-channel",
  "currentPage": 1,
  "nextPage": null,
  "totalPages": 1,
  "hasNextPage": false,
  "totalResults": 3,
  "results": [ ... ]
}
```

---

### 10. Video Player Iframe Proxy

Proxies third-party video hosts (e.g. Zephyrix, Abyss Player, Synthnova) to bypass `X-Frame-Options` and CSP headers, while injecting `<base href>` and frame-buster defense scripts.

```http
GET /api/v1/animeworldin/player/proxy/url={videoPlayerUrl}
GET /api/v1/animeworldin/player/proxy?url={videoPlayerUrl}
```

#### Example:
```http
GET http://localhost:5000/api/v1/animeworldin/player/proxy/url=https://player.abyssplayer.com/4VL4zDfX7
```

#### HTML Frontend Embedding:
```html
<iframe
  src="http://localhost:5000/api/v1/animeworldin/player/proxy/url=https://player.abyssplayer.com/4VL4zDfX7"
  allowfullscreen
  frameborder="0"
  width="100%"
  height="100%"
  allow="encrypted-media; autoplay">
</iframe>
```

---

### 11. Direct Video Stream Extractor & Video.js HLS Proxy (Ravok / PlayX)

Unlike simple iframe embedding, this system completely reverse-engineers the underlying stream host (e.g. `ravok.buzz` / PlayX player) to extract the raw master HLS playlist (`.m3u8`), subtitle files, and intro/outro timestamps, allowing you to build custom, modern video players using **Video.js** or **Hls.js**.

---

#### 🧠 Architecture & How Ravok Obfuscation Works

Ravok employs a multi-tiered security and obfuscation pipeline to protect video streams:

1. **Dean Edwards JavaScript Packing:**
   The initial HTML at `https://ravok.buzz/video/[videoId]` contains an obfuscated script packed with Dean Edwards' packer (`eval(function(p,a,c,k,e,d)...)`). When unpacked dynamically:
   - It reveals the `VPlayer("player", videoSettings, true)` initialization call.
   - `videoSettings.fields`: Contains the intro and outro timestamp spans in seconds (e.g. `{ intro: "85-175", outro: "1350-1420" }`).
   - `videoSettings.tracks`: Contains subtitle file tracks disguised with a `.jpg` extension (e.g. `https://sub.ravok.buzz/subs/eng.jpg`).

2. **Secure Token Generation (`getVideo`):**
   An AJAX POST request is made to `https://ravok.buzz/player/index.php?data=${videoId}&do=getVideo` with `hash=${videoId}` and the correct `Referer` / `Origin` headers. This returns:
   - `videoSource`: A time-sensitive, MD5-signed HLS stream URL (e.g. `https://ravok.buzz/cdn/hls/{hash}/master.m3u8?md5={token}&expires={timestamp}`).
   - `ck`: A hex-escaped base64 encryption key (e.g. `\\x59\\x6d...`).

---

#### 🛡️ The IP-Binding Security Feature (Why Local Extraction Fails with 403)

> [!IMPORTANT]
> **Ravok binds HLS stream tokens to the requester's IP address!**
> 
> Ravok's CDN uses Nginx Secure Link MD5 hashing configured with the client's IP address:
> `secure_link_md5 "$secure_link_expires$uri$remote_addr secret_key";`
> 
> - **The Problem:** If your local machine (`localhost:5000`) or a serverless function calls `getVideo`, the returned `md5` token is bound to **your IP**. When a remote proxy server (e.g. Railway at `69.46.46.20`) attempts to stream that playlist or segment, Ravok immediately returns **`403 Forbidden`**.
> - **The Solution:** The extraction request is delegated to the **proxy server** (`abyss_proxy_url`). The proxy itself queries `getVideo`, so the generated token matches the **proxy server's IP**. The proxy can then fetch, rewrite, and relay all playlists and segments without restriction.
> - **Auto-Healing:** If any video chunk or playlist returns `403` (due to token expiration or dynamic CDN reassignment), the proxy automatically catches the error, fetches a fresh token for that `videoId` from its own IP, and retries seamlessly without breaking video playback.

---

#### 🚀 How to Get the Video Stream Link (Step-by-Step)

##### Step 1: Obtain Video ID or URL
You can pass either the 32-character hexadecimal ID or the full Ravok URL:
- Video ID: `b51a15f382ac914391a58850ab343b00`
- Full URL: `https://ravok.buzz/video/b51a15f382ac914391a58850ab343b00`

##### Step 2: Request Video Metadata & Stream URL
Call the API extraction endpoint:
```http
GET http://localhost:5000/api/player/data/b51a15f382ac914391a58850ab343b00
```
*(Or query the proxy server directly: `GET https://abyss-proxies-production.up.railway.app/player/data/b51a15f382ac914391a58850ab343b00`)*

##### Step 3: Inspect the Output
The endpoint returns:
- `streamProxyUrl`: The fully proxied, CORS-enabled HLS master playlist URL ready for Video.js.
- `subtitles`: List of subtitle tracks converted on-the-fly to WebVTT.
- `intro` & `outro`: Precise start/end seconds and duration for auto-skipping opening and ending songs.

##### Step 4: Supply `streamProxyUrl` to Video.js
Feed `streamProxyUrl` directly to Video.js with type `application/x-mpegURL`. The proxy transparently rewrites all internal `.m3u8` variant playlists and `.ts` / `.js` media segment URIs so every chunk flows through the proxy without CORS or 403 blocks.

---

#### 📡 Endpoints Reference

| Endpoint | Method | Hosted On | Description |
| :--- | :--- | :--- | :--- |
| `/api/player/data/:id` | `GET` | API Server (`:5000`) | Extracts video data, intro/outro, and subtitles. Automatically delegates to `abyss_proxy_url` to prevent IP token mismatches. |
| `/player/data/:id` | `GET` | Proxy Server (`Railway`) | Direct extraction endpoint executed from the proxy's IP. |
| `/player/stream/proxy` | `GET` | Proxy Server (`Railway`) | Proxies master `.m3u8` playlists, variant streams, and video segments (`.ts`/`.js`) with auto-healing on 403 errors. |
| `/player/subtitle/proxy` | `GET` | Proxy Server (`Railway`) | Proxies disguised `.jpg` SRT subtitles and converts them into standard `text/vtt` WebVTT format on-the-fly. |
| `/dev/player` or `/dev/player/:id` | `GET` | API Server (`:5000`) | Built-in interactive browser test harness with Video.js player, presets, and live JSON inspector. |
| `/player` (Frontend) | `GET` | Next.js App (`:3000`) | Production Video.js player interface featuring live ID input, JSON inspection, and auto/manual intro/outro skip buttons. |

---

#### 📊 Complete JSON Response Schema

```json
{
  "success": true,
  "videoId": "b51a15f382ac914391a58850ab343b00",
  "title": "Demon Slayer - S1 E1",
  "fields": {
    "intro": "85-175",
    "outro": "1350-1420"
  },
  "intro": {
    "start": 85,
    "end": 175,
    "duration": 90,
    "enabled": true
  },
  "outro": {
    "start": 1350,
    "end": 1420,
    "duration": 70,
    "enabled": true
  },
  "hls": true,
  "videoSource": "https://ravok.buzz/cdn/hls/9e2bab25af3748251148d6078918ab0e/master.m3u8?md5=_eJ3s9qapGbOA-zwKvr1tQ&expires=1792161918",
  "streamProxyUrl": "https://abyss-proxies-production.up.railway.app/player/stream/proxy?url=https%3A%2F%2Fravok.buzz%2Fcdn%2Fhls%2F9e2bab25af3748251148d6078918ab0e%2Fmaster.m3u8%3Fmd5%3D_eJ3s9qapGbOA-zwKvr1tQ%26expires%3D1792161918&videoId=b51a15f382ac914391a58850ab343b00",
  "videoImage": "https://ravok.buzz/cdn/thumbs/b51a15f382ac914391a58850ab343b00.jpg",
  "tracks": [
    {
      "kind": "captions",
      "label": "English",
      "language": "eng",
      "default": true,
      "originalUrl": "https://sub.ravok.buzz/subs/eng.jpg",
      "proxyUrl": "https://abyss-proxies-production.up.railway.app/player/subtitle/proxy?url=https%3A%2F%2Fsub.ravok.buzz%2Fsubs%2Feng.jpg"
    }
  ],
  "subtitles": [
    {
      "kind": "captions",
      "label": "English",
      "language": "eng",
      "default": true,
      "originalUrl": "https://sub.ravok.buzz/subs/eng.jpg",
      "proxyUrl": "https://abyss-proxies-production.up.railway.app/player/subtitle/proxy?url=https%3A%2F%2Fsub.ravok.buzz%2Fsubs%2Feng.jpg"
    }
  ],
  "cryptoKey": {
    "base64Key": "YmFzZTY0...",
    "hexKey": "..."
  },
  "proxyBase": "https://abyss-proxies-production.up.railway.app"
}
```

---

#### 💬 Subtitle Handling & On-The-Fly WebVTT Conversion

Ravok stores subtitles with `.jpg` extensions (e.g. `https://sub.ravok.buzz/subs/eng.jpg`) to prevent simple hotlinking or bypass CDN content checks. 

The proxy server's `/player/subtitle/proxy` route automatically:
1. Downloads the disguised `.jpg` file using proper `Referer` and `User-Agent` headers.
2. Identifies the SubRip (SRT) structure.
3. Normalizes timestamp separators from commas (`00:01:25,500`) to periods (`00:01:25.500`).
4. Prepends the mandatory `WEBVTT` header.
5. Returns the track with `Content-Type: text/vtt; charset=utf-8` and `Access-Control-Allow-Origin: *`.

You can mount this directly in Video.js with `player.addRemoteTextTrack({ kind: 'captions', src: subtitle.proxyUrl })`.

---

#### ⏩ Intro & Outro Auto-Skip Integration

The `intro` and `outro` fields contain integer start and end times in seconds:
```json
"intro": { "start": 85, "end": 175, "duration": 90, "enabled": true }
```

In your player's `timeupdate` listener:
```javascript
player.on('timeupdate', () => {
  const currentTime = player.currentTime();
  
  // Intro check
  if (data.intro && data.intro.enabled) {
    if (currentTime >= data.intro.start && currentTime < data.intro.end) {
      showSkipButton('Skip Opening', () => player.currentTime(data.intro.end));
    }
  }

  // Outro check
  if (data.outro && data.outro.enabled) {
    if (currentTime >= data.outro.start && currentTime < data.outro.end) {
      showSkipButton('Next Episode', () => loadNextEpisode());
    }
  }
});
```

---

#### 💻 Frontend Integration Examples

##### 1. cURL / Terminal
```bash
# Extract stream data via local API
curl -s "http://localhost:5000/api/player/data/b51a15f382ac914391a58850ab343b00" | jq

# Or directly from the proxy
curl -s "https://abyss-proxies-production.up.railway.app/player/data/b51a15f382ac914391a58850ab343b00" | jq
```

##### 2. JavaScript / Fetch (Browser or Node.js)
```javascript
async function getStream(videoId) {
  const res = await fetch(`http://localhost:5000/api/player/data/${videoId}`);
  const json = await res.json();
  
  if (!json.success) {
    throw new Error(json.error);
  }

  return {
    hlsUrl: json.streamProxyUrl,
    subtitles: json.subtitles,
    intro: json.intro,
    outro: json.outro
  };
}
```

##### 3. Video.js Vanilla HTML Implementation
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Video.js Stream Player</title>
  <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
  <style>
    body { background: #0b0f19; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 2rem; }
    .player-container { width: 900px; max-width: 100%; position: relative; }
    .skip-btn { position: absolute; bottom: 65px; right: 25px; z-index: 100; background: #6366f1; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; display: none; }
  </style>
</head>
<body>
  <h2>🎬 Anime Stream Video.js Player</h2>
  <div class="player-container">
    <video id="my-video" class="video-js vjs-big-play-centered vjs-16-9" controls preload="auto"></video>
    <button id="skipBtn" class="skip-btn">Skip Intro ⏩</button>
  </div>

  <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
  <script>
    async function initPlayer(videoId) {
      const res = await fetch(`http://localhost:5000/api/player/data/${videoId}`);
      const data = await res.json();
      if (!data.success) return alert('Failed to load video: ' + data.error);

      const player = videojs('my-video');
      const skipBtn = document.getElementById('skipBtn');

      // 1. Set proxied HLS master playlist
      player.src({
        src: data.streamProxyUrl,
        type: 'application/x-mpegURL'
      });

      // 2. Add converted WebVTT subtitle tracks
      if (data.subtitles) {
        data.subtitles.forEach(sub => {
          player.addRemoteTextTrack({
            kind: 'captions',
            label: sub.label,
            language: sub.language,
            src: sub.proxyUrl,
            default: sub.default
          }, false);
        });
      }

      // 3. Intro / Outro Skip Handling
      player.on('timeupdate', () => {
        const cur = player.currentTime();
        if (data.intro && data.intro.enabled && cur >= data.intro.start && cur < data.intro.end) {
          skipBtn.style.display = 'block';
          skipBtn.onclick = () => {
            player.currentTime(data.intro.end);
            skipBtn.style.display = 'none';
          };
        } else {
          skipBtn.style.display = 'none';
        }
      });

      player.play();
    }

    initPlayer('b51a15f382ac914391a58850ab343b00');
  </script>
</body>
</html>
```

##### 4. Next.js / React Component
```tsx
'use client';
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface AnimePlayerProps {
  videoId: string;
  apiBaseUrl?: string;
}

export default function AnimePlayer({ videoId, apiBaseUrl = 'http://localhost:5000' }: AnimePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function setup() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/player/data/${videoId}`);
        const data = await res.json();
        if (!isMounted || !data.success) return;

        if (videoRef.current && !playerRef.current) {
          const player = videojs(videoRef.current, {
            controls: true,
            autoplay: false,
            preload: 'auto',
            fluid: true,
            sources: [{ src: data.streamProxyUrl, type: 'application/x-mpegURL' }]
          });

          playerRef.current = player;

          // Add Subtitles
          data.subtitles?.forEach((sub: any) => {
            player.addRemoteTextTrack({
              kind: 'captions',
              label: sub.label,
              language: sub.language,
              src: sub.proxyUrl,
              default: sub.default
            }, false);
          });

          // Intro Skip Listener
          player.on('timeupdate', () => {
            const time = player.currentTime();
            if (data.intro?.enabled && time >= data.intro.start && time < data.intro.end) {
              // Trigger skip notification or auto-advance
              console.log('Currently in opening sequence...');
            }
          });
        }
      } catch (err) {
        console.error('Player setup failed:', err);
      }
    }

    setup();

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoId, apiBaseUrl]);

  return (
    <div className="w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl">
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered vjs-16-9" />
      </div>
    </div>
  );
}
```

---

## 💻 Frontend Integration Guide (TypeScript)

Here are the TypeScript interfaces matching the API outputs for React / Next.js clients:

```typescript
// Spotlight & Featured Hero Items
export interface SpotlightItem {
  id: string;
  title: string;
  banner: string; // High-resolution 1280px landscape backdrop
  image: string;  // 500px vertical poster
  synopsis: string;
  rating: string;
  genres: string[];
  season?: string;
  languages?: string[];
}

// Standard Anime Card
export interface AnimeCard {
  title: string;
  id: string;
  image: string;
  season?: string;
  episode?: string;
}

// Paginated Listing Response
export interface PaginatedResponse<T = AnimeCard> {
  success: boolean;
  currentPage: number;
  nextPage: number | null;
  totalPages: number;
  hasNextPage: boolean;
  totalResults: number;
  results: T[];
}

// Stream Source
export interface StreamSource {
  serverName: string;
  language: string;
  sourceUrl: string;
  proxyUrl: string;
}

// Subtitle Track (Converted to WebVTT)
export interface SubtitleTrack {
  kind: 'captions' | 'subtitles';
  label: string;
  language: string;
  default: boolean;
  originalUrl: string;
  proxyUrl: string;
}

// Skip Time Range
export interface TimeRange {
  start: number;
  end: number;
  duration: number;
  enabled: boolean;
}

// Complete Ravok / PlayX Stream Extractor Payload
export interface RavokStreamData {
  success: boolean;
  videoId: string;
  title: string;
  fields: {
    intro: string; // e.g. "85-175"
    outro: string; // e.g. "1350-1420"
  };
  intro: TimeRange;
  outro: TimeRange;
  hls: boolean;
  videoSource: string; // Original secured m3u8 URL with MD5 & expiry token
  streamProxyUrl: string; // Proxied m3u8 URL safe for Video.js
  videoImage?: string;
  tracks: SubtitleTrack[];
  subtitles: SubtitleTrack[];
  cryptoKey?: {
    base64Key: string;
    hexKey: string | null;
  };
  proxyBase: string;
}
```

---

## 🛡️ Error Handling

All API endpoints return standard HTTP status codes and structured JSON payloads on errors:

```json
{
  "success": false,
  "error": "Missing episode ID. Example: /episode/fullmetal-alchemist-brotherhood-1x1",
  "statusCode": 400,
  "timestamp": "2026-10-14T12:00:00.000Z"
}
```

---

## 📄 License
MIT License. Built for Anime Stream Hindi.
