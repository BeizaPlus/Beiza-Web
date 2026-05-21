import { BRAND_IMAGES } from "@/lib/brandImages";
import { GHANA_MARMAH_IMAGE } from "@/lib/locale/ghanaEntry";
import type { BeizaCharacterLocale, BeizaLocale, WelcomePathKey } from "@/lib/locale/types";

/** Shared across all regions — only the center Legacy card swaps */
const SHARED_EDUCATION = {
  src: BRAND_IMAGES.homepageHero,
  alt: "Hands holding Adinkra symbol blocks",
} as const;

const SHARED_FAREWELL = {
  src: BRAND_IMAGES.heritageHero,
  alt: "Elder in red kente before Gye Nyame carving",
} as const;

/** `/public/images/beiza-welcome-legacy-{character}.{ext}` */
export const WELCOME_LEGACY_CHARACTER_IMAGES: Record<
  BeizaCharacterLocale,
  { src: string; alt: string }
> = {
  "black-american": {
    src: "/images/beiza-welcome-legacy-black-american.jpg",
    alt: "Black American — preserve a life story",
  },
  indian: {
    src: "/images/beiza-welcome-legacy-indian.jpg",
    alt: "Indian — preserve a life story",
  },
  latina: {
    src: "/images/beiza-welcome-legacy-latina.jpg",
    alt: "Latina — preserve a life story",
  },
  chinese: {
    src: "/images/beiza-welcome-legacy-chinese.png",
    alt: "Chinese — preserve a life story",
  },
  brazilian: {
    src: "/images/beiza-welcome-legacy-brazilian.png",
    alt: "Brazilian — preserve a life story",
  },
};

const WELCOME_LEGACY_IMAGE_BY_LOCALE: Record<BeizaLocale, { src: string; alt: string }> = {
  ...WELCOME_LEGACY_CHARACTER_IMAGES,
  africa: {
    src: GHANA_MARMAH_IMAGE.welcomeSrc,
    alt: GHANA_MARMAH_IMAGE.alt,
  },
  fr: WELCOME_LEGACY_CHARACTER_IMAGES["black-american"],
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
