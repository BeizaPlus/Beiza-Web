/**
 * Get the base URL for the application.
 * Uses VITE_APP_URL environment variable if available, otherwise falls back to window.location.origin.
 * This ensures redirect URLs work correctly across different environments.
 * 
 * IMPORTANT: In production, VITE_APP_URL must be set to your production domain
 * (e.g., https://yourdomain.com) to ensure Supabase auth redirects work correctly.
 * 
 * NOTE: This function normalizes www vs non-www to match VITE_APP_URL if set,
 * to ensure consistency with Supabase redirect URL configuration.
 */
export function getBaseUrl(): string {
  // Check for environment variable first (useful for production deployments)
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl) {
    // Remove trailing slash if present
    const normalized = envUrl.replace(/\/$/, '');
    
    // In production, always use the env URL (even if window.location has www)
    // This ensures consistency with Supabase dashboard configuration
    if (import.meta.env.PROD) {
      return normalized;
    }
    
    // In development, still prefer env URL but allow window.location as fallback
    return normalized;
  }
  
  // In production, never use localhost - this prevents Supabase redirect issues
  // Only use window.location.origin in development
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If we're in production (not localhost), use the origin
    // But warn if we don't have VITE_APP_URL set
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      if (import.meta.env.PROD) {
        console.warn(
          '[url] VITE_APP_URL is not set in production. Using window.location.origin as fallback.',
          'Please set VITE_APP_URL environment variable to your production domain.'
        );
      }
      return origin;
    }
    // In development, localhost is fine
    return origin;
  }
  
  // Fallback for SSR or other environments
  return '';
}

/**
 * Get the full URL for a given path.
 * @param path - The path to append to the base URL (should start with /)
 */
export function getUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}


