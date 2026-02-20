import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";

export const AUTH_ERROR_EVENT = "supabase-unauthorized";

export const handlePostgrestError = (error: unknown, context: string) => {
  // PostgREST typically throws PGRST301 or includes JWT in the message when the token is invalid or expired
  const typedError = error as { code?: string; message?: string; details?: string };
  const isAuthError =
    typedError?.code === "PGRST301" ||
    typedError?.message?.toLowerCase().includes("jwt") ||
    typedError?.details?.toLowerCase().includes("jwt");

  if (isAuthError)
  {
    console.warn(`[auth] Unauthorized API call detected in ${context}. Forcing session refresh.`);
    window.dispatchEvent(new Event(AUTH_ERROR_EVENT));
  }

  throw new Error(`Failed to load ${context}: ${typedError?.message ?? 'Unknown error'}`);
};

const ensureClient = () => {
  const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
  if (!client)
  {
    throw new Error("Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return client;
};

type MemoirRecord = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  updated_at: string;
  timeline_count: number;
};

type ContentAsset = {
  id: string;
  name: string;
  bucket: string;
  type: "image" | "video" | "audio" | "other";
  publicUrl: string;
  updated_at: string;
};

type TestimonialRecord = {
  id: string;
  author: string;
  role: string | null;
  quote: string;
  surfaces: string[];
  is_published: boolean;
  updated_at: string | null;
};

type OfferingRecord = {
  id: string;
  title: string;
  description: string | null;
  icon_key: string | null;
  updated_at: string;
  is_published: boolean;
};

type EventRecord = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  occurs_on: string | null;
  is_featured: boolean;
  is_published: boolean;
};

type SiteSettingRecord = {
  key: string;
  value: string;
};

type ManagerRecord = {
  id: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
  last_sign_in_at: string | null;
};

type GalleryAssetRecord = {
  id: string;
  storage_path: string;
  alt: string;
  caption: string | null;
  memoir_id: string | null;
  memoir_title: string | null;
  display_order: number;
  is_published: boolean;
  updated_at: string;
};

const deriveAssetType = (name: string, mimeType?: string | null): ContentAsset["type"] => {
  const source = mimeType ?? name.split(".").pop()?.toLowerCase();

  if (!source)
  {
    return "other";
  }

  if (source.includes("image") || ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "avif"].includes(source))
  {
    return "image";
  }

  if (source.includes("video") || ["mp4", "mov", "mkv", "webm"].includes(source))
  {
    return "video";
  }

  if (source.includes("audio") || ["mp3", "wav", "aac", "ogg", "flac"].includes(source))
  {
    return "audio";
  }

  return "other";
};

async function fetchMemoirs(): Promise<MemoirRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("memoirs")
    .select(
      `
        id,
        slug,
        title,
        status,
        updated_at,
        memoir_timelines(count)
      `
    )
    .order("updated_at", { ascending: false });

  if (error)
  {
    handlePostgrestError(error, "memoirs");
  }

  const records = data ?? [];

  return records.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    updated_at: row.updated_at,
    timeline_count: row.memoir_timelines?.[0]?.count ?? 0,
  }));
}

