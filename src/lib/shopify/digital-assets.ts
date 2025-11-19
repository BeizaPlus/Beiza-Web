/**
 * Digital Product Download System
 * Manages secure download links for digital products
 */

import { getSupabaseClient } from "@/lib/supabaseClient";

// Generate UUID using crypto.randomUUID (available in modern browsers)
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface DigitalAsset {
  id: string;
  shopify_product_id: number;
  order_id: string;
  asset_type: "tribute" | "archive" | "memory_page";
  file_url: string;
  download_token: string;
  download_count: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a secure download link for a digital product
 */
export async function createDownloadLink(
  orderId: string,
  shopifyProductId: number,
  assetType: "tribute" | "archive" | "memory_page",
  fileUrl: string,
  expiresInDays = 30
): Promise<string> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  const downloadToken = generateUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { data, error } = await supabase
    .from("shopify_digital_assets")
    .insert({
      shopify_product_id: shopifyProductId,
      order_id: orderId,
      asset_type: assetType,
      file_url: fileUrl,
      download_token: downloadToken,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to create download link");

  return downloadToken;
}

/**
 * Verifies download token and returns asset information
 */
export async function verifyDownloadToken(
  token: string
): Promise<DigitalAsset | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("shopify_digital_assets")
    .select("*")
    .eq("download_token", token)
    .single();

  if (error || !data) return null;

  // Check if expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data as DigitalAsset;
}

/**
 * Gets signed download URL from Supabase storage
 */
export async function getDownloadUrl(filePath: string, expiresIn = 3600): Promise<string> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  // Extract bucket and path from file_url
  // Format: bucket-name/path/to/file
  const parts = filePath.split("/");
  if (parts.length < 2) {
    throw new Error("Invalid file path format");
  }

  const bucket = parts[0];
  const path = parts.slice(1).join("/");

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error) throw error;
  if (!data) throw new Error("Failed to create signed URL");

  return data.signedUrl;
}

/**
 * Tracks a download
 */
export async function trackDownload(token: string): Promise<void> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  // Get current download count
  const { data: asset } = await supabase
    .from("shopify_digital_assets")
    .select("download_count")
    .eq("download_token", token)
    .single();

  if (!asset) return;

  // Increment download count
  await supabase
    .from("shopify_digital_assets")
    .update({
      download_count: (asset.download_count || 0) + 1,
    })
    .eq("download_token", token);
}

/**
 * Gets all download links for an order
 */
export async function getOrderDownloadLinks(orderId: string): Promise<DigitalAsset[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("shopify_digital_assets")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as DigitalAsset[];
}

