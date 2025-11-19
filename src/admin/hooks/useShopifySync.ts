/**
 * React Query hooks for Shopify Sync operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { syncOfferingToShopify, reconcileProducts } from "@/lib/shopify/sync";
import { useSafeMutation } from "./useSafeMutation";

const ensureClient = () => {
  const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client is not configured.");
  }
  return client;
};

export const shopifySyncLogQueryKey = ["shopify-sync-log"];

/**
 * Fetches sync log entries
 */
export function useShopifySyncLog(limit = 50) {
  return useQuery({
    queryKey: [...shopifySyncLogQueryKey, limit],
    queryFn: async () => {
      const supabase = ensureClient();
      const { data, error } = await supabase
        .from("shopify_sync_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Syncs an offering to Shopify
 */
export function useSyncOffering() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: async (offeringId: string) => {
      await syncOfferingToShopify(offeringId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-products"] });
      queryClient.invalidateQueries({ queryKey: shopifySyncLogQueryKey });
    },
  });
}

/**
 * Reconciles all products
 */
export function useReconcileProducts() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: async () => {
      return await reconcileProducts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-products"] });
      queryClient.invalidateQueries({ queryKey: shopifySyncLogQueryKey });
    },
  });
}

