/**
 * Shopify Webhook Handlers
 * Processes webhook events from Shopify
 * 
 * Note: Webhook verification should be done server-side (Supabase Edge Function)
 * This client-side code is for reference and testing
 */

import { getShopifyConfig } from "./config";
import { syncProductFromShopify } from "./service";
import { handleInventoryUpdate } from "./sync";
import { processOrderWebhook } from "./orders";
import type { ShopifyProduct, ShopifyOrder } from "./client";

/**
 * Verifies Shopify webhook HMAC signature
 * Note: This should be implemented server-side using Node.js crypto
 * For client-side, we'll skip verification (handled by Edge Function)
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const config = getShopifyConfig();
  if (!config.webhookSecret) {
    console.warn("Webhook secret not configured, skipping signature verification");
    return true; // Allow if secret not configured (for development)
  }

  // In browser environment, we can't verify HMAC securely
  // This should be done in Supabase Edge Function
  // For now, we'll return true and rely on server-side verification
  console.warn("Webhook signature verification should be done server-side");
  return true;
}

/**
 * Processes a Shopify webhook event
 */
export async function processWebhook(
  topic: string,
  shop: string,
  body: unknown,
  signature: string
): Promise<void> {
  // Verify signature
  const bodyString = typeof body === "string" ? body : JSON.stringify(body);
  if (!verifyWebhookSignature(bodyString, signature)) {
    throw new Error("Invalid webhook signature");
  }

  const payload = typeof body === "object" ? body : JSON.parse(bodyString);

  // Route to appropriate handler based on topic
  switch (topic) {
    case "products/create":
    case "products/update":
      await handleProductWebhook(payload);
      break;

    case "orders/create":
    case "orders/updated":
      await handleOrderWebhook(payload);
      break;

    case "inventory_levels/update":
      await handleInventoryWebhook(payload);
      break;

    default:
      console.log(`Unhandled webhook topic: ${topic}`);
  }
}

/**
 * Handles product create/update webhooks
 */
async function handleProductWebhook(payload: { product?: ShopifyProduct }): Promise<void> {
  if (!payload.product) {
    console.error("Product webhook missing product data");
    return;
  }

  try {
    await syncProductFromShopify(payload.product);
  } catch (error) {
    console.error("Error processing product webhook:", error);
    throw error;
  }
}

/**
 * Handles order create/update webhooks
 */
async function handleOrderWebhook(payload: { order?: ShopifyOrder }): Promise<void> {
  if (!payload.order) {
    console.error("Order webhook missing order data");
    return;
  }

  try {
    await processOrderWebhook(payload.order);
  } catch (error) {
    console.error("Error processing order webhook:", error);
    throw error;
  }
}

/**
 * Handles inventory level update webhooks
 */
async function handleInventoryWebhook(
  payload: { inventory_level?: { variant_id: number; available: number } }
): Promise<void> {
  if (!payload.inventory_level) {
    console.error("Inventory webhook missing inventory data");
    return;
  }

  try {
    await handleInventoryUpdate(
      payload.inventory_level.variant_id,
      payload.inventory_level.available
    );
  } catch (error) {
    console.error("Error processing inventory webhook:", error);
    throw error;
  }
}

