/** On-page SEO + AEO — titles, descriptions, canonical, JSON-LD (not a Google ranking guarantee). */

import { DEFAULT_OG_IMAGE, absoluteMediaUrl } from "@/lib/mediaAssets";

export const BEIZA_SITE_ORIGIN = "https://www.beizaplus.com";

/** Shared keywords — Storyworth-adjacent family storytelling + cultural legacy */
export const BEIZA_SEO_KEYWORDS = [
  "family legacy",
  "voice vault",
  "record family stories",
  "Storyworth alternative",
  "family interview questions",
  "cultural heritage",
  "family tree",
  "memorial",
  "Adinkra",
  "Ghana legacy",
  "intentional legacy",
  "preserve grandparents voices",
  "family memoir",
  "homegoing",
  "White Swan memorial",
] as const;

export type PageSeoConfig = {
  title: string;
  description: string;
  /** Path only, e.g. /legacy/record */
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  keywords?: string[];
  /** AEO: speakable summary for answer engines */
  speakableSummary?: string;
};

export const DEFAULT_SEO: PageSeoConfig = {
  title: "Beiza — Family Legacy, Cultural Stories & Voice Vault | Storyworth-Style Interviews",
  description:
    "Preserve family voices like Storyworth — record life stories in any language, explore cultural heritage films, and build an intentional legacy vault for every generation.",
  path: "/",
  keywords: [...BEIZA_SEO_KEYWORDS],
  ogImage: absoluteMediaUrl(DEFAULT_OG_IMAGE),
  speakableSummary:
    "Beiza helps families record voices, build family trees, and preserve cultural stories in a private legacy vault.",
};

const ROUTE_SEO: Record<string, PageSeoConfig> = {
  "/": {
    title: "Beiza Welcome — Learn Culture, Record Legacy, Honor Farewell",
    description:
      "Choose your path: cultural immersion, record a family memory in your language (Storyworth-style prompts), or craft a dignified farewell. One vault for every generation.",
    path: "/",
    keywords: ["welcome", "family legacy app", "record memory", "cultural education", "Storyworth"],
    ogImage: absoluteMediaUrl(DEFAULT_OG_IMAGE),
    speakableSummary: "Start at Beiza welcome: education, legacy recording, or farewell heritage.",
  },
  "/welcome": {
    title: "Beiza Welcome — Learn Culture, Record Legacy, Honor Farewell",
    description:
      "Choose your path: cultural immersion films, record a family memory, or craft a memorial with dignity.",
    path: "/welcome",
    ogImage: absoluteMediaUrl(DEFAULT_OG_IMAGE),
  },
  "/home": {
    title: "Build Intentional Legacy — Beiza Family Circle | Storyworth-Style Vault",
    description:
      "Start your family circle, preserve voices and stories with interview-style recording, and turn memories into a memoir that lasts for generations.",
    path: "/home",
    keywords: ["intentional legacy", "family circle", "Storyworth", "voice vault", "memoir"],
    ogImage: absoluteMediaUrl(DEFAULT_OG_IMAGE),
    speakableSummary:
      "Beiza home is where families build intentional legacy — record, vault, and share across generations.",
  },
  "/education": {
    title: "Cultural Education & Heritage Symbols — Beiza",
    description:
      "Immersive cultural films and Adinkra wisdom — step into your roots, then preserve your family's story in Legacy.",
    path: "/education",
    ogImage: absoluteMediaUrl(DEFAULT_OG_IMAGE),
  },
  "/education/story-questions": {
    title: "52 Family Story Questions — Beiza Legacy & Storyworth-Style Prompts",
    description:
      "Adinkra-inspired family interview questions to record elders, parents, and children — use with Beiza Legacy vault.",
    path: "/education/story-questions",
    keywords: ["family story questions", "Storyworth questions", "interview parents", "Adinkra"],
    ogImage: absoluteMediaUrl("/images/beiza-storyworth-heritage-memoir-legacy-hero.jpg"),
  },
  "/legacy/record": {
    title: "Record a Memory — Beiza Legacy Voice Vault",
    description:
      "Capture a voice or story and seal it in your family vault. Magic-link sign-in, any language, one recording studio for every region.",
    path: "/legacy/record",
    ogImage: absoluteMediaUrl("/images/beiza-storyworth-record-hero-studio-landscape.png"),
    speakableSummary: "Record a family memory in the Beiza studio and save it to your private vault.",
  },
  "/legacy": {
    title: "Beiza Legacy — Family Tree, Vault & Invitations",
    description: "Your family legacy home — tree, vault, record station, and circle invitations in one place.",
    path: "/legacy",
  },
  "/legacy/circle": {
    title: "Family Tree & Legacy Circle — Beiza",
    description:
      "Sign in to grow your family tree, link voices to people, and preserve biographies for answer engines and grandchildren.",
    path: "/legacy/circle",
    keywords: ["family tree", "legacy circle", "genealogy", "Storyworth family"],
  },
  "/legacy/vault": {
    title: "Legacy Vault — Preserved Family Voices | Beiza",
    description: "Listen to sealed memories and stories in your family's private voice vault.",
    path: "/legacy/vault",
  },
  "/heritage": {
    title: "Preserve Heritage & Life Stories — Beiza Legacy Memoir",
    description:
      "Capture voices, build your family tree, and preserve a life story for generations — Storyworth depth with cultural heritage.",
    path: "/heritage",
    ogImage: absoluteMediaUrl("/images/beiza-storyworth-heritage-memoir-legacy-hero.jpg"),
  },
  "/farewell": {
    title: "Craft a Memorial & Farewell — Beiza White Swan Heritage",
    description: "Memorial art, legacy vessels, and farewell heritage crafted with dignity and beauty.",
    path: "/farewell",
    ogImage: absoluteMediaUrl("/images/beiza-storyworth-farewell-white-swan-film-poster.png"),
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
  "/events": {
    title: "Events & Life Stories — Beiza",
    description: "Live homegoing productions and streaming memoirs — Ernestina, Monica Manu, and more.",
    path: "/events",
    ogImage: absoluteMediaUrl("/images/beiza-storyworth-events-ernestina-portrait-bw.png"),
  },
  "/circle": {
    title: "Family Circles Directory — Beiza",
    description: "Enter a family circle with a secure code and preserve shared legacy.",
    path: "/circle",
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
      ogImage: base.ogImage ?? absoluteMediaUrl(DEFAULT_OG_IMAGE),
    };
  }
  return null;
}

