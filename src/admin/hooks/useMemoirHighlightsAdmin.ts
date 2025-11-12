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

export type MemoirHighlightAdminEntry = {
  id: string;
  memoir_id: string;
  caption: string | null;
  display_order: number | null;
  media: {
    src: string;
    alt: string;
    placeholder?: string | null;
  };
  updated_at: string | null;
};

type MemoirHighlightRow = {
  id: string;
  memoir_id: string;
  caption: string | null;
  display_order: number | null;
  media: {
    src?: string | null;
    alt?: string | null;
    placeholder?: string | null;
  } | null;
  updated_at: string | null;
};

const mapRow = (row: MemoirHighlightRow): MemoirHighlightAdminEntry => ({
  id: row.id,
  memoir_id: row.memoir_id,
  caption: row.caption,
  display_order: row.display_order,
  media: {
    src: row.media?.src ?? "",
    alt: row.media?.alt ?? "",
    placeholder: row.media?.placeholder ?? null,
  },
  updated_at: row.updated_at,
});

const sortEntries = (entries: MemoirHighlightAdminEntry[]) =>
  [...entries].sort((a, b) => {
    const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (a.updated_at ? new Date(a.updated_at).getTime() : 0) - (b.updated_at ? new Date(b.updated_at).getTime() : 0);
  });

const fetchMemoirHighlights = async (memoirId: string): Promise<MemoirHighlightAdminEntry[]> => {
  const client = ensureClient();
  const { data, error } = await client
    .from("memoir_highlights")
    .select("id, memoir_id, caption, display_order, media, updated_at")
    .eq("memoir_id", memoirId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(extractSupabaseErrorMessage(error, "Failed to load memoir highlights."));
  }

  const rows = (data ?? []).map(mapRow);
  return sortEntries(rows);
};

const queryKey = (memoirId: string) => ["admin-memoir-highlights", memoirId] as const;

export const useMemoirHighlightsAdmin = (memoirId?: string) => {
  const enabled = Boolean(memoirId);

  return useQuery({
    queryKey: memoirId ? queryKey(memoirId) : ["admin-memoir-highlights"],
    queryFn: () => fetchMemoirHighlights(memoirId as string),
    enabled,
    staleTime: 1000 * 60,
  });
};

export const memoirHighlightsAdminQueryKey = queryKey;


