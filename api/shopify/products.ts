/**
 * Shopify Products API Endpoint
 * Serverless function that directly calls Shopify API to fetch products
 * No CORS issues since this runs server-side
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get Shopify configuration from environment variables
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const adminApiToken = process.env.SHOPIFY_ADMIN_API_TOKEN || process.env.VITE_SHOPIFY_ADMIN_API_TOKEN;
  let apiVersion = process.env.SHOPIFY_API_VERSION || process.env.VITE_SHOPIFY_API_VERSION || '2024-01';

  // Validate and fix API version format
  const apiVersionPattern = /^(\d{4})-(\d{2})$/;
  const match = apiVersion.match(apiVersionPattern);
  
  if (!match) {
    apiVersion = '2024-01';
  } else {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (year > currentYear || (year === currentYear && month > currentMonth + 3)) {
      apiVersion = '2024-01';
    } else if (year < 2020 || month < 1 || month > 12) {
      apiVersion = '2024-01';
    }
  }

  // Log configuration status (without exposing sensitive data)
  const availableEnvKeys = Object.keys(process.env).filter(key => 
    key.includes('SHOPIFY') || key.includes('shopify')
  );
  
  console.log('Shopify Products API Config:', {
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

  // Validate token format (Shopify tokens can start with 'shpat_' or 'shpss_')
  if (adminApiToken.length < 10) {
    console.error('Shopify token appears invalid (too short):', {
      length: adminApiToken.length,
    });
    return res.status(500).json({
      error: 'Shopify Admin API token appears to be invalid (too short). Please check your SHOPIFY_ADMIN_API_TOKEN in Vercel.',
    });
  }

  // Log token type for debugging (Shopify tokens can be shpat_ or shpss_)
  const tokenType = adminApiToken.startsWith('shpat_') ? 'Admin API Token' 
    : adminApiToken.startsWith('shpss_') ? 'Session Token' 
    : 'Unknown Format';
  
  console.log('Token type detected:', {
    tokenType,
    tokenPrefix: adminApiToken.substring(0, 6),
    tokenLength: adminApiToken.length,
  });

  try {
    // Get query parameters from request
    const {
      limit = '250',
      status = 'active',
      tags,
      product_type,
      page = '1',
    } = req.query;

    // Build query string for Shopify API
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit as string);
    if (status) queryParams.append('status', status as string);
    if (tags) queryParams.append('tags', tags as string);
    if (product_type) queryParams.append('product_type', product_type as string);
    if (page && page !== '1') queryParams.append('page', page as string);

    // Construct Shopify API URL
    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/products.json?${queryParams.toString()}`;

    // Log request details (without exposing token)
    console.log('Making Shopify API request:', {
      url: shopifyUrl.replace(adminApiToken, 'REDACTED'),
      hasToken: !!adminApiToken,
    });

    // Make request to Shopify API
    const shopifyResponse = await fetch(shopifyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminApiToken,
      },
    });

    if (!shopifyResponse.ok) {
      const errorData = await shopifyResponse.json().catch(() => ({}));
      console.error('Shopify API error:', {
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        url: shopifyUrl.replace(adminApiToken, 'REDACTED'),
        error: errorData,
        tokenSet: !!adminApiToken,
        tokenLength: adminApiToken ? adminApiToken.length : 0,
      });
      
      // Return more detailed error information
      const errorMessage = errorData.errors || shopifyResponse.statusText;
      const isInvalidToken = errorMessage?.includes('Invalid API key') || errorMessage?.includes('Invalid API key or access token');
      
      return res.status(shopifyResponse.status).json({
        error: 'Failed to fetch products from Shopify',
        details: errorMessage,
        status: shopifyResponse.status,
        configStatus: {
          hasStoreDomain: !!storeDomain,
          hasAdminApiToken: !!adminApiToken,
          tokenType: tokenType,
          apiVersion,
        },
        ...(isInvalidToken && {
          hint: 'Your token might be a Client Secret (shpss_) instead of an Admin API access token (shpat_). See SHOPIFY_TOKEN_FIX.md for instructions on getting the correct token.',
        }),
      });
    }

    // Parse response
    const data = await shopifyResponse.json();
    
    // Return products with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

