import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { VercelRequest } from "@vercel/node";
import { hashCircleToken, verifyCircleSessionToken } from "./circleAccessToken";

export type CircleSessionAuth =
  | { ok: true; supabase: SupabaseClient; circleId: string }
  | { ok: false; status: number; error: string };

export async function verifyCircleSession(req: VercelRequest, circleId: string): Promise<CircleSessionAuth> {
  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!circleId || !auth) {
    return { ok: false, status: 401, error: "Missing circle_id or token." };
  }

  const verified = verifyCircleSessionToken(auth, circleId);
  if (!verified.valid || !verified.rawToken) {
    return { ok: false, status: 401, error: "Invalid or expired access." };
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.VITE_SUPABASE_PRIVILEGED_KEY ??
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { ok: false, status: 500, error: "Server configuration missing." };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tokenHash = hashCircleToken(verified.rawToken);
  const { data: sessionRow } = await supabase
    .from("circle_access_tokens")
    .select("id")
    .eq("circle_id", circleId)
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!sessionRow) {
    return { ok: false, status: 401, error: "Session expired. Enter your access code again." };
  }

  return { ok: true, supabase, circleId };
}
