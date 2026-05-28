/**
 * Education home (`/home`) — death-free zone.
 * Constants: `productPhilosophy.ts` · Brief: `docs/product/PHILOSOPHY-UX-BRIEF.md`
 */
import {
  DEATH_FREE_ZONE_PATTERN,
  EDUCATION_HERO_HEADING,
  EDUCATION_HERO_SUBHEADING,
  LEGACY_MARKETING_HEADING_PATTERN,
} from "@/lib/productPhilosophy";
import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import type { BeizaLocale } from "@/lib/locale/types";

export { EDUCATION_HERO_HEADING, EDUCATION_HERO_SUBHEADING };

/** Hero subcopy when user picks Global / Ghana / Spanish / French on `/home`. */
export function educationHomeLocaleSubheading(locale: BeizaLocale): string {
  return welcomeCopyForLocale(locale).paths.education.subtitle;
}

/** Replace farewell/loss or old marketing hero titles on education home. */
export function educationHeroHeading(incoming?: string | null): string {
  const text = incoming?.trim();
  if (!text || DEATH_FREE_ZONE_PATTERN.test(text) || LEGACY_MARKETING_HEADING_PATTERN.test(text)) {
    return EDUCATION_HERO_HEADING;
  }
  return text;
}

/** Replace farewell/loss hero copy with education-first messaging. */
export function educationHeroSubheading(incoming?: string | null): string {
  const text = incoming?.trim();
  if (!text || DEATH_FREE_ZONE_PATTERN.test(text)) {
    return EDUCATION_HERO_SUBHEADING;
  }
  return text;
}
