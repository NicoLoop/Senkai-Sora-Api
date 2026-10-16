const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiKey: process.env.API_KEY || 'ash_live_k82f9d1e4c3a0b57e62a9b',
  animeWorldIndiaUrl: process.env.ANIME_WORLD_INDIA_URL || 'https://watchanimeworld.one/',
  animeSaltUrl: process.env.ANIME_SALT_URL || 'https://animesalt.cx/',
  scraperTimeoutMs: parseInt(process.env.SCRAPER_TIMEOUT_MS, 10) || 15000,

  // Dedicated Abyss / Ravok Stream Proxy URL (Hosted on container server, e.g. Railway or localhost:3005)
  abyssProxyUrl: process.env.abyss_proxy_url || process.env.NEXT_PUBLIC_ABYSS_PROXY_URL || process.env.ABYSS_PROXY_URL || 'https://abyss-proxies-production.up.railway.app',

  // Allowed & recognized proxy origins accepted by Zephyrix / AnimeWorld / Synthnova / Abyss / PlayX
  allowedReferers: [
    'https://watchanimeworld.net/',
    'https://watchanimeworld.cc/',
    'https://watchanimeworld.top/',
    'https://watchanimeworld.one/',
    'https://animesalt.cx/',
    'https://ravok.buzz/',
    'https://play.zephyrix.org/',
    'https://synthnova.net/',
    'https://player.abyssplayer.com/'
  ],

  // Default referer used for proxying video player embeds
  defaultReferer: 'https://watchanimeworld.one/',

  // Default desktop browser User-Agent
  defaultUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
};

module.exports = config;
