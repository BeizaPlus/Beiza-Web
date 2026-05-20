import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { getLegacyTier, type LegacyTier } from "@/lib/legacy/tier";

async function fetchEntitlement(accessToken: string): Promise<LegacyTier> {
  const res = await fetch("/api/stripe/entitlement", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return getLegacyTier();
  const data = (await res.json()) as { tier?: string };
  if (data.tier === "keeper" || data.tier === "heritage") return data.tier;
  return "circle";
}

/** Resolves Keeper/Heritage from Stripe entitlement when signed in; falls back to VITE_LEGACY_TIER. */
export function useLegacyEntitlement() {
  const envTier = getLegacyTier();

  const sessionQuery = useQuery({
    queryKey: ["legacy-session"],
    queryFn: async () => {
      if (!supabase) return null;
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    enabled: Boolean(supabase),
    staleTime: 60_000,
  });

  const tierQuery = useQuery({
    queryKey: ["legacy-entitlement", sessionQuery.data?.access_token],
    queryFn: () => fetchEntitlement(sessionQuery.data!.access_token),
    enabled: Boolean(sessionQuery.data?.access_token),
    staleTime: 30_000,
  });

  const tier: LegacyTier =
    envTier !== "circle" ? envTier : tierQuery.data ?? "circle";

  return {
    tier,
    isLoading: sessionQuery.isLoading || tierQuery.isLoading,
    isSignedIn: Boolean(sessionQuery.data),
  };
}
