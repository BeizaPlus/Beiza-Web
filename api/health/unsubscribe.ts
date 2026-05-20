import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DEFER_HEALTH_BILLING } from "../lib/deployDeferred.js";

// Re-enable when shipping weekly health mail:
// import { getSupabaseAdmin } from "../lib/supabaseAdmin.js";
// import { verifyHealthUnsubscribe } from "../lib/healthUnsubscribe.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }
  if (DEFER_HEALTH_BILLING) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(503).send(
      "<!DOCTYPE html><html><body style=\"font-family:sans-serif;background:#0a0a0a;color:#fff;padding:48px;text-align:center\"><h1>Unavailable</h1><p>Health unsubscribe is temporarily disabled.</p></body></html>",
    );
  }
  return res.status(501).send("Health unsubscribe not wired.");
}
