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
  /** Education home — Build Intentional Legacy (`Landing.tsx`); welcome Education card lands here */
  home: {
    educationHome: "/home",
    /** @deprecated use educationHome */
    intentionalLegacy: "/home",
  },
  education: {
    /** Legacy cultural-immersion URL — App redirects to home.educationHome */
    culturalImmersion: "/education",
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
  educationCulturalImmersion: {
    from: BEIZA_LINKS.education.culturalImmersion,
    to: BEIZA_LINKS.home.educationHome,
  },
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

/** Welcome Education card — always education home (same product for every locale) */
export function regionalEducationWrapperPath(_locale: BeizaLocale): string {
  return BEIZA_LINKS.home.educationHome;
}

/** Legacy regional cultural-immersion URLs — redirect to education home in App.tsx */
export function regionalEducationCulturalImmersionPath(locale: BeizaLocale): string {
  const prefix = REGIONAL_PREFIX[locale];
  return prefix
    ? `${prefix}/education`
    : BEIZA_LINKS.education.culturalImmersion;
}

/** Locales with a URL prefix (excludes default US) */
export const REGIONAL_PREFIX_LOCALES = BEIZA_LOCALES.filter((l) => REGIONAL_PREFIX[l] !== "");

/** Locked welcome card hrefs — do not change without updating docs/LINK-MASTERSHEET.md */
export const WELCOME_CARD_TARGETS = {
  education: BEIZA_LINKS.home.educationHome,
  legacy: BEIZA_LINKS.legacy.recordStation,
} as const;

/** Welcome gate card destinations per locale */
function buildWelcomeRegionalRoutes(): Record<BeizaLocale, Record<WelcomePathKey, string>> {
  const routes = {} as Record<BeizaLocale, Record<WelcomePathKey, string>>;
  for (const locale of BEIZA_LOCALES) {
    routes[locale] = {
      education: regionalEducationWrapperPath(locale),
      /** Middle card — always record station (see getWelcomeCardHref) */
      legacy: WELCOME_CARD_TARGETS.legacy,
      farewell: regionalFarewellPath(locale),
    };
  }
  return routes;
}

export const WELCOME_REGIONAL_ROUTES = buildWelcomeRegionalRoutes();

/** Human-readable table — keep in sync with docs/LINK-MASTERSHEET.md */
export const WELCOME_TOOLBAR_LINK_TABLE: Record<
  "GH" | "EN" | "ES" | "FR" | "CN",
  Record<WelcomePathKey, string>
> = {
  GH: {
    education: regionalEducationWrapperPath("africa"),
    legacy: WELCOME_CARD_TARGETS.legacy,
    farewell: regionalFarewellPath("africa"),
  },
  EN: {
    education: regionalEducationWrapperPath("black-american"),
    legacy: WELCOME_CARD_TARGETS.legacy,
    farewell: regionalFarewellPath("black-american"),
  },
  ES: {
    education: regionalEducationWrapperPath("latina"),
    legacy: WELCOME_CARD_TARGETS.legacy,
    farewell: regionalFarewellPath("latina"),
  },
  FR: {
    education: regionalEducationWrapperPath("fr"),
    legacy: WELCOME_CARD_TARGETS.legacy,
    farewell: regionalFarewellPath("fr"),
  },
  CN: {
    education: regionalEducationWrapperPath("chinese"),
    legacy: WELCOME_CARD_TARGETS.legacy,
    farewell: regionalFarewellPath("chinese"),
  },
};

export function getWelcomeRoute(locale: BeizaLocale, path: WelcomePathKey): string {
  return WELCOME_REGIONAL_ROUTES[locale][path];
}

/** Href for a welcome gate path card */
export function getWelcomeCardHref(locale: BeizaLocale, path: WelcomePathKey): string {
  if (path === "legacy") return WELCOME_CARD_TARGETS.legacy;
  return getWelcomeRoute(locale, path);
}

/** Expected EN welcome card hrefs in DOM order: Education · Legacy · Farewell */
export function getWelcomeCardHrefsEn(): [string, string, string] {
  return [
    regionalEducationWrapperPath("black-american"),
    WELCOME_CARD_TARGETS.legacy,
    regionalFarewellPath("black-american"),
  ];
}

/** Regional wrapper routes (`RegionalRoutePage`) — variant `legacy` = memoir marketing landing */
export function regionalAppRoutePath(locale: BeizaLocale, variant: WelcomePathKey): string {
  const prefix = REGIONAL_PREFIX[locale];
  const segment =
    variant === "education"
      ? "education"
      : variant === "farewell"
        ? "farewell"
        : "heritage";
  return prefix ? `${prefix}/${segment}` : `/${segment}`;
}

/** Legacy bottom tab bar — Home · Tree · Record · Vault · Invite */
export const LEGACY_TAB_LINKS = [
  { href: BEIZA_LINKS.legacy.app, end: true },
  { href: BEIZA_LINKS.legacy.circle },
  { href: BEIZA_LINKS.legacy.recordStation },
  { href: BEIZA_LINKS.legacy.vault },
  { href: BEIZA_LINKS.legacy.family },
] as const;

/** Nav active-path checks */
export function isFarewellPath(pathname: string): boolean {
  return (
    pathname === BEIZA_LINKS.farewell.heritage ||
    pathname.endsWith("/farewell") ||
    pathname.startsWith(BEIZA_LINKS.farewell.whiteSwanRedirect)
  );
}

export function isHeritageMarketingPath(pathname: string): boolean {
  return pathname === BEIZA_LINKS.legacy.heritage || pathname.endsWith("/heritage");
}

/** React Router `path` prop (no leading slash) */
export function routerPath(href: string): string {
  return href.startsWith("/") ? href.slice(1) : href;
}

/** Regional pages rendered by `RegionalRoutePage` (education uses redirects to `/home`) */
export const REGIONAL_ROUTE_VARIANTS = ["legacy", "farewell"] as const;

export function isCirclePath(pathname: string): boolean {
  return (
    pathname === BEIZA_LINKS.circle.directory ||
    pathname.startsWith(`${BEIZA_LINKS.circle.directory}/`) ||
    pathname.startsWith(BEIZA_LINKS.circle.familyTreesAlias) ||
    pathname.startsWith("/legacy/circle")
  );
}

/** Invariants enforced by npm run links:check */
export const LINK_MASTERSHEET_INVARIANTS = [
  {
    id: "welcome-education-to-home",
    description: "Welcome Education card (EN) → /home education home",
    expected: WELCOME_CARD_TARGETS.education,
  },
  {
    id: "welcome-legacy-to-record",
    description: "Welcome Legacy card → /legacy/record",
    expected: WELCOME_CARD_TARGETS.legacy,
  },
  {
    id: "welcome-education-all-locales",
    description: "Welcome Education card (all locales) → /home",
    expected: regionalEducationWrapperPath("africa"),
  },
] as const;
