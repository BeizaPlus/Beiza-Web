import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

const ensureClient = () => {
  const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return client;
};

export type MemoirTimelineAdminEntry = {
  id: string;
  memoir_slug: string;
  era_label: string | null;
  title: string;
  excerpt: string;
  story_url: string | null;
  timestamp: string;
  end_timestamp: string | null;
  location: string | null;
  tags: string[] | null;
  participants: string[] | null;
  image: {
    src: string;
    alt: string;
    placeholder?: string | null;
  } | null;
  audio_clip_url: string | null;
  is_published: boolean;
  display_order: number | null;
};

type MemoirTimelineRow = MemoirTimelineAdminEntry;

const mapRow = (row: MemoirTimelineRow): MemoirTimelineAdminEntry => ({
  ...row,
  tags: row.tags ?? null,
  participants: row.participants ?? null,
  image: row.image
    ? {
        src: row.image.src,
        alt: row.image.alt,
        placeholder: row.image.placeholder ?? null,
      }
    : null,
  story_url: row.story_url ?? null,
  audio_clip_url: row.audio_clip_url ?? null,
  era_label: row.era_label ?? null,
  location: row.location ?? null,
  end_timestamp: row.end_timestamp ?? null,
  display_order: row.display_order ?? null,
});

const sortEntries = (entries: MemoirTimelineAdminEntry[]) =>
  [...entries].sort((a, b) => {
    const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

const fetchMemoirTimelineEntries = async (slug: string): Promise<MemoirTimelineAdminEntry[]> => {
  const client = ensureClient();
  const { data, error } = await client
    .from("memoir_timelines")
    .select("*")
    .eq("memoir_slug", slug)
    .order("display_order", { ascending: true })
    .order("timestamp", { ascending: true });

  if (error) {
    throw new Error(extractSupabaseErrorMessage(error, "Failed to load memoir timeline entries."));
  }

  const rows = (data ?? []).map(mapRow);
  return sortEntries(rows);
};

const queryKey = (slug: string) => ["admin-memoir-timeline", slug] as const;

export const useMemoirTimelineAdmin = (slug?: string) => {
  const enabled = Boolean(slug);

  return useQuery({
    queryKey: slug ? queryKey(slug) : ["admin-memoir-timeline"],
    queryFn: () => fetchMemoirTimelineEntries(slug as string),
    enabled,
    staleTime: 1000 * 60,
  });
};

export const memoirTimelineAdminQueryKey = queryKey;


