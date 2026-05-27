/**
 * Local media manifest — all raster brand images live under `/public/images/`.
 * Naming: `beiza-storyworth-{product}-{subject}-{usage}.{ext}` for SEO & AEO.
 * Never hotlink Framer/CDN URLs in fallback content.
 */

export type MediaAsset = {
  src: string;
  alt: string;
  /** Optional OG / JSON-LD absolute URL segment (path only; origin added in SEO layer) */
  seoTitle?: string;
};

const I = (file: string) => `/images/${file}` as const;

export const MEDIA_ASSETS = {
  brand: {
    mascotHead: {
      src: I("beiza-storyworth-brand-mascot-head.png"),
      alt: "Beiza mascot — family legacy and voice vault",
      seoTitle: "Beiza brand mascot",
    },
    iconSvg: I("beiza-icon.svg"),
  },
  home: {
    adinkraHero: {
      src: I("beiza-storyworth-home-intentional-legacy-adinkra-hero.png"),
      alt: "Adinkra heritage — hands holding legacy symbols for intentional family storytelling",
      seoTitle: "Build intentional legacy — Adinkra hero",
    },
    historySeriesReelTexture: {
      src: I("beiza-history-series-reel-texture.png"),
      alt: "Beiza history series — cinematic reel thumbnail texture",
      seoTitle: "Beiza history series reel texture",
    },
    productLeaderMockup: {
      src: I("beiza-storyworth-home-product-leader-mockup.png"),
      alt: "Beiza legacy product — family circle and memoir tools like Storyworth for generations",
      seoTitle: "Beiza family legacy product mockup",
    },
  },
  welcome: {
    legacyPreserve: {
      src: I("beiza-storyworth-welcome-legacy-preserve-life-story.jpg"),
      alt: "Preserve a life story — elder sharing family legacy on Beiza",
    },
    legacyBlackAmerican: {
      src: I("beiza-storyworth-welcome-legacy-black-american-life-story.jpg"),
      alt: "Black American family — preserve a life story with Beiza Storyworth-style vault",
    },
    legacyIndian: {
      src: I("beiza-storyworth-welcome-legacy-indian-life-story.jpg"),
      alt: "Indian heritage — preserve a life story in your language",
    },
    legacyLatina: {
      src: I("beiza-storyworth-welcome-legacy-latina-life-story.jpg"),
      alt: "Latina family — preserve a life story for future generations",
    },
    legacyChinese: {
      src: I("beiza-storyworth-welcome-legacy-chinese-life-story.png"),
      alt: "Chinese family heritage — preserve voices and stories",
    },
    legacyBrazilian: {
      src: I("beiza-storyworth-welcome-legacy-brazilian-life-story.png"),
      alt: "Brazilian family — preserve a life story with Beiza",
    },
    legacyGhana: {
      src: I("beiza-storyworth-welcome-legacy-ghana-marmah.png"),
      alt: "Ghana — Marmah sharing her story on Beiza legacy record",
    },
    legacyFrench: {
      src: I("beiza-storyworth-welcome-legacy-french-interview.png"),
      alt: "French heritage — record family stories in conversation",
    },
  },
  record: {
    studioLandscape: {
      src: I("beiza-storyworth-record-hero-studio-landscape.png"),
      alt: "Beiza record station — preserve family voice like Storyworth interviews",
    },
    ghanaMarmah: {
      src: I("beiza-storyworth-record-hero-ghana-marmah.png"),
      alt: "Ghana record hero — Marmah family legacy interview",
    },
  },
  farewell: {
    elderGyeNyame: {
      src: I("beiza-storyworth-farewell-elder-gye-nyame-heritage-hero.png"),
      alt: "Elder in red kente before Gye Nyame — farewell heritage and memorial dignity",
    },
    whiteSwanPoster: {
      src: I("beiza-storyworth-farewell-white-swan-film-poster.png"),
      alt: "White Swan memorial film poster — Beiza farewell heritage",
    },
    mournersGathering: {
      src: I("beiza-storyworth-farewell-mourners-memorial-gathering.png"),
      alt: "Mourners at a homegoing — memorial gathering preserved on Beiza",
    },
    remembranceSong: {
      src: I("beiza-storyworth-farewell-remembrance-song-gathering.png"),
      alt: "Song and remembrance at a family farewell",
    },
  },
  heritage: {
    memoirHero: {
      src: I("beiza-storyworth-heritage-memoir-legacy-hero.jpg"),
      alt: "Heritage memoir — preserve a life story for generations like Storyworth",
    },
    ancestryScene1: {
      src: I("beiza-storyworth-heritage-ancestry-gathering-scene-01.png"),
      alt: "Family ancestry gathering — heritage archive scene",
    },
    ancestryScene2: {
      src: I("beiza-storyworth-heritage-ancestry-gathering-scene-02.png"),
      alt: "Remembrance and song — heritage family scene",
    },
  },
  events: {
    ernestinaPortrait: {
      src: I("beiza-storyworth-events-ernestina-portrait-bw.png"),
      alt: "Madam Ernestina — black and white portrait for legacy events",
    },
    liveTribute: {
      src: I("beiza-storyworth-event-live-tribute-performance.png"),
      alt: "Live tribute performance at a family farewell celebration",
    },
  },
  offerings: {
    legacyGalleries: {
      src: I("beiza-storyworth-offering-legacy-family-galleries.png"),
      alt: "Legacy galleries — curated family imagery in your Beiza vault",
    },
  },
  circle: {
    adinkraStamp: {
      src: I("beiza-storyworth-circle-adinkra-stamp-hand.png"),
      alt: "Adinkra stamp — family circle identity on Beiza",
    },
  },
  testimonials: {
    voiceAvatar: {
      src: I("beiza-storyworth-testimonial-family-voice-avatar.png"),
      alt: "Family voice preserved — Beiza legacy testimonial",
    },
  },
} as const;

/** Default OG image for marketing pages */
export const DEFAULT_OG_IMAGE = MEDIA_ASSETS.home.adinkraHero.src;

export function absoluteMediaUrl(path: string, origin = "https://www.beizaplus.com"): string {
  if (path.startsWith("http")) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
