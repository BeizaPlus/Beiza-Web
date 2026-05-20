import type { VercelRequest, VercelResponse } from "@vercel/node";

import billingPortal from "../../server/vercel-handlers/stripe/billingPortal.js";
import createCheckoutSession from "../../server/vercel-handlers/stripe/createCheckoutSession.js";
import entitlement from "../../server/vercel-handlers/stripe/entitlement.js";

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<unknown>;

const ROUTES: Record<string, Handler> = {
  "billing-portal": billingPortal,
  "create-checkout-session": createCheckoutSession,
  entitlement,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.path;
  const segment = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const key = (segment ?? "").trim();
  const run = ROUTES[key];
  if (!run) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({ error: "Unknown Stripe API route." });
  }
  return run(req, res);
}
