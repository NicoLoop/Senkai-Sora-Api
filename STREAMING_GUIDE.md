# 🎬 Video Stream Link Extractor & Video.js HLS Proxy Guide

This guide explains how to extract, proxy, and play direct video streams from **Ravok / PlayX** (e.g. `https://ravok.buzz/video/:id`) using **Video.js** or any modern HLS video player.

---

## ⚡ Quick Start: How to Get a Playable Video Stream Link

### 1. Identify the Video ID or URL
Examples:
- **Video ID:** `b51a15f382ac914391a58850ab343b00` (e.g. Demon Slayer Episode 1)
- **Direct Web URL:** `https://ravok.buzz/video/b51a15f382ac914391a58850ab343b00`

---

### 2. Make the Extraction Request

#### Option A: Via Local Serverless API (`:5000`)
```http
GET http://localhost:5000/api/player/data/b51a15f382ac914391a58850ab343b00
```

#### Option B: Via Direct Proxy Server (Railway)
```http
GET https://abyss-proxies-production.up.railway.app/player/data/b51a15f382ac914391a58850ab343b00
```

---

### 3. Extract Stream Information from JSON Response
The response contains everything you need to mount the video and subtitles:

```json
{
  "success": true,
  "videoId": "b51a15f382ac914391a58850ab343b00",
  "title": "Demon Slayer - S1 E1",
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
  "streamProxyUrl": "https://abyss-proxies-production.up.railway.app/player/stream/proxy?url=https%3A%2F%2Fravok.buzz%2Fcdn%2Fhls%2F9e2bab25af3748251148d6078918ab0e%2Fmaster.m3u8%3Fmd5%3D_eJ3s9qapGbOA-zwKvr1tQ%26expires%3D1792161918&videoId=b51a15f382ac914391a58850ab343b00",
  "subtitles": [
    {
      "kind": "captions",
      "label": "English",
      "language": "eng",
      "default": true,
      "proxyUrl": "https://abyss-proxies-production.up.railway.app/player/subtitle/proxy?url=https%3A%2F%2Fsub.ravok.buzz%2Fsubs%2Feng.jpg"
    }
  ]
}
```

---

## 🛡️ Critical Architecture: The IP-Binding 403 Gotcha

### Why Can't Localhost or Client Fetch Ravok Directly?
1. **Nginx Secure Link Hash with `$remote_addr`:**
   Ravok CDN's stream URLs contain an MD5 token calculated as:
   `md5("$expires$uri$remote_addr secret")`
2. **The Problem:**
   If your localhost machine or a user's phone calls Ravok's `getVideo` API, the MD5 hash is strictly bound to **that device's IP**. When the video player sends requests through the proxy server (`69.46.46.20`), Ravok sees a mismatched IP and responds with:
   ```http
   HTTP/1.1 403 Forbidden
   ```
3. **The Solution:**
   The extraction API automatically queries `https://abyss-proxies-production.up.railway.app/player/data/:id`. Because the token is requested by the proxy's IP, the proxy can fetch and stream all playlists (`.m3u8`) and video chunks (`.ts`/`.js`) without being blocked.
4. **Auto-Healing:**
   If a token expires during a long viewing session, the proxy detects the `403`, automatically requests a fresh token using `videoId`, and resumes the stream invisibly.

---

## 💬 Subtitle Proxy & WebVTT Conversion

- **Obfuscation:** Ravok serves subtitle files disguised with `.jpg` extensions (e.g. `eng.jpg`).
- **Reality:** These are actually standard SubRip (SRT) subtitle text files.
- **Conversion:** When you request `/player/subtitle/proxy?url=...`, the proxy:
  1. Downloads the disguised `.jpg` file.
  2. Converts SRT timing format `00:01:23,456` to WebVTT format `00:01:23.456`.
  3. Prepends `WEBVTT\n\n`.
  4. Returns `Content-Type: text/vtt; charset=utf-8` with open CORS headers.

---

## ⏩ Opening & Ending Auto-Skip

The API automatically unpacks Dean Edwards packed JavaScript to extract intro/outro markers from `videoSettings.fields`:
- `intro`: `{ start: 85, end: 175, duration: 90, enabled: true }`
- `outro`: `{ start: 1350, end: 1420, duration: 70, enabled: true }`

In your player, listen to the `timeupdate` event:
```javascript
player.on('timeupdate', () => {
  const current = player.currentTime();
  if (data.intro?.enabled && current >= data.intro.start && current < data.intro.end) {
    // Jump past intro
    player.currentTime(data.intro.end);
  }
});
```

---

## 💻 Full Video.js Player Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Video.js Stream Player</title>
  <link href="https://vjs.zencdn.net/8.10.0/video-js.css" rel="stylesheet" />
  <style>
    body { background: #0b0f19; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; padding: 2rem; }
    .player-box { width: 960px; max-width: 100%; position: relative; }
    .skip-btn { position: absolute; bottom: 60px; right: 20px; z-index: 10; background: #6366f1; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; display: none; }
  </style>
</head>
<body>
  <h2>🎬 Anime Stream Video.js Player</h2>
  <div class="player-box">
    <video id="video-player" class="video-js vjs-big-play-centered vjs-16-9" controls preload="auto"></video>
    <button id="skipIntroBtn" class="skip-btn">Skip Opening ⏩</button>
  </div>

  <script src="https://vjs.zencdn.net/8.10.0/video.min.js"></script>
  <script>
    async function playAnime(videoId) {
      const res = await fetch(`http://localhost:5000/api/player/data/${videoId}`);
      const data = await res.json();
      if (!data.success) return alert(data.error);

      const player = videojs('video-player');
      const skipBtn = document.getElementById('skipIntroBtn');

      // 1. Set the stream source
      player.src({
        src: data.streamProxyUrl,
        type: 'application/x-mpegURL'
      });

      // 2. Add converted WebVTT subtitles
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

      // 3. Skip intro button handler
      player.on('timeupdate', () => {
        const time = player.currentTime();
        if (data.intro && data.intro.enabled && time >= data.intro.start && time < data.intro.end) {
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

    // Play default video
    playAnime('b51a15f382ac914391a58850ab343b00');
  </script>
</body>
</html>
```

---

## 🎮 Interactive Dev & Test Tools

- **Next.js Full Player Interface:** `http://localhost:3000/player`
- **Express Backend Dev Tester:** `http://localhost:5000/dev/player`
- **Proxy Server Direct Tester:** `https://abyss-proxies-production.up.railway.app/player`
