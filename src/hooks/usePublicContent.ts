import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import {
  allowStaticContentFallback,
  isSupabaseConfigured,
  resolvePublicItem,
  resolvePublicList,
} from "@/lib/contentPolicy";
import {
  FALLBACK_CONTACT_CHANNELS,
  FALLBACK_FAQS,
  FALLBACK_FEATURED_EVENT,
  FALLBACK_EVENT_STORIES,
  FALLBACK_LIVE_EVENTS,
  FALLBACK_FOOTER_LINKS,
  FALLBACK_HERO_LANDING,
  FALLBACK_NAVIGATION_LINKS,
  FALLBACK_OFFERINGS,
  FALLBACK_PRICING,
  FALLBACK_SITE_SETTINGS,
  FALLBACK_MEMOIR_TRIBUTES,
  FALLBACK_TESTIMONIALS,
} from "@/lib/fallbackContent";

const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const GALLERY_PAGE_SIZE = 24;
const GALLERY_PATH = "gallery";

export type NavigationLink = {
  id: string;
  label: string;
  href: string;
  location: string;
  displayOrder: number;
  isCta?: boolean;
};

export type FooterLink = {
  id: string;
  label: string;
  href: string;
  groupLabel: string | null;
  displayOrder: number;
};

export type SiteSettings = {
  businessName: string;
  phonePrimary: string;
  emailPrimary: string;
  calendlyUrl: string;
  heroHeading?: string;
  heroSubheading?: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  heroBackgroundImage?: string;
  heroBackgroundAlt?: string;
  heroReviews?: string;
  footerTagline?: string;
  footer_tagline?: string;
  footerCopyrightSuffix?: string;
  social: {
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
  };
};

export type HeroSection = {
  slug: string;
  heading: string;
  subheading?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  backgroundMedia?: {
    src: string;
    alt: string;
  } | null;
  reviews?: string | null;
};

export type Offering = {
  id: string;
  title: string;
  description?: string | null;
  iconKey?: string | null;
  displayOrder: number;
  isPublished?: boolean;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role?: string | null;
  surfaces: string[];
  portraitUrl?: string | null;
  displayOrder?: number;
  isFeatured?: boolean;
  location?: string | null;
  countryCode?: string | null;
  country?: string | null;
  initials?: string | null;
  relation?: string | null;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
};

export type PricingTier = {
  id: string;
  name: string;
  tagline?: string | null;
  priceLabel?: string | null;
  description?: string | null;
  badgeLabel?: string | null;
  isRecommended: boolean;
  displayOrder: number;
  features: string[];
};

export type HeroMedia = {
  src: string;
  alt?: string | null;
};

export type FeaturedEvent = {
  id: string;
  slug: string;
  memoirSlug?: string | null;
  title: string;
  description?: string | null;
  subtitle?: string | null;
  durationLabel?: string | null;
  location?: string | null;
  occursOn?: string | null;
  heroMedia?: HeroMedia | null;
};

export type PublicEvent = FeaturedEvent & {
  isFeatured: boolean;
  isPublished: boolean;
  isLive?: boolean;
  displayOrder?: number;
};

export type EventStory = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  durationLabel?: string | null;
  memoirSlug?: string | null;
  heroMedia?: HeroMedia | null;
  isNew: boolean;
  displayOrder: number;
};

export type ContactChannel = {
  id: string;
  channelType: string;
  label?: string | null;
  value: string;
  displayOrder: number;
};

export type GalleryImageAsset = {
  id: string;
  path: string;
  src: string;
  alt: string;
  caption?: string | null;
  updatedAt?: string | null;
  memoirId?: string | null;
  memoirSlug?: string | null;
  memoirTitle?: string | null;
};

export type MemoirTribute = {
  id: string;
  name: string;
  relationship?: string | null;
  message: string;
  displayOrder: number;
};

type GalleryPage = {
  items: GalleryImageAsset[];
  nextOffset: number | null;
};

const isSupabaseReady = isSupabaseConfigured();

const handleError = (scope: string, error: Error | null | undefined) => {
  if (!error) return;
  console.warn(`[supabase:${scope}] falling back to static content:`, error.message);
};

