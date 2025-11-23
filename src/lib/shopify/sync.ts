/**
 * Product Sync Logic
 * Handles synchronization between local database and Shopify
 */

import { shopifyClient, type ShopifyProduct } from "./client";
import {
  syncProductToShopify,
  syncProductFromShopify,
  updateProductSyncStatus,
  logSyncOperation,
  type ProductMapping,
} from "./service";
import { getSupabaseClient } from "@/lib/supabaseClient";

/**
 * Syncs an offering to Shopify
 */
export async function syncOfferingToShopify(offeringId: string): Promise<void> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  // Get offering data
  const { data: offering, error: offeringError } = await supabase
    .from("offerings")
    .select("*")
    .eq("id", offeringId)
    .single();

  if (offeringError || !offering) {
    throw new Error(`Offering not found: ${offeringId}`);
  }

  // Check if product mapping exists
  const { data: mapping } = await supabase
    .from("shopify_products")
    .select("*")
    .eq("local_type", "offering")
    .eq("local_id", offeringId)
    .single();

  // Sync to Shopify
  const result = await syncProductToShopify(
    {
      title: offering.title,
      body_html: offering.description || "",
      product_type: "Service",
      tags: ["offering"],
    },
    mapping?.shopify_product_id
  );

  if (!result.success) {
    await updateProductSyncStatus(mapping?.id || "", "error", result.error);
    await logSyncOperation("sync", "offering", offeringId, "error", result.error);
    throw new Error(result.error);
  }

  // Update or create mapping
  if (mapping) {
    await supabase
      .from("shopify_products")
      .update({
        shopify_product_id: result.productId!,
        sync_status: "synced",
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", mapping.id);
  } else {
    await supabase.from("shopify_products").insert({
      local_type: "offering",
      local_id: offeringId,
      shopify_product_id: result.productId!,
      product_type: "physical",
      sync_status: "synced",
      last_synced_at: new Date().toISOString(),
    });
  }

  await logSyncOperation("sync", "offering", offeringId, "success");
}

/**
 * Handles inventory updates from Shopify
 * @deprecated This function was only used for webhooks. Consider removing if inventory sync is not needed.
 */
export async function handleInventoryUpdate(
  variantId: number,
  quantity: number
): Promise<void> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  // Find product mapping by variant ID
  const { data: mapping } = await supabase
    .from("shopify_products")
    .select("*")
    .eq("shopify_variant_id", variantId)
    .single();

  if (mapping) {
    // Update metadata with inventory info
    await supabase
      .from("shopify_products")
      .update({
        metadata: {
          ...mapping.metadata,
          inventory_quantity: quantity,
          inventory_updated_at: new Date().toISOString(),
        },
      })
      .eq("id", mapping.id);
  }
}

/**
 * Reconciles products between local DB and Shopify
 */
export async function reconcileProducts(): Promise<{
  synced: number;
  errors: number;
}> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  // Get all product mappings
  const { data: mappings, error } = await supabase
    .from("shopify_products")
    .select("*");

  if (error || !mappings) {
    throw new Error("Failed to fetch product mappings");
  }

  let synced = 0;
  let errors = 0;

  for (const mapping of mappings) {
    try {
      // Fetch product from Shopify
      const shopifyProduct = await shopifyClient.getProduct(mapping.shopify_product_id);
      await syncProductFromShopify(shopifyProduct);
      synced++;
    } catch (error) {
      await updateProductSyncStatus(
        mapping.id,
        "error",
        error instanceof Error ? error.message : "Unknown error"
      );
      errors++;
    }
  }

  return { synced, errors };
}

