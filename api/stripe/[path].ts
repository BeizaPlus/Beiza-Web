import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DEFER_STRIPE, respondDeferred } from "../lib/deployDeferred.js";

// Re-enable when shipping Keeper billing:
// import billingPortal from "../../server/vercel-handlers/stripe/billingPortal.js";
// import createCheckoutSession from "../../server/vercel-handlers/stripe/createCheckoutSession.js";
// import entitlement from "../../server/vercel-handlers/stripe/entitlement.js";

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<unknown>;

async function entitlementStub(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  res.setHeader("Cache-Control", "private, no-store");
  return res.status(200).json({
    tier: "circle",
    status: "none",
    current_period_end: null,
    deferred: true,
  });
}

const ROUTES: Record<string, Handler> = {
  entitlement: entitlementStub,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.path;
  const segment = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const key = (segment ?? "").trim();

  if (DEFER_STRIPE) {
    if (key === "entitlement") return entitlementStub(req, res);
    return respondDeferred(res, "Stripe billing");
  }

  // const run = ROUTES[key] ?? { billing-portal, create-checkout-session, entitlement }[key];
  const run = ROUTES[key];
  if (!run) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({ error: "Unknown Stripe API route." });
  }
  return run(req, res);
}