function parseHeroMediaJson(
  heroMediaRaw: unknown,
  scope: string,
  id: string,
): HeroMedia | null {
  if (!heroMediaRaw) return null;
  try {
    let media: Record<string, unknown> | null = null;
    if (typeof heroMediaRaw === "string") {
      media = JSON.parse(heroMediaRaw) as Record<string, unknown>;
    } else if (typeof heroMediaRaw === "object" && heroMediaRaw !== null) {
      media = heroMediaRaw as Record<string, unknown>;
    }
    if (!media) return null;
    const srcValue = media.src || media.url || media.image || media.path || media.image_url;
    if (typeof srcValue !== "string" || !srcValue.trim()) return null;
    let finalSrc = srcValue.trim();
    if (!finalSrc.startsWith("http://") && !finalSrc.startsWith("https://") && !finalSrc.startsWith("/")) {
      const { data: publicUrlData } = supabase!.storage.from("public-assets").getPublicUrl(finalSrc);
      finalSrc = publicUrlData.publicUrl;
    }
    return {
      src: finalSrc,
      alt:
        typeof media.alt === "string"
          ? media.alt
          : typeof media.title === "string"
            ? media.title
            : null,
    };
  } catch (error) {
    console.warn(`[usePublicContent] Failed to parse hero_media (${scope}):`, id, error);
    return null;
  }
}

type EventRow = {
  id: string;
  slug: string;
  memoir_slug?: string | null;
  title: string;
  description?: string | null;
  subtitle?: string | null;
  duration_label?: string | null;
  location?: string | null;
  occurs_on?: string | null;
  hero_media?: unknown;
  is_featured?: boolean | null;
  is_published?: boolean | null;
  is_live?: boolean | null;
  display_order?: number | null;
};

type MemoirSnippet = {
  slug: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  hero_media?: unknown;
};

function mapEventRow(event: EventRow): PublicEvent {
  return {
    id: event.id,
    slug: event.slug,
    memoirSlug: event.memoir_slug ?? event.slug,
    title: event.title,
    description: event.description,
    subtitle: event.subtitle,
    durationLabel: event.duration_label,
    location: event.location,
    occursOn: event.occurs_on,
    heroMedia: parseHeroMediaJson(event.hero_media, "event", event.id),
    isFeatured: event.is_featured ?? false,
    isPublished: event.is_published ?? false,
    isLive: event.is_live ?? false,
    displayOrder: event.display_order ?? 0,
  };
}

async function fetchMemoirSnippetsBySlugs(slugs: string[]): Promise<Map<string, MemoirSnippet>> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (!isSupabaseReady || unique.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("memoirs")
    .select("slug, title, subtitle, summary, hero_media")
    .in("slug", unique)
    .eq("status", "published");

  if (error || !data) {
    handleError("memoirs.snippets", error);
    return new Map();
  }

  return new Map(data.map((row) => [row.slug, row as MemoirSnippet]));
}

function enrichEventWithMemoir(event: PublicEvent, memoir?: MemoirSnippet): PublicEvent {
  if (!memoir) return event;

  const memoirHero = parseHeroMediaJson(memoir.hero_media, "memoir", memoir.slug);

  return {
    ...event,
    memoirSlug: memoir.slug,
    title: memoir.title,
    subtitle: memoir.subtitle ?? event.subtitle,
    description: memoir.summary ?? event.description,
    heroMedia: memoirHero ?? event.heroMedia,
  };
}

async function mapEventsWithLinkedMemoirs(rows: EventRow[]): Promise<PublicEvent[]> {
  const memoirSlugs = rows.map((row) => row.memoir_slug ?? row.slug);
  const memoirMap = await fetchMemoirSnippetsBySlugs(memoirSlugs);

  return rows.map((row) => {
    const memoirSlug = row.memoir_slug ?? row.slug;
    return enrichEventWithMemoir(mapEventRow(row), memoirMap.get(memoirSlug));
  });
}

function enrichEventStoryWithMemoir(
  story: EventStory,
  memoir?: MemoirSnippet,
): EventStory {
  if (!memoir) return story;

  const memoirHero = parseHeroMediaJson(memoir.hero_media, "memoir", memoir.slug);

  return {
    ...story,
    memoirSlug: memoir.slug,
    heroMedia: memoirHero ?? story.heroMedia,
  };
}

const pickSetting = (map: Record<string, string>, key: string, fallback: string) => {
  const value = map[key]?.trim();
  if (value) return value;
  return allowStaticContentFallback() ? fallback : "";
};

