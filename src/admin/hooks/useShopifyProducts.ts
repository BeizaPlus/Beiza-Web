/**
 * React Query hooks for Shopify Products
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { shopifyClient, type CreateProductInput, type UpdateProductInput } from "@/lib/shopify/client";
import {
  createProductMapping,
  updateProductSyncStatus,
  type ProductMapping,
} from "@/lib/shopify/service";
import { useSafeMutation } from "./useSafeMutation";

const ensureClient = () => {
  const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client is not configured.");
  }
  return client;
};

export const shopifyProductsQueryKey = ["shopify-products"];

/**
 * Fetches all Shopify product mappings
 */
export function useShopifyProducts() {
  return useQuery({
    queryKey: shopifyProductsQueryKey,
    queryFn: async () => {
      const supabase = ensureClient();
      const { data, error } = await supabase
        .from("shopify_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ProductMapping[];
    },
  });
}

/**
 * Fetches a single Shopify product mapping
 */
export function useShopifyProduct(id: string) {
  return useQuery({
    queryKey: [...shopifyProductsQueryKey, id],
    queryFn: async () => {
      const supabase = ensureClient();
      const { data, error } = await supabase
        .from("shopify_products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ProductMapping;
    },
    enabled: !!id,
  });
}

/**
 * Fetches products from Shopify API
 */
export function useShopifyApiProducts(params?: {
  limit?: number;
  product_type?: string;
  status?: "active" | "archived" | "draft";
}) {
  return useQuery({
    queryKey: ["shopify-api-products", params],
    queryFn: async () => {
      return await shopifyClient.getProducts(params);
    },
  });
}

/**
 * Creates a new Shopify product
 */
export function useCreateShopifyProduct() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: async (input: {
      product: CreateProductInput;
      mapping: Omit<ProductMapping, "id" | "sync_status" | "last_synced_at" | "shopify_product_id" | "shopify_variant_id">;
    }) => {
      // Create product in Shopify
      const shopifyProduct = await shopifyClient.createProduct(input.product);

      // Create mapping in database
      const mappingId = await createProductMapping({
        ...input.mapping,
        shopify_product_id: shopifyProduct.id,
        shopify_variant_id: shopifyProduct.variants[0]?.id || null,
      });

      return { shopifyProduct, mappingId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyProductsQueryKey });
    },
  });
}

/**
 * Updates a Shopify product
 */
export function useUpdateShopifyProduct() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: async (input: UpdateProductInput) => {
      return await shopifyClient.updateProduct(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyProductsQueryKey });
    },
  });
}

/**
 * Deletes a Shopify product
 */
export function useDeleteShopifyProduct() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: async (productId: number) => {
      await shopifyClient.deleteProduct(productId);
      
      // Also delete mapping
      const supabase = ensureClient();
      await supabase
        .from("shopify_products")
        .delete()
        .eq("shopify_product_id", productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyProductsQueryKey });
    },
  });
}

