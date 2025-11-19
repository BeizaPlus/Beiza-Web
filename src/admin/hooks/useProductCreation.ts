/**
 * Hooks for creating Shopify products from memoirs or standalone
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { shopifyClient, type CreateProductInput } from "@/lib/shopify/client";
import { createProductMapping, mapProductType, type ProductCategory } from "@/lib/shopify/service";
import { useCreateShopifyProduct } from "./useShopifyProducts";

const ensureClient = () => {
  const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client is not configured.");
  }
  return client;
};

/**
 * Fetches memoir data for product creation
 */
export function useMemoirDataForProduct(memoirId: string | null) {
  return useQuery({
    queryKey: ["memoir-for-product", memoirId],
    queryFn: async () => {
      if (!memoirId) return null;

      const supabase = ensureClient();
      
      // Get memoir
      const { data: memoir, error: memoirError } = await supabase
        .from("memoirs")
        .select("*")
        .eq("id", memoirId)
        .single();

      if (memoirError || !memoir) {
        throw new Error("Memoir not found");
      }

      // Get highlights (for images)
      const { data: highlights } = await supabase
        .from("memoir_highlights")
        .select("media")
        .eq("memoir_id", memoirId)
        .order("display_order", { ascending: true })
        .limit(5);

      // Get tributes count
      const { data: tributes } = await supabase
        .from("memoir_tributes")
        .select("id")
        .eq("memoir_id", memoirId);

      return {
        memoir,
        highlights: highlights || [],
        tributesCount: tributes?.length || 0,
      };
    },
    enabled: !!memoirId,
  });
}

/**
 * Creates a product from memoir data
 */
export function useCreateProductFromMemoir() {
  const createProduct = useCreateShopifyProduct();

  return {
    ...createProduct,
    mutateAsync: async (input: {
      memoirId: string;
      productCategory: ProductCategory;
      title: string;
      description?: string;
      price: string;
      images?: Array<{ src: string; alt?: string }>;
    }) => {
      const productType = mapProductType(input.productCategory);

      // Determine if this is derived from memoir (photo books, memorabilia)
      const sourceMemoirId =
        input.productCategory === "photo_book" || input.productCategory === "memorabilia"
          ? input.memoirId
          : null;

      const productInput: CreateProductInput = {
        title: input.title,
        body_html: input.description || "",
        product_type: input.productCategory === "coffin" ? "Coffin" : "Memorial Product",
        tags: ["memoir", input.productCategory],
        variants: [
          {
            price: input.price,
            requires_shipping: productType === "physical",
          },
        ],
        images: input.images,
      };

      return createProduct.mutateAsync({
        product: productInput,
        mapping: {
          local_type: input.memoirId ? "memoir" : "physical_product",
          local_id: input.memoirId || null,
          product_type: productType,
          product_category: input.productCategory,
          source_memoir_id: sourceMemoirId,
          metadata: {
            created_from: "memoir",
            memoir_id: input.memoirId,
          },
        },
      });
    },
  };
}

/**
 * Creates a standalone product (e.g., coffin)
 */
export function useCreateStandaloneProduct() {
  const createProduct = useCreateShopifyProduct();

  return {
    ...createProduct,
    mutateAsync: async (input: {
      productCategory: ProductCategory;
      title: string;
      description?: string;
      price: string;
      sku?: string;
      images?: Array<{ src: string; alt?: string }>;
      specifications?: Record<string, unknown>;
    }) => {
      const productType = mapProductType(input.productCategory);

      const productInput: CreateProductInput = {
        title: input.title,
        body_html: input.description || "",
        product_type: input.productCategory === "coffin" ? "Coffin" : "Product",
        tags: [input.productCategory],
        variants: [
          {
            price: input.price,
            sku: input.sku,
            requires_shipping: productType === "physical",
          },
        ],
        images: input.images,
      };

      return createProduct.mutateAsync({
        product: productInput,
        mapping: {
          local_type: "physical_product",
          local_id: null,
          product_type: productType,
          product_category: input.productCategory,
          source_memoir_id: null,
          metadata: {
            specifications: input.specifications,
          },
        },
      });
    },
  };
}

