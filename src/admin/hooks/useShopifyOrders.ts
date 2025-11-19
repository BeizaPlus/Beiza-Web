/**
 * React Query hooks for Shopify Orders
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { updateOrderStatus, type OrderStatus, type OrderRecord } from "@/lib/shopify/orders";
import { sendOrderStatusUpdate, sendPreOrderUpdate, type OrderEmailData } from "@/lib/email/resend";
import { useSafeMutation } from "./useSafeMutation";

const ensureClient = () => {
  const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
  if (!client) {
    throw new Error("Supabase client is not configured.");
  }
  return client;
};

export const shopifyOrdersQueryKey = ["shopify-orders"];

/**
 * Fetches all Shopify orders
 */
export function useShopifyOrders(params?: { status?: OrderStatus; limit?: number }) {
  return useQuery({
    queryKey: [...shopifyOrdersQueryKey, params],
    queryFn: async () => {
      const supabase = ensureClient();
      let query = supabase.from("shopify_orders").select("*");

      if (params?.status) {
        query = query.eq("status", params.status);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as OrderRecord[];
    },
  });
}

/**
 * Fetches a single order
 */
export function useShopifyOrder(id: string) {
  return useQuery({
    queryKey: [...shopifyOrdersQueryKey, id],
    queryFn: async () => {
      const supabase = ensureClient();
      const { data, error } = await supabase
        .from("shopify_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as OrderRecord;
    },
    enabled: !!id,
  });
}

/**
 * Updates order status and sends email notification
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useSafeMutation({
    mutationFn: async (input: {
      orderId: string;
      newStatus: OrderStatus;
      sendEmail?: boolean;
      customMessage?: string;
    }) => {
      // Get current order
      const supabase = ensureClient();
      const { data: order, error: fetchError } = await supabase
        .from("shopify_orders")
        .select("*")
        .eq("id", input.orderId)
        .single();

      if (fetchError || !order) {
        throw new Error("Order not found");
      }

      const previousStatus = order.status;

      // Update status
      await updateOrderStatus(input.orderId, input.newStatus, input.sendEmail ?? true);

      // Send email if requested
      if (input.sendEmail && order.customer_email) {
        const emailData: OrderEmailData = {
          orderNumber: order.order_number,
          customerName: order.customer_name || "Customer",
          customerEmail: order.customer_email,
          status: input.newStatus,
          orderType: order.order_type,
          totalAmount: order.total_amount,
          lineItems: (order.line_items as Array<{ title: string; quantity: number; price: string }>) || [],
          shippingAddress: order.shipping_address as OrderEmailData["shippingAddress"],
        };

        try {
          if (order.order_type === "pre_order" && input.customMessage) {
            await sendPreOrderUpdate(emailData, input.customMessage);
          } else {
            await sendOrderStatusUpdate(emailData, previousStatus);
          }

          // Update email status
          await supabase
            .from("shopify_orders")
            .update({
              last_email_sent_at: new Date().toISOString(),
              last_email_status: "sent",
            })
            .eq("id", input.orderId);
        } catch (emailError) {
          // Log email error but don't fail the mutation
          console.error("Failed to send email:", emailError);
          await supabase
            .from("shopify_orders")
            .update({
              last_email_status: "error",
            })
            .eq("id", input.orderId);
        }
      }

      return { orderId: input.orderId, newStatus: input.newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyOrdersQueryKey });
    },
  });
}

