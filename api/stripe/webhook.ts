import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getSupabaseAdmin } from "../lib/supabaseAdmin";

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve());
    req.on("error", reject);
  });
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return res.status(503).json({ error: "Stripe webhook not configured." });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).send("Missing stripe-signature");
  }

  const rawBody = await readRawBody(req);
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature failed", err);
    return res.status(400).send("Invalid signature");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).json({ error: "Server configuration missing." });

  const { data: dup } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (dup) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;
        await supabase.from("legacy_entitlements").upsert({
          user_id: userId,
          tier: "keeper",
          status:
            sub.status === "active"
              ? "active"
              : sub.status === "past_due"
                ? "past_due"
                : sub.status === "trialing"
                  ? "trialing"
                  : "none",
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;
        await supabase
          .from("legacy_entitlements")
          .update({
            tier: "circle",
            status: "canceled",
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string | null;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.user_id;
        if (!userId) break;
        await supabase
          .from("legacy_entitlements")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("user_id", userId);
        break;
      }
      default:
        break;
    }

    await supabase.from("stripe_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
    });

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
