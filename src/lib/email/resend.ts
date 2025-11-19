/**
 * Resend Email Service
 * Handles transactional emails for order updates and notifications
 */

import { Resend } from "resend";

const getResendApiKey = (): string => {
  const key = import.meta.env.VITE_RESEND_API_KEY;
  if (!key) {
    throw new Error("Missing VITE_RESEND_API_KEY environment variable");
  }
  return key;
};

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(getResendApiKey());
  }
  return resendClient;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  orderType: "order" | "pre_order";
  totalAmount: number;
  lineItems: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  shippingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  } | null;
}

/**
 * Sends order confirmation email
 */
export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const client = getResendClient();
  const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || "noreply@beiza.com";

  await client.emails.send({
    from: fromEmail,
    to: data.customerEmail,
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: getOrderConfirmationTemplate(data),
  });
}

/**
 * Sends order status update email
 */
export async function sendOrderStatusUpdate(
  data: OrderEmailData,
  previousStatus: string
): Promise<void> {
  const client = getResendClient();
  const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || "noreply@beiza.com";

  await client.emails.send({
    from: fromEmail,
    to: data.customerEmail,
    subject: `Order Update - ${data.orderNumber}`,
    html: getOrderStatusUpdateTemplate(data, previousStatus),
  });
}

/**
 * Sends pre-order update email
 */
export async function sendPreOrderUpdate(data: OrderEmailData, message: string): Promise<void> {
  const client = getResendClient();
  const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || "noreply@beiza.com";

  await client.emails.send({
    from: fromEmail,
    to: data.customerEmail,
    subject: `Pre-Order Update - ${data.orderNumber}`,
    html: getPreOrderUpdateTemplate(data, message),
  });
}

/**
 * Sends digital product delivery email with download link
 */
export async function sendDigitalProductDelivery(
  data: OrderEmailData,
  downloadLinks: Array<{ productName: string; downloadUrl: string }>
): Promise<void> {
  const client = getResendClient();
  const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || "noreply@beiza.com";

  await client.emails.send({
    from: fromEmail,
    to: data.customerEmail,
    subject: `Your Digital Products - ${data.orderNumber}`,
    html: getDigitalProductDeliveryTemplate(data, downloadLinks),
  });
}

// Email Templates

function getOrderConfirmationTemplate(data: OrderEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: #fff; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your order! We've received your ${data.orderType === "pre_order" ? "pre-order" : "order"} and will process it shortly.</p>
          
          <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Total:</strong> $${data.totalAmount.toFixed(2)}</p>
            
            <h3>Items:</h3>
            <ul>
              ${data.lineItems.map((item) => `<li>${item.title} x${item.quantity} - $${item.price}</li>`).join("")}
            </ul>
          </div>
          
          ${data.shippingAddress ? `
            <div class="order-details">
              <h3>Shipping Address:</h3>
              <p>${data.shippingAddress.name}<br>
              ${data.shippingAddress.address1}<br>
              ${data.shippingAddress.address2 ? data.shippingAddress.address2 + "<br>" : ""}
              ${data.shippingAddress.city}, ${data.shippingAddress.province} ${data.shippingAddress.zip}<br>
              ${data.shippingAddress.country}</p>
            </div>
          ` : ""}
        </div>
        <div class="footer">
          <p>If you have any questions, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getOrderStatusUpdateTemplate(data: OrderEmailData, previousStatus: string): string {
  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared.",
    processing: "Your order is now being processed.",
    shipped: "Your order has been shipped!",
    delivered: "Your order has been delivered.",
    cancelled: "Your order has been cancelled.",
    refunded: "Your order has been refunded.",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-badge { background: #4CAF50; color: #fff; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Status Update</h1>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Your order status has been updated:</p>
          <div class="status-badge">
            <strong>${data.status.toUpperCase()}</strong>
          </div>
          <p>${statusMessages[data.status] || "Your order status has changed."}</p>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPreOrderUpdateTemplate(data: OrderEmailData, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .update-box { background: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pre-Order Update</h1>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <div class="update-box">
            <p>${message}</p>
          </div>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getDigitalProductDeliveryTemplate(
  data: OrderEmailData,
  downloadLinks: Array<{ productName: string; downloadUrl: string }>
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .download-button { background: #4CAF50; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Digital Products Are Ready</h1>
        </div>
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Your digital products are now available for download:</p>
          ${downloadLinks
            .map(
              (link) => `
            <div style="margin: 20px 0;">
              <h3>${link.productName}</h3>
              <a href="${link.downloadUrl}" class="download-button">Download Now</a>
            </div>
          `
            )
            .join("")}
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p style="font-size: 12px; color: #666;">Download links will expire after 30 days.</p>
        </div>
        <div class="footer">
          <p>If you have any questions, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

