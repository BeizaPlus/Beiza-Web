/**
 * Shopify Service Layer
 * High-level business logic for product operations and sync
 */

import { shopifyClient, type ShopifyProduct, type CreateProductInput } from "./client";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { ShopifyConfig } from "./config";

export type ProductType = "physical" | "digital";
export type ProductCategory =
  | "coffin"
  | "photo_book"
  | "memorabilia"
  | "tribute"
  | "archive"
  | "memory_page";

export interface ProductMapping {
  id: string;
  local_type: "offering" | "memoir" | "physical_product";
  local_id: string | null;
  shopify_product_id: number;
  shopify_variant_id: number | null;
  product_type: ProductType;
  product_category: ProductCategory | null;
  source_memoir_id: string | null;
  sync_status: "pending" | "syncing" | "synced" | "error";
  last_synced_at: string | null;
  metadata: Record<string, unknown>;
}

export interface SyncResult {
  success: boolean;
  productId?: number;
  error?: string;
}

/**
 * Determines if a product is physical or digital based on category
 */
export function mapProductType(category: ProductCategory | null): ProductType {
  if (!category) return "physical";
  return ["tribute", "archive", "memory_page"].includes(category) ? "digital" : "physical";
}

/**
 * Syncs a product to Shopify (creates or updates)
 */
export async function syncProductToShopify(
  input: CreateProductInput,
  existingShopifyId?: number
): Promise<SyncResult> {
  try {
    let shopifyProduct: ShopifyProduct;

    if (existingShopifyId) {
      // Update existing product
      shopifyProduct = await shopifyClient.updateProduct({
        id: existingShopifyId,
        title: input.title,
        body_html: input.body_html,
        product_type: input.product_type,
        tags: input.tags,
      });
    } else {
      // Create new product
      shopifyProduct = await shopifyClient.createProduct(input);
    }

    return {
      success: true,
      productId: shopifyProduct.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Syncs product data from Shopify to local database
 */
export async function syncProductFromShopify(
  shopifyProduct: ShopifyProduct
): Promise<void> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  // Find existing mapping
  const { data: existing } = await supabase
    .from("shopify_products")
    .select("*")
    .eq("shopify_product_id", shopifyProduct.id)
    .single();

  if (existing) {
    // Update existing mapping
    await supabase
      .from("shopify_products")
      .update({
        sync_status: "synced",
        last_synced_at: new Date().toISOString(),
        metadata: {
          ...existing.metadata,
          title: shopifyProduct.title,
          status: shopifyProduct.status,
          updated_at: shopifyProduct.updated_at,
        },
      })
      .eq("id", existing.id);
  }
  // If no mapping exists, we don't create one automatically
  // Products should be created through the admin interface
}

/**
 * Creates a product mapping in the database
 */
export async function createProductMapping(
  mapping: Omit<ProductMapping, "id" | "sync_status" | "last_synced_at">
): Promise<string> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("shopify_products")
    .insert({
      local_type: mapping.local_type,
      local_id: mapping.local_id,
      shopify_product_id: mapping.shopify_product_id,
      shopify_variant_id: mapping.shopify_variant_id,
      product_type: mapping.product_type,
      product_category: mapping.product_category,
      source_memoir_id: mapping.source_memoir_id,
      sync_status: "synced",
      last_synced_at: new Date().toISOString(),
      metadata: mapping.metadata,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to create product mapping");

  return data.id;
}

/**
 * Updates product mapping sync status
 */
export async function updateProductSyncStatus(
  mappingId: string,
  status: ProductMapping["sync_status"],
  error?: string
): Promise<void> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  await supabase
    .from("shopify_products")
    .update({
      sync_status: status,
      last_synced_at: status === "synced" ? new Date().toISOString() : undefined,
      metadata: error
        ? {
            last_error: error,
            error_at: new Date().toISOString(),
          }
        : undefined,
    })
    .eq("id", mappingId);
}

/**
 * Logs a sync operation
 */
export async function logSyncOperation(
  operationType: "create" | "update" | "delete" | "sync",
  entityType: string,
  entityId: string | null,
  status: "success" | "error" | "pending",
  errorMessage?: string
): Promise<void> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  await supabase.from("shopify_sync_log").insert({
    operation_type: operationType,
    entity_type: entityType,
    entity_id: entityId,
    status,
    error_message: errorMessage || null,
  });
}

