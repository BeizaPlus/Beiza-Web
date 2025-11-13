import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import { FALLBACK_NAVIGATION_LINKS, FALLBACK_FOOTER_LINKS } from "@/lib/fallbackContent";

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

export type FeaturedEvent = {
  id: string;
  slug: string;
  memoirSlug?: string | null;
  title: string;
  description?: string | null;
  location?: string | null;
  occursOn?: string | null;
  heroMedia?: {
    src: string;
    alt?: string | null;
  } | null;
};

export type PublicEvent = FeaturedEvent & {
  isFeatured: boolean;
  isPublished: boolean;
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

const isSupabaseReady = Boolean(supabase);

const handleError = (scope: string, error: Error | null | undefined) => {
  if (!error) return;
  console.warn(`[supabase:${scope}] falling back to static content:`, error.message);
};

export const useNavigationLinks = (location = "primary") =>
  useQuery({
    queryKey: ["public-navigation-links", location],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<NavigationLink[]> => {
      // Use fallback content instead of Supabase
      return FALLBACK_NAVIGATION_LINKS.filter((link) => link.location === location);
    },
  });

export const useFooterLinks = () =>
  useQuery({
    queryKey: ["public-footer-links"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<FooterLink[]> => {
      // Use fallback content instead of Supabase
      return FALLBACK_FOOTER_LINKS;
    },
  });

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["public-site-settings"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<SiteSettings | null> => {
      if (!isSupabaseReady) {
        return null;
      }

      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .order("key", { ascending: true });

      if (error || !data) {
        handleError("site_settings", error);
        return null;
      }

      const settingsMap = data.reduce<Record<string, string>>((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      return {
        businessName: settingsMap.business_name ?? "",
        phonePrimary: settingsMap.phone_primary ?? "",
        emailPrimary: settingsMap.email_primary ?? "",
        calendlyUrl: settingsMap.calendly_url ?? "",
        heroHeading: settingsMap.hero_heading ?? "",
        heroSubheading: settingsMap.hero_subheading ?? "",
        heroCtaLabel: settingsMap.hero_cta_label ?? "",
        heroCtaHref: settingsMap.hero_cta_href ?? "",
        heroBackgroundImage: settingsMap.hero_background_image ?? "",
        heroBackgroundAlt: settingsMap.hero_background_alt ?? "",
        heroReviews: settingsMap.hero_reviews ?? "",
        social: {
          instagram: settingsMap.instagram_url ?? "",
          facebook: settingsMap.facebook_url ?? "",
          tiktok: settingsMap.tiktok_url ?? "",
          youtube: settingsMap.youtube_url ?? "",
        },
      };
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

      return {
        slug: data.slug,
        heading: data.heading,
        subheading: data.subheading,
        ctaLabel: data.cta_label,
        ctaHref: data.cta_href,
        backgroundMedia: data.background_media ?? null,
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
        return [];
      }

      const { data, error } = await supabase
        .from("offerings")
        .select("id, title, description, icon_key, display_order, is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error || !data) {
        handleError("offerings", error);
        return [];
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
        if (filterSurfaces.length === 0) {
          return normalized;
        }
        return normalized.filter((item) => item.surfaces.some((surface) => filterSurfaces.includes(surface)));
      };

      if (!isSupabaseReady) {
        return [];
      }

      let query = supabase
        .from("testimonials")
        .select("id, quote, author, role, surfaces, is_published")
        .eq("is_published", true)
        .order("updated_at", { ascending: false });

      if (filterSurfaces.length > 0) {
        query = query.contains("surfaces", filterSurfaces);
      }

      const { data, error } = await query;

      if (error || !data) {
        handleError("testimonials", error);
        return [];
      }

      return applySurfaceFilter(
        data.map((item) => ({
          id: item.id,
          quote: item.quote,
          author: item.author,
          role: item.role,
          surfaces: item.surfaces ?? [],
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
        return [];
      }

      const { data, error } = await supabase
        .from("faqs")
        .select("id, question, answer, display_order, is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error || !data) {
        handleError("faqs", error);
        return [];
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
        return [];
      }

      const { data: tiers, error: tiersError } = await supabase
        .from("pricing_tiers")
        .select("id, name, tagline, price_label, description, badge_label, is_recommended, display_order, is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (tiersError || !tiers) {
        handleError("pricing_tiers", tiersError);
        return [];
      }

      const tierIds = tiers.map((tier) => tier.id);

      const { data: features, error: featuresError } = await supabase
        .from("pricing_features")
        .select("tier_id, label, display_order")
        .in("tier_id", tierIds)
        .order("display_order", { ascending: true });

      if (featuresError || !features) {
        handleError("pricing_features", featuresError);
      }

      const featuresByTier = new Map<string, string[]>();
      features?.forEach((feature) => {
        if (!featuresByTier.has(feature.tier_id)) {
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

export const useFeaturedEvent = () =>
  useQuery({
    queryKey: ["public-featured-event"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<FeaturedEvent | null> => {
      if (!isSupabaseReady) {
        return null;
      }

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, slug, memoir_slug, memoir_id, title, description, location, occurs_on, hero_media, is_featured, is_published"
        )
        .eq("is_featured", true)
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        handleError("events", error);
        return null;
      }

      const event = data[0];
      
      // Parse hero_media - it's stored as JSONB in Supabase
      let heroMedia: { src: string; alt?: string | null } | null = null;
      if (event.hero_media) {
        try {
          // Handle different possible structures
          let media: Record<string, unknown> | null = null;
          
          if (typeof event.hero_media === "string") {
            // If it's a string, try to parse it
            media = JSON.parse(event.hero_media) as Record<string, unknown>;
          } else if (typeof event.hero_media === "object" && event.hero_media !== null) {
            media = event.hero_media as Record<string, unknown>;
          }
          
            if (media) {
              // Check for src in various possible locations
              const srcValue = media.src || media.url || media.image || media.path || media.image_url;
              if (typeof srcValue === "string" && srcValue.trim()) {
                const src = srcValue.trim();
                
                // Convert storage path to public URL if needed
                let finalSrc = src;
                if (!src.startsWith("http://") && !src.startsWith("https://")) {
                  // It's a storage path - convert to public URL
                  const { data: publicUrlData } = supabase.storage.from("public-assets").getPublicUrl(src);
                  finalSrc = publicUrlData.publicUrl;
                }
                
                heroMedia = {
                  src: finalSrc,
                  alt: typeof media.alt === "string" ? media.alt : (typeof media.title === "string" ? media.title : null),
                };
              }
            }
        } catch (error) {
          console.warn("[usePublicContent] Failed to parse hero_media:", error);
        }
      }

      return {
        id: event.id,
        slug: event.slug,
        memoirSlug: event.memoir_slug ?? event.slug,
        title: event.title,
        description: event.description,
        location: event.location,
        occursOn: event.occurs_on,
        heroMedia,
      };
    },
  });

export const usePublishedEvents = () =>
  useQuery({
    queryKey: ["public-events"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<PublicEvent[]> => {
      if (!isSupabaseReady) {
        return [];
      }

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, slug, memoir_slug, memoir_id, title, description, location, occurs_on, hero_media, is_featured, is_published"
        )
        .eq("is_published", true)
        .order("occurs_on", { ascending: true, nullsFirst: false });

      if (error || !data) {
        handleError("events", error);
        return [];
      }

      return data.map((event) => {
        // Parse hero_media - it's stored as JSONB in Supabase
        let heroMedia: { src: string; alt?: string | null } | null = null;
        if (event.hero_media) {
          try {
            // Handle different possible structures
            let media: Record<string, unknown> | null = null;
            
            if (typeof event.hero_media === "string") {
              // If it's a string, try to parse it
              media = JSON.parse(event.hero_media) as Record<string, unknown>;
            } else if (typeof event.hero_media === "object" && event.hero_media !== null) {
              media = event.hero_media as Record<string, unknown>;
            }
            
            if (media) {
              // Check for src in various possible locations
              const srcValue = media.src || media.url || media.image || media.path || media.image_url;
              if (typeof srcValue === "string" && srcValue.trim()) {
                const src = srcValue.trim();
                
                // Convert storage path to public URL if needed
                let finalSrc = src;
                if (!src.startsWith("http://") && !src.startsWith("https://")) {
                  // It's a storage path - convert to public URL
                  const { data: publicUrlData } = supabase.storage.from("public-assets").getPublicUrl(src);
                  finalSrc = publicUrlData.publicUrl;
                }
                
                heroMedia = {
                  src: finalSrc,
                  alt: typeof media.alt === "string" ? media.alt : (typeof media.title === "string" ? media.title : null),
                };
              }
            }
          } catch (error) {
            console.warn("[usePublicContent] Failed to parse hero_media for event:", event.id, error);
          }
        }

        return {
          id: event.id,
          slug: event.slug,
          memoirSlug: event.memoir_slug ?? event.slug,
          title: event.title,
          description: event.description,
          location: event.location,
          occursOn: event.occurs_on,
          heroMedia,
          isFeatured: event.is_featured ?? false,
          isPublished: event.is_published ?? false,
        };
      });
    },
  });

export const useContactChannels = () =>
  useQuery({
    queryKey: ["public-contact-channels"],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<ContactChannel[]> => {
      if (!isSupabaseReady) {
        return [];
      }

      const { data, error } = await supabase
        .from("contact_channels")
        .select("id, channel_type, label, value, display_order, is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (error || !data) {
        handleError("contact_channels", error);
        return [];
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

export const useMemoirTributes = (memoirSlug: string) =>
  useQuery({
    queryKey: ["public-memoir-tributes", memoirSlug],
    staleTime: STALE_TIME,
    queryFn: async (): Promise<MemoirTribute[]> => {
      if (!isSupabaseReady) {
        return [];
      }

      const { data: memoir, error: memoirError } = await supabase
        .from("memoirs")
        .select("id")
        .eq("slug", memoirSlug)
        .eq("status", "published")
        .maybeSingle();

      if (memoirError || !memoir) {
        handleError("memoirs", memoirError);
        return [];
      }

      const { data, error } = await supabase
        .from("memoir_tributes")
        .select("id, name, relationship, message, display_order")
        .eq("memoir_id", memoir.id)
        .order("display_order", { ascending: true });

      if (error || !data) {
        handleError("memoir_tributes", error);
        return [];
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

const fetchGalleryPage = async (offset: number, limit: number): Promise<GalleryPage> => {
  if (!isSupabaseReady) {
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

  if (!dbError && dbData && dbData.length > 0) {
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

  if (error || !data) {
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
  if (row.featured_image?.src) {
    const src = row.featured_image.src;
    // If it's already a full URL (http/https), use it as-is
    if (src.startsWith("http://") || src.startsWith("https://")) {
      featuredImageSrc = src;
    } else {
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
  if (!isSupabaseReady) {
    return [];
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, featured_image, published_at, updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error || !data) {
    handleError("blog_posts.list", error);
    return [];
  }

  return data.map(mapBlogPost);
};

const fetchBlogPost = async (slug: string): Promise<BlogPost | undefined> => {
  if (!slug) return undefined;

  if (!isSupabaseReady) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, content, featured_image, published_at, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<BlogPostRow>();

  if (error || !data) {
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

