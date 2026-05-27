/**
 * Product philosophy — single source for public copy guards and lane rules.
 * Full brief: docs/product/PHILOSOPHY-UX-BRIEF.md
 */
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

export const PRODUCT_CORE_BELIEF = "Legacy is intention, not loss.";

/** Education home hero — Option A (docs/product/PHILOSOPHY-UX-BRIEF.md) */
export const EDUCATION_HERO_HEADING = "This is where you come from.";

export const EDUCATION_HERO_SUBHEADING =
  "Learn your roots, record your family's voice, and carry the symbols of your people forward.";

export const EDUCATION_HERO_CTA_LABEL = "Start Your Legacy";

/** Quiet farewell reveal — Legacy record/vault only (never on /home) */
export const FAREWELL_REVEAL_NUDGE = "When the time comes, Beiza walks with you.";

export const FAREWELL_REVEAL_PATH = BEIZA_LINKS.farewell.heritage;

/** Words and phrases forbidden on death-free pages (education + legacy record/vault UI). */
export const DEATH_FREE_ZONE_PATTERN =
  /\b(loss|goodbye|farewells?|grief|memorial|passed away|life well lived|never been about loss|funeral|coffin|burial|mourning|passing|homegoing|when they(?:'re| are) gone)\b/i;

export const LEGACY_MARKETING_HEADING_PATTERN =
  /\b(build intentional legacy|our legacy)\b/i;

export const PRODUCT_PATHS = {
  education: {
    label: "Education",
    description: "Learn culture — symbols, films, language, prompts",
    routes: [BEIZA_LINKS.home.educationHome, BEIZA_LINKS.education.culturalImmersion],
  },
  legacy: {
    label: "Legacy",
    description: "Record, vault, tree, circle",
    routes: [
      BEIZA_LINKS.legacy.recordStation,
      BEIZA_LINKS.legacy.vault,
      BEIZA_LINKS.circle.directory,
    ],
  },
  farewell: {
    label: "Farewell",
    description: "Heritage, White Swan, memorial planning",
    routes: [BEIZA_LINKS.farewell.heritage, BEIZA_LINKS.legacy.heritage],
  },
  recover: {
    label: "Recovery",
    description: "Retrieve voices after loss — only path that may name grief",
    routes: [BEIZA_LINKS.marketing.recover],
  },
} as const;
