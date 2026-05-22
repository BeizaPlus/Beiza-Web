import { BRAND_IMAGES } from "@/lib/brandImages";
import { MEDIA_ASSETS } from "@/lib/mediaAssets";
import { FRENCH_LOCALE_IMAGE } from "@/lib/locale/frenchEntry";
import { GHANA_MARMAH_IMAGE } from "@/lib/locale/ghanaEntry";
import type { BeizaCharacterLocale, BeizaLocale, WelcomePathKey } from "@/lib/locale/types";

/** Shared across all regions — only the center Legacy card swaps */
const SHARED_EDUCATION = MEDIA_ASSETS.home.adinkraHero;

const SHARED_FAREWELL = MEDIA_ASSETS.farewell.elderGyeNyame;

/** `/public/images/beiza-welcome-legacy-{character}.{ext}` */
export const WELCOME_LEGACY_CHARACTER_IMAGES: Record<
  BeizaCharacterLocale,
  { src: string; alt: string }
> = {
  "black-american": MEDIA_ASSETS.welcome.legacyBlackAmerican,
  indian: MEDIA_ASSETS.welcome.legacyIndian,
  latina: MEDIA_ASSETS.welcome.legacyLatina,
  chinese: MEDIA_ASSETS.welcome.legacyChinese,
  brazilian: MEDIA_ASSETS.welcome.legacyBrazilian,
};

const WELCOME_LEGACY_IMAGE_BY_LOCALE: Record<BeizaLocale, { src: string; alt: string }> = {
  ...WELCOME_LEGACY_CHARACTER_IMAGES,
  africa: {
    src: GHANA_MARMAH_IMAGE.welcomeSrc,
    alt: GHANA_MARMAH_IMAGE.alt,
  },
  fr: {
    src: FRENCH_LOCALE_IMAGE.welcomeSrc,
    alt: FRENCH_LOCALE_IMAGE.alt,
  },
};

export function getWelcomeLegacyImage(locale: BeizaLocale) {
  return WELCOME_LEGACY_IMAGE_BY_LOCALE[locale];
}

function legacyForLocale(locale: BeizaLocale) {
  return getWelcomeLegacyImage(locale);
}

export const WELCOME_CARD_IMAGES: Record<BeizaLocale, Record<WelcomePathKey, { src: string; alt: string }>> =
  Object.fromEntries(
    (Object.keys(WELCOME_LEGACY_IMAGE_BY_LOCALE) as BeizaLocale[]).map((locale) => [
      locale,
      {
        education: SHARED_EDUCATION,
        legacy: legacyForLocale(locale),
        farewell: SHARED_FAREWELL,
      },
    ]),
  ) as Record<BeizaLocale, Record<WelcomePathKey, { src: string; alt: string }>>;

export function getWelcomeCardImage(locale: BeizaLocale, path: WelcomePathKey) {
  if (path === "legacy") return getWelcomeLegacyImage(locale);
  return path === "education" ? SHARED_EDUCATION : SHARED_FAREWELL;
}