const buildSiteSettings = (settingsMap: Record<string, string>): SiteSettings => ({
  businessName: pickSetting(settingsMap, "business_name", FALLBACK_SITE_SETTINGS.businessName),
  phonePrimary: pickSetting(settingsMap, "phone_primary", FALLBACK_SITE_SETTINGS.phonePrimary),
  emailPrimary: pickSetting(settingsMap, "email_primary", FALLBACK_SITE_SETTINGS.emailPrimary),
  calendlyUrl: pickSetting(settingsMap, "calendly_url", FALLBACK_SITE_SETTINGS.calendlyUrl),
  heroHeading: pickSetting(settingsMap, "hero_heading", FALLBACK_SITE_SETTINGS.heroHeading),
  heroSubheading: pickSetting(settingsMap, "hero_subheading", FALLBACK_SITE_SETTINGS.heroSubheading),
  heroCtaLabel: pickSetting(settingsMap, "hero_cta_label", FALLBACK_SITE_SETTINGS.heroCtaLabel),
  heroCtaHref: pickSetting(settingsMap, "hero_cta_href", FALLBACK_SITE_SETTINGS.heroCtaHref),
  heroBackgroundImage: pickSetting(settingsMap, "hero_background_image", FALLBACK_SITE_SETTINGS.heroBackgroundImage),
  heroBackgroundAlt: pickSetting(settingsMap, "hero_background_alt", FALLBACK_SITE_SETTINGS.heroBackgroundAlt),
  heroReviews: pickSetting(settingsMap, "hero_reviews", FALLBACK_SITE_SETTINGS.heroReviews),
  footerTagline: pickSetting(settingsMap, "footer_tagline", FALLBACK_SITE_SETTINGS.footerTagline),
  footer_tagline: pickSetting(settingsMap, "footer_tagline", FALLBACK_SITE_SETTINGS.footerTagline),
  footerCopyrightSuffix: pickSetting(
    settingsMap,
    "footer_copyright_suffix",
    FALLBACK_SITE_SETTINGS.footerCopyrightSuffix,
  ),
  social: {
    instagram: pickSetting(settingsMap, "instagram_url", FALLBACK_SITE_SETTINGS.social.instagram ?? ""),
    facebook: pickSetting(settingsMap, "facebook_url", FALLBACK_SITE_SETTINGS.social.facebook ?? ""),
    tiktok: pickSetting(settingsMap, "tiktok_url", FALLBACK_SITE_SETTINGS.social.tiktok ?? ""),
    youtube: pickSetting(settingsMap, "youtube_url", FALLBACK_SITE_SETTINGS.social.youtube ?? ""),
  },
});

const mapFallbackTestimonials = (): Testimonial[] =>
  FALLBACK_TESTIMONIALS.map((item) => ({
    id: item.id,
    quote: item.quote,
    author: item.author,
    role: item.role,
    surfaces: [...item.surfaces],
  }));

const mapFallbackFaqs = (): Faq[] =>
  FALLBACK_FAQS.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
    displayOrder: item.display_order,
  }));

const mapFallbackPricingTiers = (): PricingTier[] =>
  FALLBACK_PRICING.map((tier) => ({
    id: tier.id,
    name: tier.name,
    tagline: tier.tagline,
    priceLabel: tier.price_label,
    description: tier.description,
    badgeLabel: tier.badge_label,
    isRecommended: tier.is_recommended,
    displayOrder: tier.display_order,
    features: [...tier.features],
  }));

const mapFallbackOfferings = (): Offering[] =>
  FALLBACK_OFFERINGS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    iconKey: item.icon_key,
    displayOrder: item.display_order,
    isPublished: true,
  }));

const mapFallbackFeaturedEvent = (): FeaturedEvent => ({
  id: FALLBACK_FEATURED_EVENT.id,
  slug: FALLBACK_FEATURED_EVENT.slug,
  memoirSlug: FALLBACK_FEATURED_EVENT.memoir_slug,
  title: FALLBACK_FEATURED_EVENT.title,
  description: FALLBACK_FEATURED_EVENT.description,
  subtitle: FALLBACK_FEATURED_EVENT.subtitle,
  durationLabel: FALLBACK_FEATURED_EVENT.duration_label,
  location: FALLBACK_FEATURED_EVENT.location,
  occursOn: FALLBACK_FEATURED_EVENT.occurs_on,
  heroMedia: {
    src: FALLBACK_FEATURED_EVENT.hero_media.src,
    alt: FALLBACK_FEATURED_EVENT.hero_media.alt,
  },
});

