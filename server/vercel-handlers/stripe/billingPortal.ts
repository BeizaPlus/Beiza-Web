import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getSupabaseAdmin } from "../../../api/lib/supabaseAdmin.js";
import { verifySupabaseUser } from "../../../api/lib/verifySupabaseUser.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(503).json({ error: "Stripe is not configured." });

  const auth = await verifySupabaseUser(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: "Server configuration missing." });

  const { data: ent } = await supabase
    .from("legacy_entitlements")
    .select("stripe_customer_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!ent?.stripe_customer_id) {
    return res.status(400).json({ error: "No billing account yet. Upgrade to Keeper first." });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
    return_url?: string;
  };
  const appUrl = process.env.VITE_APP_URL ?? "http://localhost:8080";
  const returnUrl = body.return_url?.trim() || `${appUrl}/legacy/vault`;

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
  const portal = await stripe.billingPortal.sessions.create({
    customer: ent.stripe_customer_id,
    return_url: returnUrl,
  });

  return res.status(200).json({ url: portal.url });
}