export function resolveSeoForPath(pathname: string): PageSeoConfig {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const regional = regionalSeo(normalized);
  if (regional) return regional;
  const exact = ROUTE_SEO[normalized];
  if (exact) {
    return {
      ...exact,
      path: normalized,
      ogImage: exact.ogImage ?? absoluteMediaUrl(DEFAULT_OG_IMAGE),
      keywords: exact.keywords ?? [...BEIZA_SEO_KEYWORDS],
    };
  }

  if (normalized.startsWith("/education")) {
    return { ...ROUTE_SEO["/education"], path: normalized, ogImage: absoluteMediaUrl(DEFAULT_OG_IMAGE) };
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
    alternateName: ["Beiza Plus", "Beiza Legacy"],
    url: BEIZA_SITE_ORIGIN,
    description: DEFAULT_SEO.description,
    keywords: BEIZA_SEO_KEYWORDS.join(", "),
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
    logo: absoluteMediaUrl("/Beiza_White.svg"),
    description: DEFAULT_SEO.speakableSummary,
    sameAs: [] as string[],
  };
}

/** AEO: software application + service offering */
export function legacyProductJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Beiza Legacy",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Family legacy vault with Storyworth-style voice recording",
    },
    description:
      "Record family stories, build a tree, and store voices in a private vault — cultural heritage and farewell memorial tools included.",
    url: `${BEIZA_SITE_ORIGIN}/legacy/record`,
    image: absoluteMediaUrl("/images/beiza-storyworth-record-hero-studio-landscape.png"),
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Beiza like Storyworth?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Beiza offers Storyworth-style family interview recording and vault storage, plus cultural education, family tree, and memorial farewell heritage for global families.",
        },
      },
      {
        "@type": "Question",
        name: "How do I record a family memory on Beiza?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open Legacy → Record, sign in with a magic link, and use the recording studio. Your voice is sealed in your family vault for every generation.",
        },
      },
      {
        "@type": "Question",
        name: "What is intentional legacy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Intentional legacy means choosing to preserve voices, stories, and cultural symbols before they are lost — not only after a loss.",
        },
      },
    ],
  };
}
