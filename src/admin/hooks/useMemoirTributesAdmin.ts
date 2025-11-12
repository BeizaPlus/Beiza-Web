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

export type MemoirTributeAdminEntry = {
  id: string;
  memoir_id: string;
  name: string;
  relationship: string | null;
  message: string;
  display_order: number | null;
  updated_at: string | null;
};

type MemoirTributeRow = {
  id: string;
  memoir_id: string;
  name: string;
  relationship: string | null;
  message: string;
  display_order: number | null;
  updated_at: string | null;
};

const mapRow = (row: MemoirTributeRow): MemoirTributeAdminEntry => ({
  id: row.id,
  memoir_id: row.memoir_id,
  name: row.name,
  relationship: row.relationship,
  message: row.message,
  display_order: row.display_order,
  updated_at: row.updated_at,
});

const sortEntries = (entries: MemoirTributeAdminEntry[]) =>
  [...entries].sort((a, b) => {
    const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (a.updated_at ? new Date(a.updated_at).getTime() : 0) - (b.updated_at ? new Date(b.updated_at).getTime() : 0);
  });

const fetchMemoirTributes = async (memoirId: string): Promise<MemoirTributeAdminEntry[]> => {
  const client = ensureClient();
  const { data, error } = await client
    .from("memoir_tributes")
    .select("id, memoir_id, name, relationship, message, display_order, updated_at")
    .eq("memoir_id", memoirId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(extractSupabaseErrorMessage(error, "Failed to load memoir tributes."));
  }

  const rows = (data ?? []).map(mapRow);
  return sortEntries(rows);
};

const queryKey = (memoirId: string) => ["admin-memoir-tributes", memoirId] as const;

export const useMemoirTributesAdmin = (memoirId?: string) => {
  const enabled = Boolean(memoirId);

  return useQuery({
    queryKey: memoirId ? queryKey(memoirId) : ["admin-memoir-tributes"],
    queryFn: () => fetchMemoirTributes(memoirId as string),
    enabled,
    staleTime: 1000 * 60,
  });
};

export const memoirTributesAdminQueryKey = queryKey;


