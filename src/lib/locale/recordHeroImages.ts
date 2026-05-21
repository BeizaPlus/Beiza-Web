import { BRAND_IMAGES } from "@/lib/brandImages";
import { FRENCH_LOCALE_IMAGE, isFrenchEntryLocale } from "@/lib/locale/frenchEntry";
import { GHANA_MARMAH_IMAGE, isGhanaEntryLocale } from "@/lib/locale/ghanaEntry";
import type { BeizaLocale } from "@/lib/locale/types";

export type RecordStationHeroImage = {
  src: string;
  alt: string;
  objectPosition: string;
};

/** Ghana (GH) default — Marmah */
const GHANA_RECORD_HERO: RecordStationHeroImage = {
  src: GHANA_MARMAH_IMAGE.src,
  alt: GHANA_MARMAH_IMAGE.alt,
  objectPosition: GHANA_MARMAH_IMAGE.objectPosition,
};

/** Other locales — same record tool, studio portrait (fallback if landscape asset missing) */
const STUDIO_RECORD_HERO: RecordStationHeroImage = {
  src: BRAND_IMAGES.legacyRecordTabLandscape,
  alt: "Recording studio — central framing",
  objectPosition: "center 42%",
};

const STUDIO_RECORD_HERO_FALLBACK: RecordStationHeroImage = {
  src: BRAND_IMAGES.welcomeLegacyBlackAmerican,
  alt: "Preserve a life story",
  objectPosition: "center 38%",
};

const FRENCH_RECORD_HERO: RecordStationHeroImage = {
  src: FRENCH_LOCALE_IMAGE.src,
  alt: FRENCH_LOCALE_IMAGE.alt,
  objectPosition: FRENCH_LOCALE_IMAGE.objectPosition,
};

/**
 * Record hero image by locale. Personas differ in translation + portrait only;
 * recording UI is identical (`RecordMemoryView`).
 */
export function getRecordStationHeroImage(locale: BeizaLocale): RecordStationHeroImage {
  if (isGhanaEntryLocale(locale)) return GHANA_RECORD_HERO;
  if (isFrenchEntryLocale(locale)) return FRENCH_RECORD_HERO;
  return STUDIO_RECORD_HERO;
}

/** Primary + fallback src for <img> onerror */
export function getRecordStationHeroSources(locale: BeizaLocale): {
  primary: RecordStationHeroImage;
  fallback: RecordStationHeroImage;
} {
  if (isGhanaEntryLocale(locale)) {
    return { primary: GHANA_RECORD_HERO, fallback: STUDIO_RECORD_HERO_FALLBACK };
  }
  if (isFrenchEntryLocale(locale)) {
    return { primary: FRENCH_RECORD_HERO, fallback: STUDIO_RECORD_HERO_FALLBACK };
  }
  return { primary: STUDIO_RECORD_HERO, fallback: STUDIO_RECORD_HERO_FALLBACK };
}

/** Default when locale is GH / africa (site default entry). */
export function getDefaultRecordStationHeroImage(): RecordStationHeroImage {
  return GHANA_RECORD_HERO;
}
