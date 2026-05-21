/** On-page SEO — titles, descriptions, canonical, JSON-LD (not a Google ranking guarantee). */

export const BEIZA_SITE_ORIGIN = "https://www.beizaplus.com";

export type PageSeoConfig = {
  title: string;
  description: string;
  /** Path only, e.g. /legacy/record */
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  keywords?: string[];
};

export const DEFAULT_SEO: PageSeoConfig = {
  title: "Beiza — Family Legacy, Cultural Stories & Voice Vault",
  description:
    "Preserve family voices, record life stories, explore cultural heritage videos, and build an intentional legacy vault for every generation.",
  path: "/",
  keywords: [
    "family legacy",
    "voice vault",
    "record family stories",
    "cultural heritage",
    "family tree",
    "memorial",
    "Adinkra",
    "Ghana legacy",
  ],
};

const ROUTE_SEO: Record<string, PageSeoConfig> = {
  "/": {
    title: "Beiza Welcome — Learn Culture, Record Legacy, Honor Farewell",
    description:
      "Choose your path: cultural immersion films, record a family memory in your language, or craft a dignified farewell. One vault for every generation.",
    path: "/",
    keywords: ["welcome", "family legacy app", "record memory", "cultural education"],
  },
  "/welcome": {
    title: "Beiza Welcome — Learn Culture, Record Legacy, Honor Farewell",
    description:
      "Choose your path: cultural immersion films, record a family memory in your language, or craft a dignified farewell.",
    path: "/welcome",
  },
  "/home": {
    title: "Build Intentional Legacy — Beiza Family Circle",
    description:
      "Start your family circle, preserve voices and stories, and turn memories into a memoir that lasts for generations.",
    path: "/home",
  },
  "/education": {
    title: "Cultural Education & Heritage Symbols — Beiza",
    description:
      "Immersive cultural films and Adinkra wisdom — step into your roots, then preserve your family's story in Legacy.",
    path: "/education",
  },
  "/legacy/record": {
    title: "Record a Memory — Beiza Legacy Voice Vault",
    description:
      "Capture a voice or story and seal it in your family vault. Magic-link sign-in, any language, one recording studio for every region.",
    path: "/legacy/record",
  },
  "/legacy": {
    title: "Beiza Legacy — Family Tree, Vault & Invitations",
    description: "Your family legacy home — tree, vault, record station, and circle invitations in one place.",
    path: "/legacy",
  },
  "/legacy/vault": {
    title: "Legacy Vault — Preserved Family Voices | Beiza",
    description: "Listen to sealed memories and stories in your family's private voice vault.",
    path: "/legacy/vault",
  },
  "/heritage": {
    title: "Preserve Heritage & Life Stories — Beiza Legacy",
    description: "Capture voices, build your family tree, and preserve a life story for generations.",
    path: "/heritage",
  },
  "/farewell": {
    title: "Craft a Memorial & Farewell — Beiza",
    description: "Memorial art, legacy vessels, and farewell heritage crafted with dignity and beauty.",
    path: "/farewell",
  },
  "/contact": {
    title: "Contact Beiza — Legacy & Memorial Support",
    description: "Reach Beiza for legacy curation, memorial planning, and family vault support.",
    path: "/contact",
  },
  "/pricing": {
    title: "Plans & Pricing — Beiza Legacy Curation",
    description: "Transparent plans for family legacy vault, recording, and memoir curation.",
    path: "/pricing",
  },
};

const REGIONAL_PREFIXES = ["/af", "/fr", "/in", "/la", "/zh", "/br"] as const;

function regionalSeo(pathname: string): PageSeoConfig | null {
  for (const prefix of REGIONAL_PREFIXES) {
    if (!pathname.startsWith(prefix)) continue;
    const rest = pathname.slice(prefix.length) || "/";
    const base = ROUTE_SEO[rest] ?? ROUTE_SEO["/"];
    const region = prefix.slice(1).toUpperCase();
    return {
      ...base,
      title: `${base.title} (${region})`,
      path: pathname,
      description: `${base.description} Regional experience for ${region}.`,
    };
  }
  return null;
}

export function resolveSeoForPath(pathname: string): PageSeoConfig {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const regional = regionalSeo(normalized);
  if (regional) return regional;
  const exact = ROUTE_SEO[normalized];
  if (exact) return { ...exact, path: normalized };

  if (normalized.startsWith("/education")) {
    return { ...ROUTE_SEO["/education"], path: normalized };
  }
  if (normalized.startsWith("/legacy")) {
    return { ...ROUTE_SEO["/legacy"], path: normalized };
  }

  return { ...DEFAULT_SEO, path: normalized };
}

export function canonicalUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${BEIZA_SITE_ORIGIN}${clean === "/" ? "/" : clean}`;
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Beiza",
    alternateName: "Beiza Plus",
    url: BEIZA_SITE_ORIGIN,
    description: DEFAULT_SEO.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BEIZA_SITE_ORIGIN}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Beiza Plus",
    url: BEIZA_SITE_ORIGIN,
    logo: `${BEIZA_SITE_ORIGIN}/Beiza_White.svg`,
    sameAs: [] as string[],
  };
}