const mapFallbackLiveEvents = (): PublicEvent[] =>
  FALLBACK_LIVE_EVENTS.map((event) => ({
    id: event.id,
    slug: event.slug,
    memoirSlug: event.memoir_slug,
    title: event.title,
    description: event.description,
    subtitle: event.subtitle,
    durationLabel: event.duration_label,
    location: event.location,
    occursOn: event.occurs_on,
    heroMedia: { src: event.hero_media.src, alt: event.hero_media.alt },
    isFeatured: event.slug === FALLBACK_FEATURED_EVENT.slug,
    isPublished: true,
    isLive: true,
    displayOrder: event.slug === FALLBACK_FEATURED_EVENT.slug ? 0 : 1,
  }));

const mapFallbackEventStories = (): EventStory[] =>
  FALLBACK_EVENT_STORIES.map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    subtitle: story.subtitle,
    durationLabel: story.duration_label,
    memoirSlug: story.memoir_slug,
    heroMedia: { src: story.hero_media.src, alt: story.hero_media.alt },
    isNew: story.is_new,
    displayOrder: story.display_order,
  }));

const mapFallbackContactChannels = (): ContactChannel[] =>
  FALLBACK_CONTACT_CHANNELS.map((item) => ({
    id: item.id,
    channelType: item.channel_type,
    label: item.label,
    value: item.value,
    displayOrder: item.display_order,
  }));

export const useNavigationLinks = (location = "primary") =>
  useQuery({
    queryKey: ["public-navigation-links", location],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<NavigationLink[]> => {
      const fallback = FALLBACK_NAVIGATION_LINKS.filter((link) => link.location === location);

      if (!isSupabaseReady) {
        return resolvePublicList("navigation_links", null, null, fallback, handleError);
      }

      const { data, error } = await supabase
        .from("navigation_links")
        .select("id, label, href, location, display_order")
        .eq("location", location)
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!data?.length) {
        return resolvePublicList("navigation_links", null, error, fallback, handleError);
      }

      return data.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        location: item.location ?? location,
        displayOrder: item.display_order ?? 0,
        isCta: item.label.toLowerCase() === "contact",
      }));
    },
  });

export const useFooterLinks = () =>
  useQuery({
    queryKey: ["public-footer-links"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<FooterLink[]> => {
      const fallback = [...FALLBACK_FOOTER_LINKS];

      if (!isSupabaseReady) {
        return resolvePublicList("footer_links", null, null, fallback, handleError);
      }

      const { data, error } = await supabase
        .from("footer_links")
        .select("id, label, href, group_label, display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!data?.length) {
        return resolvePublicList("footer_links", null, error, fallback, handleError);
      }

      return data.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        groupLabel: item.group_label ?? "Sections",
        displayOrder: item.display_order ?? 0,
      }));
    },
  });

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["public-site-settings"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<SiteSettings> => {
      if (!isSupabaseReady)
      {
        return buildSiteSettings({});
      }

      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .order("key", { ascending: true });

      if (error || !data)
      {
        handleError("site_settings", error);
        return buildSiteSettings({});
      }

      const settingsMap = data.reduce<Record<string, string>>((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      return buildSiteSettings(settingsMap);
    },
  });

export const useHeroSection = (slug = "landing-hero") =>
  useQuery({
    queryKey: ["public-hero-section", slug],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<HeroSection | null> => {
      if (!isSupabaseReady) {
        return null;
      }

      const { data, error } = await supabase
        .from("hero_sections")
        .select("slug, heading, subheading, cta_label, cta_href, background_media")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !data) {
        handleError("hero_sections", error);
        return null;
      }

      const backgroundMedia = parseHeroMediaJson(data.background_media, "hero-section", data.slug);

      return {
        slug: data.slug,
        heading: data.heading,
        subheading: data.subheading,
        ctaLabel: data.cta_label,
        ctaHref: data.cta_href,
        backgroundMedia: backgroundMedia
          ? { src: backgroundMedia.src, alt: backgroundMedia.alt ?? data.heading }
          : null,
        reviews: null,
      };
    },
  });