async function fetchAssets(): Promise<ContentAsset[]> {
  const client = ensureClient();
  const bucket = "public-assets";

  // List files from root and common subdirectories
  // Note: Supabase storage.list() doesn't support recursive listing, so we check common directories
  const directoriesToCheck = ["", "gallery"];
  const allFiles: Array<{ id: string; name: string; updated_at: string | null; metadata?: { mimetype?: string | null } }> = [];

  // First, get root files
  const { data: rootData, error: rootError } = await client.storage.from(bucket).list("", {
    limit: 1000,
    sortBy: { column: "updated_at", order: "desc" },
  });

  if (!rootError && rootData)
  {
    // Get subdirectories from root
    const subdirs = rootData
      .filter((item) => item && !item.id && item.name.endsWith("/"))
      .map((item) => item.name.replace("/", ""));

    // Add root files
    const rootFiles = rootData
      .filter((item) => item && item.id && !item.name.endsWith("/"))
      .map((item) => ({
        id: item.id,
        name: item.name,
        updated_at: item.updated_at,
        metadata: item.metadata,
      }));
    allFiles.push(...rootFiles);

    // Add discovered subdirectories to check
    directoriesToCheck.push(...subdirs.filter((dir) => !directoriesToCheck.includes(dir)));
  }

  // List files from each directory
  for (const dir of directoriesToCheck)
  {
    if (dir === "") continue; // Already processed root

    const { data, error } = await client.storage.from(bucket).list(dir, {
      limit: 1000,
      sortBy: { column: "updated_at", order: "desc" },
    });

    if (error)
    {
      // Directory might not exist, skip silently
      continue;
    }

    const files = (data ?? [])
      .filter((item) => item && item.id && !item.name.endsWith("/")) // Exclude folders
      .map((item) => ({
        id: item.id,
        name: `${dir}/${item.name}`,
        updated_at: item.updated_at,
        metadata: item.metadata,
      }));

    allFiles.push(...files);
  }

  // Sort by updated_at descending
  allFiles.sort((a, b) => {
    const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    return timeB - timeA;
  });

  // Limit to 500 most recent
  const limitedFiles = allFiles.slice(0, 500);

  return limitedFiles.map((file) => {
    const {
      data: { publicUrl },
    } = client.storage.from(bucket).getPublicUrl(file.name);

    return {
      id: file.id,
      name: file.name,
      bucket,
      type: deriveAssetType(file.name, file.metadata?.mimetype),
      publicUrl,
      updated_at: file.updated_at ?? "",
    };
  });
}

async function fetchTestimonials(): Promise<TestimonialRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("testimonials")
    .select("id, author, role, quote, surfaces, is_published, updated_at")
    .order("updated_at", { ascending: false });

  if (error)
  {
    handlePostgrestError(error, "testimonials");
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    author: item.author,
    role: item.role,
    quote: item.quote,
    surfaces: item.surfaces ?? [],
    is_published: item.is_published,
    updated_at: item.updated_at ?? null,
  }));
}

async function fetchOfferings(): Promise<OfferingRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("offerings")
    .select("id, title, description, icon_key, updated_at, is_published")
    .order("display_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error)
  {
    handlePostgrestError(error, "offerings");
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    icon_key: item.icon_key,
    updated_at: item.updated_at,
    is_published: item.is_published,
  }));
}

async function fetchEvents(): Promise<EventRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("events")
    .select("id, title, slug, location, occurs_on, is_featured, is_published")
    .order("occurs_on", { ascending: false });

  if (error)
  {
    handlePostgrestError(error, "events");
  }

  return data ?? [];
}

async function fetchSettings(): Promise<SiteSettingRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("site_settings")
    .select("key, value")
    .order("key", { ascending: true });

  if (error)
  {
    handlePostgrestError(error, "settings");
  }

  return data ?? [];
}

async function fetchManagers(): Promise<ManagerRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("manager_profiles")
    .select("id, email, role, status, last_sign_in_at")
    .order("created_at", { ascending: true });

  if (error)
  {
    handlePostgrestError(error, "managers");
  }

  return data ?? [];
}

export const useMemoirsList = () =>
  useQuery({
    queryKey: ["admin-memoirs"],
    queryFn: fetchMemoirs,
    staleTime: 1000 * 60,
    retry: 1,
  });

export const useContentAssets = () =>
  useQuery({
    queryKey: ["admin-assets"],
    queryFn: fetchAssets,
    staleTime: 1000 * 60,
    retry: 1,
  });

export const useTestimonialsAdmin = () =>
  useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: fetchTestimonials,
    staleTime: 1000 * 60,
    retry: 1,
  });

export const useOfferingsAdmin = () =>
  useQuery({
    queryKey: ["admin-offerings"],
    queryFn: fetchOfferings,
    staleTime: 1000 * 60,
    retry: 1,
  });

