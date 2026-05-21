import { BRAND_IMAGES } from "@/lib/brandImages";
import type { BeizaLocale } from "@/lib/locale/types";

/** French (FR) locale — welcome Legacy card, record hero, immersion poster. */
export const FRENCH_LOCALE_IMAGE = {
  src: BRAND_IMAGES.frenchBase,
  welcomeSrc: BRAND_IMAGES.frenchBase,
  alt: "French heritage — preserve a life story in conversation",
  objectPosition: "center 32%",
} as const;

export function isFrenchEntryLocale(locale: BeizaLocale): boolean {
  return locale === "fr";
}
