/**
 * Get the base URL for the application.
 * Uses VITE_APP_URL environment variable if available, otherwise falls back to window.location.origin.
 * This ensures redirect URLs work correctly across different environments.
 */
export function getBaseUrl(): string {
  // Check for environment variable first (useful for production deployments)
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl) {
    // Remove trailing slash if present
    return envUrl.replace(/\/$/, '');
  }
  
  // Fall back to window.location.origin (works in browser)
  if (typeof window !== 'undefined') {
    return window.location.origin;
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


