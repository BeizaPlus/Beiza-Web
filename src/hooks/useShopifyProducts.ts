/**
 * Public-facing React Query hooks for Shopify Products
 */

import { useQuery } from "@tanstack/react-query";
import { shopifyClient, type ShopifyProduct } from "@/lib/shopify/client";

/**
 * Fetches products from Shopify API for public display
 */
export function useShopifyProducts(params?: {
  limit?: number;
  product_type?: string;
  tags?: string;
  status?: "active" | "archived" | "draft";
}) {
  return useQuery({
    queryKey: ["shopify-products-public", params],
    queryFn: async () => {
      return await shopifyClient.getProducts({
        ...params,
        status: params?.status || "active",
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetches a single product by ID
 */
export function useShopifyProduct(productId: number) {
  return useQuery({
    queryKey: ["shopify-product-public", productId],
    queryFn: async () => {
      return await shopifyClient.getProduct(productId);
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetches products by memoir (if linked)
 */
export function useMemoirProducts(memoirId: string | null) {
  return useQuery({
    queryKey: ["memoir-products", memoirId],
    queryFn: async () => {
      if (!memoirId) return [];

      // This would ideally query the shopify_products table to find products linked to this memoir
      // For now, we'll fetch all products and filter by tags
      const allProducts = await shopifyClient.getProducts({
        status: "active",
        tags: "memoir",
      });

      // Filter products that might be related to this memoir
      // In a real implementation, you'd query the database mapping
      return allProducts;
    },
    enabled: !!memoirId,
    staleTime: 1000 * 60 * 5,
  });
}

