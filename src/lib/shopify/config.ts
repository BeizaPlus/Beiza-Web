/**
 * Shopify Configuration
 * Centralized configuration for Shopify API integration
 */

export interface ShopifyConfig {
  storeDomain: string;
  adminApiToken: string;
  apiVersion: string;
}

const getEnvVar = (key: string, required = true): string => {
  const value = import.meta.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || "";
};

export const getShopifyConfig = (): ShopifyConfig => {
  const storeDomain = getEnvVar("VITE_SHOPIFY_STORE_DOMAIN");
  const adminApiToken = getEnvVar("VITE_SHOPIFY_ADMIN_API_TOKEN");
  const apiVersion = getEnvVar("VITE_SHOPIFY_API_VERSION", false) || "2024-01";

  // Validate store domain format
  if (storeDomain && !storeDomain.match(/^[a-zA-Z0-9-]+\.myshopify\.com$/)) {
    throw new Error(
      `Invalid Shopify store domain format: ${storeDomain}. Expected format: store-name.myshopify.com`
    );
  }

  return {
    storeDomain,
    adminApiToken,
    apiVersion,
  };
};

export const getShopifyApiUrl = (config: ShopifyConfig, path: string): string => {
  return `https://${config.storeDomain}/admin/api/${config.apiVersion}${path}`;
};

