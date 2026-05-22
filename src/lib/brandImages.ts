/** Brand image paths — re-export from media manifest (Storyworth-style SEO names). */
import { MEDIA_ASSETS } from "@/lib/mediaAssets";

export const BRAND_IMAGES = {
  welcomeLegacyLifeStory: MEDIA_ASSETS.welcome.legacyPreserve.src,
  welcomeLegacyBlackAmerican: MEDIA_ASSETS.welcome.legacyBlackAmerican.src,
  welcomeLegacyIndian: MEDIA_ASSETS.welcome.legacyIndian.src,
  welcomeLegacyLatina: MEDIA_ASSETS.welcome.legacyLatina.src,
  welcomeLegacyChinese: MEDIA_ASSETS.welcome.legacyChinese.src,
  welcomeLegacyBrazilian: MEDIA_ASSETS.welcome.legacyBrazilian.src,
  heritageHero: MEDIA_ASSETS.farewell.elderGyeNyame.src,
  whiteSwanFilmPoster: MEDIA_ASSETS.farewell.whiteSwanPoster.src,
  eventsStoriesHero: MEDIA_ASSETS.events.ernestinaPortrait.src,
  homepageHero: MEDIA_ASSETS.home.adinkraHero.src,
  legacyRecordTabLandscape: MEDIA_ASSETS.record.studioLandscape.src,
  legacyRecordAfrica: MEDIA_ASSETS.record.ghanaMarmah.src,
  welcomeLegacyAfrica: MEDIA_ASSETS.welcome.legacyGhana.src,
  frenchBase: MEDIA_ASSETS.welcome.legacyFrench.src,
} as const;

/** Shared left-to-right hero overlay (homepage, Events, Heritage). */
export const HERO_OVERLAY_GRADIENT =
  "linear-gradient(to right, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.15) 100%)";

/** Matches `Hero` header shell — full viewport width, no card radius. */
export const HERO_SHELL_CLASS =
  "relative -mt-20 flex w-full min-h-[calc(100dvh+5rem)] items-stretch justify-center overflow-hidden sm:-mt-24 sm:min-h-[calc(100vh+6rem)]";

export const HERO_CONTENT_CLASS =
  "relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-1 items-end pt-28 md:pt-32 pl-[var(--beiza-site-padding-x,1.25rem)] pr-[var(--beiza-site-padding-x,1.25rem)]";

/** Bottom padding for hero copy — always % of viewport height (see --hero-copy-raise). */
export const HERO_CONTENT_BOTTOM_STYLE = {
  paddingBottom: "calc(var(--hero-copy-raise, 38) * 1vh)",
} as const;
