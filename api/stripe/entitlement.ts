import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { verifySupabaseUser } from "../lib/verifySupabaseUser";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await verifySupabaseUser(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: "Server configuration missing." });

  const { data: ent } = await supabase
    .from("legacy_entitlements")
    .select("tier, status, current_period_end")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  const tier =
    ent?.tier === "keeper" || ent?.tier === "heritage"
      ? ent.tier
      : ent?.status === "active"
        ? "keeper"
        : "circle";

  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({
    tier,
    status: ent?.status ?? "none",
    current_period_end: ent?.current_period_end ?? null,
  });
}