export const useEventsAdmin = () =>
  useQuery({
    queryKey: ["admin-events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60,
    retry: 1,
  });

export const useSiteSettingsAdmin = () =>
  useQuery({
    queryKey: ["admin-settings"],
    queryFn: fetchSettings,
    staleTime: 1000 * 60,
    retry: 1,
  });

type PricingTierRecord = {
  id: string;
  name: string;
  tagline: string | null;
  price_label: string | null;
  description: string | null;
  badge_label: string | null;
  is_recommended: boolean;
  is_published: boolean;
  display_order: number;
  updated_at: string;
  features: PricingFeatureRecord[];
};

type PricingFeatureRecord = {
  id: string;
  tier_id: string;
  label: string;
  display_order: number;
};

async function fetchPricingTiers(): Promise<PricingTierRecord[]> {
  const client = ensureClient();

  const { data: tiers, error: tiersError } = await client
    .from("pricing_tiers")
    .select("id, name, tagline, price_label, description, badge_label, is_recommended, is_published, display_order, updated_at")
    .order("display_order", { ascending: true });

  if (tiersError)
  {
    handlePostgrestError(tiersError, "pricing tiers");
  }

  if (!tiers || tiers.length === 0)
  {
    return [];
  }

  const tierIds = tiers.map((t) => t.id);

  const { data: features, error: featuresError } = await client
    .from("pricing_features")
    .select("id, tier_id, label, display_order")
    .in("tier_id", tierIds)
    .order("display_order", { ascending: true });

  if (featuresError)
  {
    handlePostgrestError(featuresError, "pricing features");
  }

  return (tiers ?? []).map((tier) => ({
    id: tier.id,
    name: tier.name,
    tagline: tier.tagline,
    price_label: tier.price_label,
    description: tier.description,
    badge_label: tier.badge_label,
    is_recommended: tier.is_recommended,
    is_published: tier.is_published,
    display_order: tier.display_order,
    updated_at: tier.updated_at,
    features: (features ?? []).filter((f) => f.tier_id === tier.id),
  }));
}

export const usePricingTiersAdmin = () =>
  useQuery({
    queryKey: ["admin-pricing-tiers"],
    queryFn: fetchPricingTiers,
    staleTime: 1000 * 60,
    retry: 1,
  });

export const useManagersAdmin = () =>
  useQuery({
    queryKey: ["admin-managers"],
    queryFn: fetchManagers,
    staleTime: 1000 * 60,
    retry: 1,
  });

async function fetchGalleryAssets(): Promise<GalleryAssetRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("gallery_assets")
    .select(
      `
      id,
      storage_path,
      alt,
      caption,
      memoir_id,
      display_order,
      is_published,
      updated_at,
      memoirs!gallery_assets_memoir_id_fkey(title)
    `
    )
    .order("created_at", { ascending: false });

  if (error)
  {
    handlePostgrestError(error, "gallery assets");
  }

  return (data ?? []).map((item) => {
    const memoirs = item.memoirs as { title: string } | { title: string }[] | null;
    const memoirTitle = Array.isArray(memoirs)
      ? (memoirs[0]?.title ?? null)
      : (memoirs?.title ?? null);

    return {
      id: item.id,
      storage_path: item.storage_path,
      alt: item.alt,
      caption: item.caption,
      memoir_id: item.memoir_id,
      memoir_title: memoirTitle,
      display_order: item.display_order ?? 0,
      is_published: item.is_published ?? true,
      updated_at: item.updated_at,
    };
  });
}

export const useGalleryAssetsAdmin = () =>
  useQuery({
    queryKey: ["admin-gallery-assets"],
    queryFn: fetchGalleryAssets,
    staleTime: 1000 * 60,
    retry: 1,
  });

type BlogPostRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  last_published_at: string | null;
  updated_at: string;
};

async function fetchBlogPosts(): Promise<BlogPostRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("blog_posts")
    .select("id, slug, title, excerpt, status, published_at, last_published_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error)
  {
    handlePostgrestError(error, "blog posts");
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    status: item.status,
    published_at: item.published_at,
    last_published_at: item.last_published_at,
    updated_at: item.updated_at,
  }));
}

export const useBlogPostsAdmin = () =>
  useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: fetchBlogPosts,
    staleTime: 1000 * 60,
    retry: 1,
  });

export type AdsRecord = {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  placement: string;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
};

async function fetchAds(): Promise<AdsRecord[]> {
  const client = ensureClient();

  const { data, error } = await client
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
  {
    handlePostgrestError(error, "ads");
  }

  return data ?? [];
}

export const useAdsAdmin = () =>
  useQuery({
    queryKey: ["admin-ads"],
    queryFn: fetchAds,
    staleTime: 1000 * 60,
    retry: 1,
  });
