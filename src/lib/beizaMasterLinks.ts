/**
 * Beiza link mastersheet (code) — single source of truth for product routes.
 * Human spreadsheet: docs/LINK-MASTERSHEET.md
 * Run: npm run links:check
 */
import type { BeizaLocale, WelcomePathKey } from "@/lib/locale/types";
import { BEIZA_LOCALES } from "@/lib/locale/types";

/** Stable path constants */
export const BEIZA_LINKS = {
  welcome: {
    gate: "/",
    alias: "/welcome",
  },
  /** Marketing home — hero "Build Intentional Legacy" (welcome Education card) */
  home: {
    intentionalLegacy: "/home",
  },
  education: {
    /** Adinkra symbols hub — direct nav only, not welcome Education card */
    hub: "/education",
    storyQuestions: "/education/story-questions",
  },
  legacy: {
    recordStation: "/legacy/record",
    heritage: "/heritage",
    app: "/legacy",
    vault: "/legacy/vault",
    family: "/legacy/family",
    circle: "/legacy/circle",
  },
  farewell: {
    heritage: "/farewell",
    whiteSwanRedirect: "/white-swan",
  },
  circle: {
    directory: "/circle",
    familyTreesAlias: "/family-trees",
    enter: (id: string) => `/circle/${id}/enter`,
    tree: (id: string) => `/circle/${id}/tree`,
    record: (id: string) => `/circle/${id}/record`,
  },
  marketing: {
    pricing: "/pricing",
    pricingLegacyCuration: "/pricing#legacy-curation",
    contact: "/contact",
    contactHero: "/contact#hero",
    events: "/events",
    blog: "/blog",
    memoirs: "/memoirs",
    vaultExplore: "/vault/explore",
    recover: "/recover",
    download: "/download",
    orderConfirmation: "/order-confirmation",
  },
  record: {
    alias: "/record",
  },
  tribute: {
    base: "/tribute",
  },
  memory: {
    share: (token: string) => `/memory/${token}`,
  },
  admin: {
    base: "/admin",
  },
} as const;

/** Permanent redirects defined in App.tsx */
export const BEIZA_REDIRECTS = {
  gallery: { from: "/gallery", to: BEIZA_LINKS.circle.directory },
  vault: { from: "/vault", to: BEIZA_LINKS.legacy.vault },
  familyTrees: { from: BEIZA_LINKS.circle.familyTreesAlias, to: BEIZA_LINKS.circle.directory },
  whiteSwan: { from: BEIZA_LINKS.farewell.whiteSwanRedirect, to: BEIZA_LINKS.farewell.heritage },
} as const;

/** URL prefix per locale (empty = default US paths) */
export const REGIONAL_PREFIX: Record<BeizaLocale, string> = {
  "black-american": "",
  indian: "/in",
  latina: "/la",
  chinese: "/zh",
  brazilian: "/br",
  fr: "/fr",
  africa: "/af",
};

export function regionalHeritagePath(locale: BeizaLocale): string {
  const prefix = REGIONAL_PREFIX[locale];
  return prefix ? `${prefix}/heritage` : BEIZA_LINKS.legacy.heritage;
}

export function regionalFarewellPath(locale: BeizaLocale): string {
  const prefix = REGIONAL_PREFIX[locale];
  return prefix ? `${prefix}/farewell` : BEIZA_LINKS.farewell.heritage;
}

export function regionalEducationWrapperPath(locale: BeizaLocale): string {
  const prefix = REGIONAL_PREFIX[locale];
  return prefix ? `${prefix}/education` : BEIZA_LINKS.education.hub;
}

/** Welcome gate card destinations per locale (before Legacy card override) */
function buildWelcomeRegionalRoutes(): Record<BeizaLocale, Record<WelcomePathKey, string>> {
  const routes = {} as Record<BeizaLocale, Record<WelcomePathKey, string>>;
  for (const locale of BEIZA_LOCALES) {
    routes[locale] = {
      education: BEIZA_LINKS.home.intentionalLegacy,
      legacy: regionalHeritagePath(locale),
      farewell: regionalFarewellPath(locale),
    };
  }
  return routes;
}

export const WELCOME_REGIONAL_ROUTES = buildWelcomeRegionalRoutes();

/** Locked welcome card hrefs — do not change without updating docs/LINK-MASTERSHEET.md */
export const WELCOME_CARD_TARGETS = {
  education: BEIZA_LINKS.home.intentionalLegacy,
  legacy: BEIZA_LINKS.legacy.recordStation,
} as const;

export function getWelcomeRoute(locale: BeizaLocale, path: WelcomePathKey): string {
  return WELCOME_REGIONAL_ROUTES[locale][path];
}

/** Href for a welcome gate path card */
export function getWelcomeCardHref(locale: BeizaLocale, path: WelcomePathKey): string {
  if (path === "legacy") return WELCOME_CARD_TARGETS.legacy;
  if (path === "education") return WELCOME_CARD_TARGETS.education;
  return getWelcomeRoute(locale, path);
}

/** Expected EN welcome card hrefs in DOM order: Education · Legacy · Farewell */
export function getWelcomeCardHrefsEn(): [string, string, string] {
  return [
    WELCOME_CARD_TARGETS.education,
    WELCOME_CARD_TARGETS.legacy,
    regionalFarewellPath("black-american"),
  ];
}

/** Invariants enforced by npm run links:check */
export const LINK_MASTERSHEET_INVARIANTS = [
  {
    id: "welcome-education-to-home",
    description: "Welcome Education card → /home (Build Intentional Legacy)",
    expected: WELCOME_CARD_TARGETS.education,
  },
  {
    id: "welcome-legacy-to-record",
    description: "Welcome Legacy card → /legacy/record",
    expected: WELCOME_CARD_TARGETS.legacy,
  },
  {
    id: "production-education-lead-in",
    description: "Production education lead-in matches beizaplus.com/home",
    expected: "/home",
  },
] as const;
