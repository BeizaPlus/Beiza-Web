import { useEffect } from "react";
import {
  canonicalUrl,
  faqPageJsonLd,
  legacyProductJsonLd,
  organizationJsonLd,
  webSiteJsonLd,
  type PageSeoConfig,
} from "@/lib/seo/siteSeo";
import { absoluteMediaUrl } from "@/lib/mediaAssets";

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

type PageSeoProps = {
  config: PageSeoConfig;
  /** Welcome + home benefit from WebSite + Organization schema */
  includeSiteSchema?: boolean;
};

export function PageSeo({ config, includeSiteSchema = false }: PageSeoProps) {
  useEffect(() => {
    const path = config.path ?? "/";
    const canonical = canonicalUrl(path);

    document.title = config.title;
    upsertMeta("description", config.description);
    upsertMeta("robots", config.noindex ? "noindex, nofollow" : "index, follow");
    if (config.keywords?.length) {
      upsertMeta("keywords", config.keywords.join(", "));
    }

    upsertLink("canonical", canonical);
    upsertMeta("og:title", config.title, "property");
    upsertMeta("og:description", config.description, "property");
    upsertMeta("og:url", canonical, "property");
    upsertMeta("og:type", "website", "property");
    const ogImage = config.ogImage ? absoluteMediaUrl(config.ogImage) : undefined;
    if (ogImage) {
      upsertMeta("og:image", ogImage, "property");
      upsertMeta("twitter:image", ogImage);
    }

    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", config.title);
    upsertMeta("twitter:description", config.description);

    if (includeSiteSchema) {
      upsertJsonLd("beiza-jsonld-website", webSiteJsonLd());
      upsertJsonLd("beiza-jsonld-org", organizationJsonLd());
      upsertJsonLd("beiza-jsonld-product", legacyProductJsonLd());
      upsertJsonLd("beiza-jsonld-faq", faqPageJsonLd());
    }
  }, [config, includeSiteSchema]);

  return null;
}
