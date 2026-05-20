import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DEFER_HEALTH_BILLING, respondDeferred } from "../lib/deployDeferred.js";

// Re-enable when shipping weekly health mail (restore handler body + vercel.json cron):
// import { Resend } from "resend";
// import { getSupabaseAdmin } from "../lib/supabaseAdmin.js";
// import { signHealthUnsubscribe } from "../lib/healthUnsubscribe.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (DEFER_HEALTH_BILLING) {
    return respondDeferred(res, "Weekly health questions");
  }
  return res.status(501).json({ error: "Weekly health cron not wired." });
}
