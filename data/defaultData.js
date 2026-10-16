/**
 * Default Home & Spotlight Data
 * Curated spotlight items with high-resolution landscape banners for the hero carousel.
 * Note: 'banner' is strictly present in spotlight items only.
 */

const KNOWN_BANNERS = {
  'series/naruto-shippuden': 'https://image.tmdb.org/t/p/w1280/z0YhJvomqedHF85bplUJEotkN5l.jpg',
  'series/solo-leveling': 'https://image.tmdb.org/t/p/w1280/8j8kuMcdJKMVFoNJysNlXFDjY7s.jpg',
  'series/jujutsu-kaisen': 'https://image.tmdb.org/t/p/w1280/gmECX1DvFgdUPjtio2zaL8BPYPu.jpg',
  'series/demon-slayer-kimetsu-no-yaiba': 'https://image.tmdb.org/t/p/w1280/3GQKYh6Trm8pxd2AypovoYQf4Ay.jpg',
  'series/attack-on-titan': 'https://image.tmdb.org/t/p/w1280/yvKrycViRMQcIgdnjsM5JGNWU4Q.jpg',
  'series/one-piece': 'https://image.tmdb.org/t/p/w1280/4Mt7WHox67uJ1yErwTBFcV8KWgG.jpg',
  'series/arifureta-from-commonplace-to-worlds-strongest': 'https://image.tmdb.org/t/p/w1280/1lL1ts7dzTUp0eOTHvMqfw6zFJn.jpg'
};


