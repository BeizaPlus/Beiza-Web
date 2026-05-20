/** Brand image paths — do not swap emotional registers. */
export const BRAND_IMAGES = {
  /** Welcome gate — Legacy path card (My Life Story book photo) */
  welcomeLegacyLifeStory: "/assets/legacy-hero.jpg",
  /** Heritage / White Swan only — elder + Gye Nyame */
  heritageHero: "/images/beiza-elder-gye-nyame-hero.png",
  /** Events + Stories — Ernestina B&W portrait */
  eventsStoriesHero: "/images/beiza-ernestina-portrait-bw.png",
  /** Homepage default when CMS has no hero */
  homepageHero: "/images/adinkra-hands-hero.png",
} as const;

/** Shared left-to-right hero overlay (homepage, Events, Heritage). */
export const HERO_OVERLAY_GRADIENT =
  "linear-gradient(to right, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.15) 100%)";

/** Matches `Hero` header shell — full viewport width, no card radius. */
export const HERO_SHELL_CLASS =
  "relative -mt-24 flex w-full min-h-[calc(100vh+6rem)] items-stretch justify-center overflow-hidden";

export const HERO_CONTENT_CLASS =
  "relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-end px-6 pt-28 md:px-12 md:pt-32";

/** Bottom padding for hero copy — always % of viewport height (see --hero-copy-raise). */
export const HERO_CONTENT_BOTTOM_STYLE = {
  paddingBottom: "calc(var(--hero-copy-raise, 38) * 1vh)",
} as const;
