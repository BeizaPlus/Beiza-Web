import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { verifySupabaseUser } from "../lib/verifySupabaseUser";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_KEEPER_MONTHLY;
  if (!stripeKey || !priceId) {
    return res.status(503).json({ error: "Stripe is not configured on this server." });
  }

  const auth = await verifySupabaseUser(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
    success_url?: string;
    cancel_url?: string;
  };

  const appUrl = process.env.VITE_APP_URL ?? "http://localhost:8080";
  const successUrl = body.success_url?.trim() || `${appUrl}/legacy/vault?upgraded=1`;
  const cancelUrl = body.cancel_url?.trim() || `${appUrl}/pricing`;

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: "Server configuration missing." });

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });

  const { data: ent } = await supabase
    .from("legacy_entitlements")
    .select("tier, status, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (ent?.tier === "keeper" && ent.status === "active") {
    return res.status(400).json({ error: "You already have Keeper." });
  }

  let customerId = ent?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: auth.user.email ?? undefined,
      metadata: { user_id: auth.user.id, source: "beiza_web" },
    });
    customerId = customer.id;
    await supabase.from("legacy_entitlements").upsert({
      user_id: auth.user.id,
      stripe_customer_id: customerId,
      tier: "circle",
      status: "none",
      updated_at: new Date().toISOString(),
    });
  }

  if (
    ent?.stripe_subscription_id &&
    ent.status &&
    ["active", "past_due", "trialing"].includes(ent.status)
  ) {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: successUrl,
    });
    return res.status(200).json({ url: portal.url, type: "portal" });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { user_id: auth.user.id },
    subscription_data: { metadata: { user_id: auth.user.id } },
  });

  return res.status(200).json({ url: session.url, type: "checkout", sessionId: session.id });
}
