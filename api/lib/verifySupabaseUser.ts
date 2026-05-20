import type { VercelRequest } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export async function verifySupabaseUser(req: VercelRequest) {
  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!auth) {
    return { ok: false as const, status: 401, error: "Sign in required." };
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { ok: false as const, status: 500, error: "Server configuration missing." };
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(auth);
  if (error || !data.user) {
    return { ok: false as const, status: 401, error: "Invalid session." };
  }

  return { ok: true as const, user: data.user, accessToken: auth };
}
