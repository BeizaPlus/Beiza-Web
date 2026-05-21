import { BRAND_IMAGES } from "@/lib/brandImages";
import type { BeizaLocale } from "@/lib/locale/types";
import { BEIZA_DEFAULT_LOCALE } from "@/lib/locale/welcomeLanguageOptions";

/** Marmah — default Ghana (GH) entry imagery (welcome Legacy card + record hero). */
export const GHANA_MARMAH_IMAGE = {
  src: BRAND_IMAGES.legacyRecordAfrica,
  welcomeSrc: BRAND_IMAGES.welcomeLegacyAfrica,
  alt: "Marmah sharing her story — Beiza recording",
  objectPosition: "center 38%",
} as const;

export function isGhanaEntryLocale(locale: BeizaLocale): boolean {
  return locale === "africa";
}

export function isDefaultGhanaEntry(): boolean {
  return BEIZA_DEFAULT_LOCALE === "africa";
}
