/**
 * Public-facing React Query hooks for Shopify Products
 * Uses the /api/shopify/products endpoint for server-side API calls
 */

import { useQuery } from "@tanstack/react-query";
import type { ShopifyProduct } from "@/lib/shopify/client";

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
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.status) queryParams.append("status", params.status);
      else queryParams.append("status", "active");
      if (params?.tags) queryParams.append("tags", params.tags);
      if (params?.product_type) queryParams.append("product_type", params.product_type);

      // Call the API endpoint
      const response = await fetch(`/api/shopify/products?${queryParams.toString()}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      return data.products || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetches a single product by ID
 * Note: This requires a separate endpoint or we can fetch all and filter
 */
export function useShopifyProduct(productId: number) {
  return useQuery({
    queryKey: ["shopify-product-public", productId],
    queryFn: async () => {
      // For now, fetch all products and find the one we need
      // In the future, we could add a /api/shopify/products/[id] endpoint
      const response = await fetch("/api/shopify/products?limit=250&status=active");
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to fetch product: ${response.statusText}`);
      }

      const data = await response.json();
      const products: ShopifyProduct[] = data.products || [];
      const product = products.find((p) => p.id === productId);
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      return product;
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

      // Fetch products with memoir tag
      const queryParams = new URLSearchParams();
      queryParams.append("status", "active");
      queryParams.append("tags", "memoir");

      const response = await fetch(`/api/shopify/products?${queryParams.toString()}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to fetch memoir products: ${response.statusText}`);
      }

      const data = await response.json();
      return data.products || [];
    },
    enabled: !!memoirId,
    staleTime: 1000 * 60 * 5,
  });
}