const DEFAULT_SPOTLIGHT = [
  {
    id: 'series/demon-slayer',
    title: 'Demon Slayer',
    banner: 'https://i.ibb.co.com/zHDvX6Kw/Demon-Slayer-Kimetsu-no-Yaiba-Infinity-Castle-E01-1.png',
    image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg',
    synopsis: 'During the Taisho Period in Japan, Tanjiro Kamado returns home to find his family slaughtered by demons. His younger sister Nezuko survives but is transformed into a demon. Determined to save her and avenge his family, Tanjiro joins the Demon Slayer Corps.',
    rating: '8.6',
    genres: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
    season: 'Season 4',
    languages: ['Hindi', 'English', 'Japanese']
  },
  {
    id: 'series/naruto-shippuden',
    title: 'Naruto Shippuden',
    banner: 'https://image.tmdb.org/t/p/w1280/z0YhJvomqedHF85bplUJEotkN5l.jpg',
    image: 'https://image.tmdb.org/t/p/w500/kV27j3Nz4d5z8u6mN3EJw9RiLg2.jpg',
    synopsis: 'Naruto Uzumaki returns to the Hidden Leaf Village after years of training with Jiraiya. Stronger and more determined, he faces the Akatsuki and continues his mission to bring his friend Sasuke Uchiha back home.',
    rating: '8.6',
    genres: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
    season: 'Complete',
    languages: ['Hindi', 'Japanese']
  },
  {
    id: 'series/jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    banner: 'https://image.tmdb.org/t/p/w1280/gmECX1DvFgdUPjtio2zaL8BPYPu.jpg',
    image: 'https://image.tmdb.org/t/p/w500/fHpKWq9ayzSk8nSwqRuaAUemRKh.jpg',
    synopsis: 'Yuji Itadori becomes involved in the dangerous world of cursed spirits after swallowing a powerful cursed object. He joins Tokyo Jujutsu High, where he trains alongside fellow sorcerers to fight curses and protect humanity.',
    rating: '8.9',
    genres: ['Action', 'Supernatural', 'Fantasy', 'Shounen'],
    season: 'Season 2',
    languages: ['Hindi', 'Japanese']
  },
  {
    id: 'series/attack-on-titan',
    title: 'Attack on Titan',
    banner: 'https://image.tmdb.org/t/p/w1280/yvKrycViRMQcIgdnjsM5JGNWU4Q.jpg',
    image: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    synopsis: 'Humanity survives behind enormous walls built to protect it from terrifying man-eating Titans. After a devastating attack destroys his home, Eren Yeager vows to eliminate the Titans and uncover the truth about their existence.',
    rating: '9.0',
    genres: ['Action', 'Drama', 'Fantasy', 'Shounen'],
    season: 'The Final Season',
    languages: ['Hindi', 'Japanese']
  },
  {
    id: 'series/arifureta-from-commonplace-to-worlds-strongest',
    title: "Arifureta: From Commonplace to World's Strongest",
    banner: 'https://image.tmdb.org/t/p/w1280/1lL1ts7dzTUp0eOTHvMqfw6zFJn.jpg',
    image: 'https://image.tmdb.org/t/p/w500/3Te6pYJNdh4YyWY1G7ANxNHpedi.jpg',
    synopsis: 'Transported to a fantasy world with his classmates, Hajime Nagumo is betrayed and falls into a deadly abyss. Forced to fight for survival, he gains extraordinary powers and begins a journey to become one of the world’s strongest.',
    rating: '8.1',
    genres: ['Action', 'Adventure', 'Fantasy', 'Isekai'],
    season: 'Season 3',
    languages: ['Hindi', 'Japanese']
  },
  {
    id: 'series/one-piece',
    title: 'One Piece',
    banner: 'https://image.tmdb.org/t/p/w1280/4dKRTUyl8gDbQ6R4hNfymY3E8Z3.jpg',
    image: 'https://image.tmdb.org/t/p/w500/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg',
    synopsis: 'Monkey D. Luffy dreams of becoming the King of the Pirates. Together with his diverse crew, he sails across dangerous seas in search of the legendary treasure known as the One Piece.',
    rating: '8.7',
    genres: ['Action', 'Adventure', 'Fantasy', 'Shounen'],
    season: 'Ongoing',
    languages: ['Japanese', 'Hindi']
  },
  {
    id: 'series/solo-leveling',
    title: 'Solo Leveling',
    banner: 'https://image.tmdb.org/t/p/w1280/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
    image: 'https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg',
    synopsis: 'In a world where hunters battle deadly monsters, Sung Jinwoo is known as the weakest hunter. After surviving a mysterious dungeon, he receives a unique System that allows him to level up without limits and become humanity’s most powerful hunter.',
    rating: '8.5',
    genres: ['Action', 'Adventure', 'Fantasy'],
    season: 'Season 2',
    languages: ['Japanese', 'Hindi', 'English']
  },
  {
    id: 'series/that-time-i-got-reincarnated-as-a-slime',
    title: 'That Time I Got Reincarnated as a Slime',
    banner: 'https://image.tmdb.org/t/p/w1280/8Yq7gW8cJf6d5e2Jq7XwzQ3M4pR.jpg',
    image: 'https://image.tmdb.org/t/p/w500/5WZ0y8h7XqJ9Yp6d3K4mN2vR1sT.jpg',
    synopsis: 'After an unexpected death, Satoru Mikami is reincarnated in a fantasy world as a slime named Rimuru Tempest. Armed with unique abilities, Rimuru builds a nation where monsters and humans can live together in peace.',
    rating: '8.1',
    genres: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Isekai'],
    season: 'Season 4',
    languages: ['Japanese', 'Hindi', 'English']
  }
];

/**
 * Builds the spotlight list by combining curated defaults with popular titles
 * and ensuring only spotlight items have the 'banner' attribute.
 */
function getSpotlightList(scrapedMostPopular = []) {
  const spotlight = [...DEFAULT_SPOTLIGHT];
  const seenIds = new Set(spotlight.map(item => item.id));

  // If scraped most-popular contains any item we have a high-res banner for, ensure it's in spotlight
  if (Array.isArray(scrapedMostPopular)) {
    for (const pop of scrapedMostPopular) {
      if (pop && pop.id && KNOWN_BANNERS[pop.id] && !seenIds.has(pop.id)) {
        seenIds.add(pop.id);
        spotlight.push({
          id: pop.id,
          title: pop.title,
          banner: KNOWN_BANNERS[pop.id],
          image: pop.image || null,
          rating: pop.rating || '8.5',
          genres: ['Anime', 'Action'],
          languages: ['Hindi Dub', 'Japanese Audio']
        });
      }
    }
  }

  return spotlight;
}

module.exports = {
  DEFAULT_SPOTLIGHT,
  KNOWN_BANNERS,
  getSpotlightList
};
