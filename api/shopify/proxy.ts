/**
 * Shopify Admin API Proxy
 * Proxies all Shopify Admin API requests from the frontend to avoid CORS issues
 * 
 * This serverless function runs on the server where there are no CORS restrictions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ShopifyProxyRequest {
  method: string;
  path: string;
  body?: unknown;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Get Shopify configuration from environment variables
  const storeDomain = process.env.VITE_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
  const adminApiToken = process.env.VITE_SHOPIFY_ADMIN_API_TOKEN || process.env.SHOPIFY_ADMIN_API_TOKEN;
  const apiVersion = process.env.VITE_SHOPIFY_API_VERSION || process.env.SHOPIFY_API_VERSION || '2024-01';

  if (!storeDomain || !adminApiToken) {
    return res.status(500).json({
      error: 'Shopify configuration missing. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN environment variables.',
    });
  }

  try {
    // Get request method and path from body (POST) or query (GET for backwards compatibility)
    const requestBody = req.body as ShopifyProxyRequest | undefined;
    const method = requestBody?.method || req.method;
    const path = requestBody?.path || (req.query.path as string);
    const body = requestBody?.body;

    if (!path) {
      return res.status(400).json({
        error: 'Missing required parameter: path',
      });
    }

    // Construct Shopify API URL - path should already include query string if needed
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}${normalizedPath}`;

    // Prepare headers for Shopify API request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminApiToken,
    };

    // Make request to Shopify API
    const shopifyResponse = await fetch(shopifyUrl, {
      method: method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get response data
    const contentType = shopifyResponse.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    const data = isJson 
      ? await shopifyResponse.json()
      : await shopifyResponse.text();

    // Forward status code and data
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(shopifyResponse.status);
    
    if (isJson) {
      res.json(data);
    } else {
      res.send(data);
    }
  } catch (error) {
    console.error('Shopify proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

