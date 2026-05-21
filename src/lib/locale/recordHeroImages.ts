import { BRAND_IMAGES } from "@/lib/brandImages";
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

/** Other locales — same record tool, studio portrait */
const STUDIO_RECORD_HERO: RecordStationHeroImage = {
  src: BRAND_IMAGES.legacyRecordTabLandscape,
  alt: "Recording studio — central framing",
  objectPosition: "center 42%",
};

/**
 * Record hero image by locale. Personas differ in translation + portrait only;
 * recording UI is identical (`RecordMemoryView`).
 */
export function getRecordStationHeroImage(locale: BeizaLocale): RecordStationHeroImage {
  return isGhanaEntryLocale(locale) ? GHANA_RECORD_HERO : STUDIO_RECORD_HERO;
}

/** Default when locale is GH / africa (site default entry). */
export function getDefaultRecordStationHeroImage(): RecordStationHeroImage {
  return GHANA_RECORD_HERO;
}
