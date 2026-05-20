import { supabase } from "@/lib/supabaseClient";

/** True when the browser client can reach Supabase. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabase);
}

/**
 * Static/demo fallbacks (Monica, Ernestina, etc.) are only used when:
 * - Supabase env is missing (local scaffold), or
 * - VITE_ALLOW_CONTENT_FALLBACK=true, or
 * - DEV and not explicitly disabled via VITE_ALLOW_CONTENT_FALLBACK=false
 *
 * Production deploys with Supabase should show only real rows — empty sections until content exists.
 */
export function allowStaticContentFallback(): boolean {
  if (!isSupabaseConfigured()) return true;
  if (import.meta.env.VITE_ALLOW_CONTENT_FALLBACK === "true") return true;
  if (import.meta.env.PROD) return false;
  return import.meta.env.VITE_ALLOW_CONTENT_FALLBACK !== "false";
}

export function resolvePublicList<T>(
  scope: string,
  data: T[] | null | undefined,
  error: Error | null | undefined,
  fallback: T[],
  onError?: (scope: string, error: Error | null | undefined) => void,
): T[] {
  if (error) onError?.(scope, error);
  if (!isSupabaseConfigured()) {
    return allowStaticContentFallback() ? fallback : [];
  }
  if (!data?.length) {
    return allowStaticContentFallback() ? fallback : [];
  }
  return data;
}

export function resolvePublicItem<T>(
  data: T | null | undefined,
  fallback: T,
  empty: T,
): T {
  if (!isSupabaseConfigured()) {
    return allowStaticContentFallback() ? fallback : empty;
  }
  if (data === null || data === undefined) {
    return allowStaticContentFallback() ? fallback : empty;
  }
  return data;
}
