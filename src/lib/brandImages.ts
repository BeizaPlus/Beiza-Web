/** Brand image paths — do not swap emotional registers. */
export const BRAND_IMAGES = {
  /** Welcome gate — Legacy path card (Africa diaspora elder) */
  welcomeLegacyLifeStory: "/images/beiza-welcome-legacy-preserve-life-story.jpg",
  welcomeLegacyBlackAmerican: "/images/beiza-welcome-legacy-black-american.jpg",
  welcomeLegacyIndian: "/images/beiza-welcome-legacy-indian.jpg",
  welcomeLegacyLatina: "/images/beiza-welcome-legacy-latina.jpg",
  welcomeLegacyChinese: "/images/beiza-welcome-legacy-chinese.png",
  welcomeLegacyBrazilian: "/images/beiza-welcome-legacy-brazilian.png",
  /** Heritage / White Swan only — elder + Gye Nyame */
  heritageHero: "/images/beiza-elder-gye-nyame-hero.png",
  /** Heritage White Swan section — custom poster before YouTube plays */
  whiteSwanFilmPoster: "/images/beiza-white-swan-film-poster.png",
  /** Events + Stories — Ernestina B&W portrait */
  eventsStoriesHero: "/images/beiza-ernestina-portrait-bw.png",
  /** Homepage default when CMS has no hero */
  homepageHero: "/images/adinkra-hands-hero.png",
  /** Legacy Record tab — default studio hero + nav thumbnail */
  legacyRecordTabLandscape: "/images/beiza-legacy-record-tab-landscape.png",
  /** Ghana (GH) default — Marmah story (record hero + welcome Legacy card) */
  legacyRecordAfrica: "/images/beiza-legacy-record-africa.png",
  welcomeLegacyAfrica: "/images/beiza-welcome-legacy-africa.png",
} as const;

/** Shared left-to-right hero overlay (homepage, Events, Heritage). */
export const HERO_OVERLAY_GRADIENT =
  "linear-gradient(to right, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.15) 100%)";

/** Matches `Hero` header shell — full viewport width, no card radius. */
export const HERO_SHELL_CLASS =
  "relative -mt-24 flex w-full min-h-[calc(100vh+6rem)] items-stretch justify-center overflow-hidden";

export const HERO_CONTENT_CLASS =
  "relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-1 items-end pt-28 md:pt-32 pl-[var(--beiza-site-padding-x,1.25rem)] pr-[var(--beiza-site-padding-x,1.25rem)]";

/** Bottom padding for hero copy — always % of viewport height (see --hero-copy-raise). */
export const HERO_CONTENT_BOTTOM_STYLE = {
  paddingBottom: "calc(var(--hero-copy-raise, 38) * 1vh)",
} as const;
