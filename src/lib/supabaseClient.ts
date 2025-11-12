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

const createSharedClient = (key: string, storageKey?: string) =>
  createClient(supabaseUrl!, key, {
    auth: {
      persistSession: storageKey !== undefined,
      autoRefreshToken: Boolean(storageKey),
      detectSessionInUrl: Boolean(storageKey),
      storageKey,
    },
  });

const createBrowserClient = (key: string | undefined, storageKey?: string): SupabaseClient | null => {
  if (!supabaseUrl || !key) {
    if (!supabaseUrl || !publicKey) {
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
        if (typeof window !== "undefined") {
          console.warn(
            "[supabase] A privileged API key is configured in the browser environment. Move privileged operations to a server or Edge function to keep your data secure."
          );
        }
        return createSharedClient(privilegedKey);
      })()
    : null;

export const supabase = supabasePublic;
export { supabasePublic, supabasePrivileged };

export const getSupabaseClient = (options?: { privileged?: boolean }): SupabaseClient | null => {
  if (options?.privileged && supabasePrivileged) {
    return supabasePrivileged;
  }
  return supabasePublic;
};