export const useOfferings = () =>
  useQuery({
    queryKey: ["public-offerings"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<Offering[]> => {
      if (!isSupabaseReady) {
        return resolvePublicList("offerings", null, null, mapFallbackOfferings(), handleError);
      }

      const { data, error } = await supabase
        .from("offerings")
        .select("id, title, description, icon_key, display_order, is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!data?.length) {
        return resolvePublicList("offerings", null, error, mapFallbackOfferings(), handleError);
      }

      return data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        iconKey: item.icon_key,
        displayOrder: item.display_order ?? 0,
        isPublished: item.is_published,
      }));
    },
  });

export const useTestimonials = (surfaces?: string | string[]) =>
  useQuery({
    queryKey: ["public-testimonials", surfaces ?? "all"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<Testimonial[]> => {
      const filterSurfaces = Array.isArray(surfaces) ? surfaces : surfaces ? [surfaces] : [];

      const applySurfaceFilter = (items: readonly Testimonial[]): Testimonial[] => {
        const normalized = items.map((item) => ({ ...item }));
        if (filterSurfaces.length === 0)
        {
          return normalized;
        }
        return normalized.filter((item) => item.surfaces.some((surface) => filterSurfaces.includes(surface)));
      };

      if (!isSupabaseReady) {
        return applySurfaceFilter(
          resolvePublicList("testimonials", null, null, mapFallbackTestimonials(), handleError),
        );
      }

      let query = supabase
        .from("testimonials")
        .select(
          "id, quote, author, role, surfaces, is_published, portrait_url, display_order, is_featured, location, country_code, country, initials, relation",
        )
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (filterSurfaces.length > 0)
      {
        query = query.contains("surfaces", filterSurfaces);
      }

      const { data, error } = await query;

      if (!data?.length) {
        return applySurfaceFilter(
          resolvePublicList("testimonials", null, error, mapFallbackTestimonials(), handleError),
        );
      }

      return applySurfaceFilter(
        data.map((item) => ({
          id: item.id,
          quote: item.quote,
          author: item.author,
          role: item.role,
          surfaces: item.surfaces ?? [],
          portraitUrl: item.portrait_url,
          displayOrder: item.display_order ?? 0,
          isFeatured: item.is_featured ?? false,
          location: item.location,
          countryCode: item.country_code,
          country: item.country,
          initials: item.initials,
          relation: item.relation,
        })),
      );
    },
  });

export const useFaqs = () =>
  useQuery({
    queryKey: ["public-faqs"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<Faq[]> => {
      if (!isSupabaseReady) {
        return resolvePublicList("faqs", null, null, mapFallbackFaqs(), handleError);
      }

      const { data, error } = await supabase
        .from("faqs")
        .select("id, question, answer, display_order, is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!data?.length) {
        return resolvePublicList("faqs", null, error, mapFallbackFaqs(), handleError);
      }

      return data.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        displayOrder: item.display_order ?? 0,
      }));
    },
  });

