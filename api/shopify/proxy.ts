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
  // Note: Vercel serverless functions need regular env vars (not VITE_* prefixed)
  // Priority: Check non-VITE first, then VITE_* as fallback
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const adminApiToken = process.env.SHOPIFY_ADMIN_API_TOKEN || process.env.VITE_SHOPIFY_ADMIN_API_TOKEN;
  let apiVersion = process.env.SHOPIFY_API_VERSION || process.env.VITE_SHOPIFY_API_VERSION || '2024-01';

  // Validate and fix API version format (Shopify uses YYYY-MM format, e.g., 2024-01)
  // Fix common mistakes like 2025-10 (future date) or invalid formats
  const apiVersionPattern = /^(\d{4})-(\d{2})$/;
  const match = apiVersion.match(apiVersionPattern);
  
  if (!match) {
    console.warn(`Invalid API version format: ${apiVersion}. Using default: 2024-01`);
    apiVersion = '2024-01';
  } else {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Validate year and month
    if (year > currentYear || (year === currentYear && month > currentMonth + 3)) {
      console.warn(`API version ${apiVersion} appears to be in the future. Using default: 2024-01`);
      apiVersion = '2024-01';
    } else if (year < 2020 || month < 1 || month > 12) {
      console.warn(`Invalid API version ${apiVersion}. Using default: 2024-01`);
      apiVersion = '2024-01';
    }
  }

  // Log configuration status (without exposing sensitive data)
  const availableEnvKeys = Object.keys(process.env).filter(key => 
    key.includes('SHOPIFY') || key.includes('shopify')
  );
  
  console.log('Shopify Proxy Config:', {
    storeDomain: storeDomain || 'MISSING',
    hasToken: !!adminApiToken,
    tokenLength: adminApiToken ? adminApiToken.length : 0,
    tokenPrefix: adminApiToken ? adminApiToken.substring(0, 10) + '...' : 'N/A',
    apiVersion,
    availableEnvKeys,
  });

  if (!storeDomain || !adminApiToken) {
    console.error('Shopify configuration missing:', {
      hasStoreDomain: !!storeDomain,
      hasAdminApiToken: !!adminApiToken,
      availableEnvKeys,
    });
    return res.status(500).json({
      error: 'Shopify configuration missing. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN environment variables in Vercel.',
      details: 'Note: For serverless functions, use environment variables WITHOUT the VITE_ prefix.',
      availableKeys: availableEnvKeys,
    });
  }

  // Validate token format (Shopify tokens are typically 32+ characters)
  if (adminApiToken.length < 10) {
    console.error('Shopify token appears invalid (too short):', {
      length: adminApiToken.length,
    });
    return res.status(500).json({
      error: 'Shopify Admin API token appears to be invalid (too short). Please check your SHOPIFY_ADMIN_API_TOKEN in Vercel.',
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

    // Log request details (without exposing token)
    console.log('Making Shopify API request:', {
      method,
      url: shopifyUrl,
      hasBody: !!body,
      tokenSet: !!adminApiToken,
    });

    // Make request to Shopify API
    const shopifyResponse = await fetch(shopifyUrl, {
      method: method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get response data
    const contentType = shopifyResponse.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let data: unknown;
    try {
      data = isJson 
        ? await shopifyResponse.json()
        : await shopifyResponse.text();
    } catch (parseError) {
      console.error('Failed to parse Shopify response:', parseError);
      data = { error: 'Failed to parse Shopify API response' };
    }

    // Forward status code and data
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // If Shopify returned an error, log it for debugging
    if (!shopifyResponse.ok) {
      console.error('Shopify API error:', {
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        url: shopifyUrl.replace(adminApiToken, 'REDACTED'),
        response: data,
      });
    }
    
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

