/**
 * Order Tracking System
 * Handles order processing, status updates, and email notifications
 */

import { getSupabaseClient } from "@/lib/supabaseClient";
import type { ShopifyOrder } from "./client";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderType = "order" | "pre_order";

export interface OrderRecord {
  id: string;
  shopify_order_id: number;
  order_number: string;
  customer_email: string;
  customer_name: string | null;
  status: OrderStatus;
  order_type: OrderType;
  total_amount: number;
  line_items: unknown[];
  shipping_address: unknown | null;
  order_data: Record<string, unknown>;
  last_email_sent_at: string | null;
  last_email_status: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Maps Shopify order financial status to our order status
 */
function mapShopifyStatusToOrderStatus(
  financialStatus: string,
  fulfillmentStatus: string | null
): OrderStatus {
  if (financialStatus === "refunded") return "refunded";
  if (financialStatus === "voided") return "cancelled";
  if (fulfillmentStatus === "fulfilled") return "shipped";
  if (fulfillmentStatus === "partial") return "processing";
  if (financialStatus === "paid") return "confirmed";
  return "pending";
}

/**
 * Processes an order webhook from Shopify
 */
export async function processOrderWebhook(shopifyOrder: ShopifyOrder): Promise<string> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  const status = mapShopifyStatusToOrderStatus(
    shopifyOrder.financial_status,
    shopifyOrder.fulfillment_status
  );

  // Determine if it's a pre-order (you can customize this logic)
  const orderType: OrderType = shopifyOrder.tags?.includes("pre-order")
    ? "pre_order"
    : "order";

  const orderData = {
    shopify_order_id: shopifyOrder.id,
    order_number: shopifyOrder.order_number.toString(),
    customer_email: shopifyOrder.email,
    customer_name: shopifyOrder.customer
      ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`.trim()
      : null,
    status,
    order_type: orderType,
    total_amount: parseFloat(shopifyOrder.total_price),
    line_items: shopifyOrder.line_items,
    shipping_address: shopifyOrder.shipping_address,
    order_data: {
      name: shopifyOrder.name,
      financial_status: shopifyOrder.financial_status,
      fulfillment_status: shopifyOrder.fulfillment_status,
      currency: shopifyOrder.currency,
      created_at: shopifyOrder.created_at,
      updated_at: shopifyOrder.updated_at,
    },
  };

  // Check if order already exists
  const { data: existing } = await supabase
    .from("shopify_orders")
    .select("id, status")
    .eq("shopify_order_id", shopifyOrder.id)
    .single();

  let orderId: string;

  if (existing) {
    // Update existing order
    const { data, error } = await supabase
      .from("shopify_orders")
      .update(orderData)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to update order");

    orderId = data.id;

    // If status changed, trigger email notification
    if (existing.status !== status) {
      // Email will be sent via admin action or separate process
      // We'll mark that status changed for email processing
    }
  } else {
    // Create new order
    const { data, error } = await supabase
      .from("shopify_orders")
      .insert(orderData)
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to create order");

    orderId = data.id;
  }

  return orderId;
}

/**
 * Updates order status and optionally sends email
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  sendEmail = true
): Promise<void> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  const { data: order, error: fetchError } = await supabase
    .from("shopify_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // Update status
  const { error: updateError } = await supabase
    .from("shopify_orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (updateError) throw updateError;

  // Send email if requested
  if (sendEmail && order.customer_email) {
    // Email sending will be handled by the email service
    // We'll mark that email should be sent
    await supabase
      .from("shopify_orders")
      .update({
        last_email_sent_at: new Date().toISOString(),
        last_email_status: "pending",
      })
      .eq("id", orderId);
  }
}

/**
 * Gets order status
 */
export async function getOrderStatus(orderId: string): Promise<OrderRecord | null> {
  const supabase = getSupabaseClient({ privileged: true });
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("shopify_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !data) return null;
  return data as OrderRecord;
}

/**
 * Verifies order access by email and order number
 */
export async function verifyOrderAccess(
  orderNumber: string,
  email: string
): Promise<OrderRecord | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase client not available");

  const { data, error } = await supabase
    .from("shopify_orders")
    .select("*")
    .eq("order_number", orderNumber)
    .eq("customer_email", email.toLowerCase())
    .single();

  if (error || !data) return null;
  return data as OrderRecord;
}