export const usePricingTiers = () =>
  useQuery({
    queryKey: ["public-pricing-tiers"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<PricingTier[]> => {
      if (!isSupabaseReady) {
        return resolvePublicList("pricing_tiers", null, null, mapFallbackPricingTiers(), handleError);
      }

      const { data: tiers, error: tiersError } = await supabase
        .from("pricing_tiers")
        .select("id, name, tagline, price_label, description, badge_label, is_recommended, display_order, is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!tiers?.length) {
        return resolvePublicList("pricing_tiers", null, tiersError, mapFallbackPricingTiers(), handleError);
      }

      const tierIds = tiers.map((tier) => tier.id);

      const { data: features, error: featuresError } = await supabase
        .from("pricing_features")
        .select("tier_id, label, display_order")
        .in("tier_id", tierIds)
        .order("display_order", { ascending: true });

      if (featuresError || !features)
      {
        handleError("pricing_features", featuresError);
      }

      const featuresByTier = new Map<string, string[]>();
      features?.forEach((feature) => {
        if (!featuresByTier.has(feature.tier_id))
        {
          featuresByTier.set(feature.tier_id, []);
        }
        featuresByTier.get(feature.tier_id)!.push(feature.label);
      });

      return tiers.map((tier) => ({
        id: tier.id,
        name: tier.name,
        tagline: tier.tagline,
        priceLabel: tier.price_label,
        description: tier.description,
        badgeLabel: tier.badge_label,
        isRecommended: tier.is_recommended,
        displayOrder: tier.display_order ?? 0,
        features: featuresByTier.get(tier.id) ?? [],
      }));
    },
  });

const EVENT_SELECT =
  "id, slug, memoir_slug, memoir_id, title, description, subtitle, duration_label, location, occurs_on, hero_media, is_featured, is_published, is_live, display_order";

export const useFeaturedEvent = () =>
  useQuery({
    queryKey: ["public-featured-event"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<FeaturedEvent | null> => {
      if (!isSupabaseReady) {
        return resolvePublicItem(null, mapFallbackFeaturedEvent(), null);
      }

      const { data, error } = await supabase
        .from("events")
        .select(EVENT_SELECT)
        .eq("is_featured", true)
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (!data?.length) {
        return resolvePublicItem(null, mapFallbackFeaturedEvent(), null);
      }

      const [enriched] = await mapEventsWithLinkedMemoirs(data);
      return enriched;
    },
  });

export const useLiveEvents = () =>
  useQuery({
    queryKey: ["public-live-events"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<PublicEvent[]> => {
      if (!isSupabaseReady) {
        return resolvePublicList("live-events", null, null, mapFallbackLiveEvents(), handleError);
      }

      const { data, error } = await supabase
        .from("events")
        .select(EVENT_SELECT)
        .eq("is_published", true)
        .eq("is_live", true)
        .order("display_order", { ascending: true });

      if (!data?.length) {
        return resolvePublicList("live-events", null, error, mapFallbackLiveEvents(), handleError);
      }

      return mapEventsWithLinkedMemoirs(data);
    },
  });

export const usePublishedEventStories = () =>
  useQuery({
    queryKey: ["public-event-stories"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<EventStory[]> => {
      if (!isSupabaseReady) {
        return resolvePublicList("event_stories", null, null, mapFallbackEventStories(), handleError);
      }

      const { data, error } = await supabase
        .from("event_stories")
        .select(
          "id, slug, title, subtitle, duration_label, hero_media, memoir_slug, is_new, display_order, is_published",
        )
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!data?.length) {
        return resolvePublicList("event_stories", null, error, mapFallbackEventStories(), handleError);
      }

      const memoirSlugs = data
        .map((story) => story.memoir_slug)
        .filter((slug): slug is string => Boolean(slug));
      const memoirMap = await fetchMemoirSnippetsBySlugs(memoirSlugs);

      return data.map((story) => {
        const mapped: EventStory = {
          id: story.id,
          slug: story.slug,
          title: story.title,
          subtitle: story.subtitle,
          durationLabel: story.duration_label,
          memoirSlug: story.memoir_slug,
          heroMedia: parseHeroMediaJson(story.hero_media, "event-story", story.id),
          isNew: story.is_new ?? false,
          displayOrder: story.display_order ?? 0,
        };

        if (!story.memoir_slug) return mapped;

        return enrichEventStoryWithMemoir(mapped, memoirMap.get(story.memoir_slug));
      });
    },
  });

export const usePublishedEvents = () =>
  useQuery({
    queryKey: ["public-events"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<PublicEvent[]> => {
      if (!isSupabaseReady)
      {
        return [];
      }

      const { data, error } = await supabase
        .from("events")
        .select(EVENT_SELECT)
        .eq("is_published", true)
        .order("occurs_on", { ascending: true, nullsFirst: false });

      if (error || !data)
      {
        handleError("events", error);
        return [];
      }

      return mapEventsWithLinkedMemoirs(data);
    },
  });

export const useContactChannels = () =>
  useQuery({
    queryKey: ["public-contact-channels"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<ContactChannel[]> => {
      if (!isSupabaseReady) {
        return resolvePublicList("contact_channels", null, null, mapFallbackContactChannels(), handleError);
      }

      const { data, error } = await supabase
        .from("contact_channels")
        .select("id, channel_type, label, value, display_order, is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!data?.length) {
        return resolvePublicList("contact_channels", null, error, mapFallbackContactChannels(), handleError);
      }

      return data.map((item) => ({
        id: item.id,
        channelType: item.channel_type,
        label: item.label,
        value: item.value,
        displayOrder: item.display_order ?? 0,
      }));
    },
  });

const mapFallbackPublishedTributes = (): MemoirTribute[] =>
  FALLBACK_MEMOIR_TRIBUTES.map((item) => ({
    id: item.id,
    name: item.name,
    relationship: item.relationship,
    message: item.message,
    displayOrder: item.display_order,
  }));

/** All tributes on published memoirs — for landing Stories carousel. */
export const usePublishedMemoirTributes = (limit = 32) =>
  useQuery({
    queryKey: ["public-memoir-tributes-published", limit],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<MemoirTribute[]> => {
      if (!isSupabaseReady) {
        return resolvePublicList("memoir_tributes", null, null, mapFallbackPublishedTributes(), handleError);
      }

      const { data, error } = await supabase
        .from("memoir_tributes")
        .select("id, name, relationship, message, display_order, memoirs!inner(status)")
        .eq("memoirs.status", "published")
        .order("display_order", { ascending: true })
        .limit(limit);

      if (!data?.length) {
        return resolvePublicList("memoir_tributes", null, error, mapFallbackPublishedTributes(), handleError);
      }

      return data.map((row) => ({
        id: row.id,
        name: row.name,
        relationship: row.relationship,
        message: row.message,
        displayOrder: row.display_order ?? 0,
      }));
    },
  });

export const useMemoirTributes = (memoirSlug: string) =>
  useQuery({
    queryKey: ["public-memoir-tributes", memoirSlug],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<MemoirTribute[]> => {
      if (!isSupabaseReady)
      {
        return [];
      }

      const { data: memoir, error: memoirError } = await supabase
        .from("memoirs")
        .select("id")
        .eq("slug", memoirSlug)
        .eq("status", "published")
        .maybeSingle();

      if (memoirError || !memoir)
      {
        handleError("memoirs", memoirError);
        return [];
      }

      const { data, error } = await supabase
        .from("memoir_tributes")
        .select("id, name, relationship, message, display_order, audio_url")
        .eq("memoir_id", memoir.id)
        .order("display_order", { ascending: true });

      if (error || !data)
      {
        handleError("memoir_tributes", error);
        return [];
      }

      return data.map((row) => {
        let publicAudioUrl = undefined;
        if (row.audio_url) {
          const { data: publicData } = supabase.storage
            .from("tribute-uploads")
            .getPublicUrl(row.audio_url);
          publicAudioUrl = publicData.publicUrl;
        }
        
        return {
          id: row.id,
          name: row.name,
          relationship: row.relationship,
          message: row.message,
          displayOrder: row.display_order ?? 0,
          audio_url: publicAudioUrl,
        };
      });
    },
  });

const fetchGalleryPage = async (offset: number, limit: number): Promise<GalleryPage> => {
  if (!isSupabaseReady)
  {
    return { items: [], nextOffset: null };
  }

  // First try to fetch from database table
  const { data: dbData, error: dbError } = await supabase
    .from("gallery_assets")
    .select(
      `
      id,
      storage_path,
      alt,
      caption,
      updated_at,
      memoir_id,
      memoirs!gallery_assets_memoir_id_fkey(id, slug, title)
    `
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!dbError && dbData && dbData.length > 0)
  {
    // Use database records
    const items: GalleryImageAsset[] = dbData.map((row) => {
      const { data: publicUrlData } = supabase.storage.from("public-assets").getPublicUrl(row.storage_path);
      const memoirs = row.memoirs as { id: string; slug: string; title: string } | { id: string; slug: string; title: string }[] | null;
      const memoir = Array.isArray(memoirs) ? memoirs[0] : memoirs;

      return {
        id: row.id,
        path: row.storage_path,
        src: publicUrlData.publicUrl,
        alt: row.alt,
        caption: row.caption ?? null,
        updatedAt: row.updated_at ?? null,
        memoirId: row.memoir_id ?? null,
        memoirSlug: memoir?.slug ?? null,
        memoirTitle: memoir?.title ?? null,
      };
    });

    const hasMore = dbData.length === limit;
    return {
      items,
      nextOffset: hasMore ? offset + limit : null,
    };
  }

  // Fallback to storage listing if database table doesn't exist or is empty
  const { data, error } = await supabase.storage.from("public-assets").list(GALLERY_PATH, {
    limit,
    offset,
    sortBy: { column: "updated_at", order: "desc" },
  });

  if (error || !data)
  {
    handleError("storage.public-assets", error);
    return { items: [], nextOffset: null };
  }

  const files = data.filter((item) => item && !item.name.endsWith("/"));

  const items: GalleryImageAsset[] = files.map((file) => {
    const relativePath = `${GALLERY_PATH}/${file.name}`;
    const { data: publicUrlData } = supabase.storage.from("public-assets").getPublicUrl(relativePath);
    const metadata = (file.metadata ?? {}) as Record<string, unknown>;
    const alt =
      typeof metadata.alt === "string"
        ? metadata.alt
        : file.name;
    const caption =
      typeof metadata.caption === "string"
        ? metadata.caption
        : null;
    return {
      id: file.id ?? relativePath,
      path: relativePath,
      src: publicUrlData.publicUrl,
      alt,
      caption,
      updatedAt: file.updated_at ?? null,
      memoirId: null,
      memoirSlug: null,
      memoirTitle: null,
    };
  });

  const hasMore = files.length === limit;
  return {
    items,
    nextOffset: hasMore ? offset + limit : null,
  };
};

export const useGalleryAssets = (pageSize = GALLERY_PAGE_SIZE) => {
  const query = useInfiniteQuery<GalleryPage, Error>({
    queryKey: ["public-gallery-assets", pageSize],
    staleTime: STALE_TIME,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    queryFn: ({ pageParam = 0 }) => fetchGalleryPage(pageParam as number, pageSize),
  });

  const flattened = useMemo(() => {
    const pages = (query.data as InfiniteData<GalleryPage> | undefined)?.pages ?? [];
    return pages.flatMap((page) => page.items);
  }, [query.data]);

  const hasMore = useMemo(() => {
    const pages = (query.data as InfiniteData<GalleryPage> | undefined)?.pages ?? [];
    return pages.some((page) => page.nextOffset !== null);
  }, [query.data]);

  return {
    ...query,
    images: flattened,
    hasMore,
  };
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featuredImage?: {
    src: string;
    alt?: string | null;
  } | null;
  publishedAt: string | null;
  updatedAt: string;
};

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: {
    src: string;
    alt?: string | null;
  } | null;
  published_at: string | null;
  updated_at: string;
};

const mapBlogPost = (row: BlogPostRow): BlogPost => {
  // Convert featured_image src from storage path to public URL if needed
  let featuredImageSrc: string | undefined = undefined;
  if (row.featured_image?.src)
  {
    const src = row.featured_image.src;
    // If it's already a full URL (http/https), use it as-is
    if (src.startsWith("http://") || src.startsWith("https://"))
    {
      featuredImageSrc = src;
    } else
    {
      // Otherwise, it's a storage path - convert to public URL
      const { data } = supabase.storage.from("public-assets").getPublicUrl(src);
      featuredImageSrc = data.publicUrl;
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    featuredImage: featuredImageSrc
      ? {
        src: featuredImageSrc,
        alt: row.featured_image?.alt ?? row.title,
      }
      : null,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
};

const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  if (!isSupabaseReady)
  {
    return [];
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, featured_image, published_at, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error || !data)
  {
    handleError("blog_posts.list", error);
    return [];
  }

  return data.map(mapBlogPost);
};

const fetchBlogPost = async (slug: string): Promise<BlogPost | undefined> => {
  if (!slug) return undefined;

  if (!isSupabaseReady)
  {
    return undefined;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, featured_image, published_at, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<BlogPostRow>();

  if (error || !data)
  {
    handleError("blog_posts.detail", error);
    return undefined;
  }

  return mapBlogPost(data);
};

export const useBlogPosts = () =>
  useQuery({
    queryKey: ["public-blog-posts"],
    staleTime: STALE_TIME,
    queryFn: fetchBlogPosts,
  });

export const useBlogPost = (slug?: string) =>
  useQuery({
    queryKey: ["public-blog-post", slug],
    queryFn: () => fetchBlogPost(slug as string),
    staleTime: STALE_TIME,
    enabled: Boolean(slug),
  });

export type Ad = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
};

export const useAds = (placement: string) =>
  useQuery({
    queryKey: ["public-ads", placement],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<Ad[]> => {
      if (!isSupabaseReady)
      {
        return [];
      }

      const { data, error } = await supabase
        .from("ads")
        .select("id, title, image_url, link_url, placement")
        .eq("placement", placement)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error || !data)
      {
        handleError("ads", error);
        return [];
      }

      return data.map((ad) => ({
        id: ad.id,
        title: ad.title,
        imageUrl: ad.image_url,
        linkUrl: ad.link_url,
        placement: ad.placement,
      }));
    },
  });
