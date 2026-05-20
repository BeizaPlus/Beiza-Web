import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DEFER_STRIPE, respondDeferred } from "../lib/deployDeferred.js";

// Re-enable when shipping Keeper billing:
// import Stripe from "stripe";
// import { getSupabaseAdmin } from "../lib/supabaseAdmin.js";
// export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (DEFER_STRIPE) {
    return respondDeferred(res, "Stripe webhook");
  }
  return res.status(501).json({ error: "Stripe webhook handler not wired." });
}
