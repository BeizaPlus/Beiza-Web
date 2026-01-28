import { createClient, type SupabaseClient as SupabaseJsClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publicKey =
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_PUBLIC_KEY;
const privilegedKey =
  import.meta.env.VITE_SUPABASE_PRIVILEGED_KEY ??
  import.meta.env.VITE_SUPABASE_ADMIN_KEY ??
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export type SupabaseClient = SupabaseJsClient;

const createSharedClient = (key: string, storageKey?: string) => {
  // Get the base URL for redirects - use environment variable if available
  const appUrl = import.meta.env.VITE_APP_URL;
  const redirectTo = appUrl ? `${appUrl.replace(/\/$/, '')}/admin` : undefined;

  return createClient(supabaseUrl!, key, {
    auth: {
      persistSession: storageKey !== undefined,
      autoRefreshToken: Boolean(storageKey),
      detectSessionInUrl: Boolean(storageKey),
      storageKey,
      // Set default redirectTo for auth flows if VITE_APP_URL is configured
      ...(redirectTo && { redirectTo }),
    },
  });
};

const createBrowserClient = (key: string | undefined, storageKey?: string): SupabaseClient | null => {
  if (!supabaseUrl || !key)
  {
    if (!supabaseUrl || !publicKey)
    {
      console.warn("[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
    }
    return null;
  }

  return createSharedClient(key, storageKey);
};

const supabasePublic = createBrowserClient(publicKey, "beiza-admin-session");

const supabasePrivileged =
  supabaseUrl && privilegedKey
    ? (() => {
      if (typeof window !== "undefined")
      {
        console.error(
          "[supabase] SECURITY: Privileged API key detected in browser. Refusing to instantiate. Move privileged operations to a server or Edge function."
        );
        return null;
      }
      return createSharedClient(privilegedKey);
    })()
    : null;

export const supabase = supabasePublic;
export { supabasePublic, supabasePrivileged };

export const getSupabaseClient = (options?: { privileged?: boolean }): SupabaseClient | null => {
  if (options?.privileged && supabasePrivileged)
  {
    return supabasePrivileged;
  }
  return supabasePublic;
};

