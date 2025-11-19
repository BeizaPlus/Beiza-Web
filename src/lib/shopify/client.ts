/**
 * Shopify Admin API Client
 * Handles all communication with Shopify's Admin REST API
 */

import { getShopifyConfig, getShopifyApiUrl, type ShopifyConfig } from "./config";

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  status: "active" | "archived" | "draft";
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  tags: string;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string | null;
  inventory_quantity: number;
  inventory_management: string | null;
  requires_shipping: boolean;
  weight: number | null;
  weight_unit: string;
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  src: string;
  alt: string | null;
  width: number;
  height: number;
}

export interface ShopifyOrder {
  id: number;
  order_number: number;
  name: string;
  email: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  created_at: string;
  updated_at: string;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress | null;
  billing_address: ShopifyAddress | null;
  customer: ShopifyCustomer | null;
}

export interface ShopifyLineItem {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  title: string;
  quantity: number;
  price: string;
  sku: string | null;
}

export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface CreateProductInput {
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string[];
  variants?: Array<{
    price: string;
    sku?: string;
    inventory_quantity?: number;
    requires_shipping?: boolean;
  }>;
  images?: Array<{
    src: string;
    alt?: string;
  }>;
}

export interface UpdateProductInput {
  id: number;
  title?: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string[];
  status?: "active" | "archived" | "draft";
}

export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

class ShopifyClient {
  private config: ShopifyConfig;

  constructor() {
    this.config = getShopifyConfig();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = getShopifyApiUrl(this.config, path);
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": this.config.adminApiToken,
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ShopifyApiError(
          errorData.errors?.message || `Shopify API error: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ShopifyApiError) {
        throw error;
      }
      throw new ShopifyApiError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Product operations
  async getProduct(productId: number): Promise<ShopifyProduct> {
    const response = await this.request<{ product: ShopifyProduct }>(
      "GET",
      `/products/${productId}.json`
    );
    return response.product;
  }

  async getProducts(params?: {
    limit?: number;
    page?: number;
    product_type?: string;
    tags?: string;
    status?: "active" | "archived" | "draft";
  }): Promise<ShopifyProduct[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.product_type) queryParams.append("product_type", params.product_type);
    if (params?.tags) queryParams.append("tags", params.tags);
    if (params?.status) queryParams.append("status", params.status);

    const path = `/products.json${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await this.request<{ products: ShopifyProduct[] }>("GET", path);
    return response.products;
  }

  async createProduct(input: CreateProductInput): Promise<ShopifyProduct> {
    const productData: Record<string, unknown> = {
      title: input.title,
      body_html: input.body_html || "",
      vendor: input.vendor || "",
      product_type: input.product_type || "",
      tags: input.tags?.join(",") || "",
    };

    if (input.variants) {
      productData.variants = input.variants.map((v) => ({
        price: v.price,
        sku: v.sku || "",
        inventory_quantity: v.inventory_quantity ?? 0,
        requires_shipping: v.requires_shipping ?? true,
      }));
    } else {
      // Default variant if none provided
      productData.variants = [
        {
          price: "0.00",
          requires_shipping: false,
        },
      ];
    }

    if (input.images) {
      productData.images = input.images;
    }

    const response = await this.request<{ product: ShopifyProduct }>(
      "POST",
      "/products.json",
      { product: productData }
    );
    return response.product;
  }

  async updateProduct(input: UpdateProductInput): Promise<ShopifyProduct> {
    const productData: Record<string, unknown> = {};
    if (input.title !== undefined) productData.title = input.title;
    if (input.body_html !== undefined) productData.body_html = input.body_html;
    if (input.vendor !== undefined) productData.vendor = input.vendor;
    if (input.product_type !== undefined) productData.product_type = input.product_type;
    if (input.tags !== undefined) productData.tags = input.tags.join(",");
    if (input.status !== undefined) productData.status = input.status;

    const response = await this.request<{ product: ShopifyProduct }>(
      "PUT",
      `/products/${input.id}.json`,
      { product: productData }
    );
    return response.product;
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.request("DELETE", `/products/${productId}.json`);
  }

  async updateInventory(variantId: number, quantity: number): Promise<ShopifyVariant> {
    // Note: This is a simplified version. In production, you might use Inventory API
    const response = await this.request<{ variant: ShopifyVariant }>(
      "PUT",
      `/variants/${variantId}.json`,
      {
        variant: {
          inventory_quantity: quantity,
        },
      }
    );
    return response.variant;
  }

  // Order operations
  async getOrder(orderId: number): Promise<ShopifyOrder> {
    const response = await this.request<{ order: ShopifyOrder }>(
      "GET",
      `/orders/${orderId}.json`
    );
    return response.order;
  }

  async getOrders(params?: {
    limit?: number;
    status?: string;
    financial_status?: string;
  }): Promise<ShopifyOrder[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.financial_status) queryParams.append("financial_status", params.financial_status);

    const path = `/orders.json${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await this.request<{ orders: ShopifyOrder[] }>("GET", path);
    return response.orders;
  }
}

// Export singleton instance
export const shopifyClient = new ShopifyClient();

