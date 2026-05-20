import type { VercelResponse } from "@vercel/node";

/**
 * Flip to false when re-enabling Stripe, weekly health cron, persona chat, etc.
 * See api/circle/[path].ts, api/stripe/*, api/cron/*, api/health/*.
 */
export const DEFER_STRIPE = true;
export const DEFER_HEALTH_BILLING = true;
export const DEFER_PERSONA_CHAT = true;

export function respondDeferred(res: VercelResponse, feature: string) {
  res.setHeader("Content-Type", "application/json");
  return res.status(503).json({
    error: `${feature} is temporarily unavailable. We will enable it in a follow-up deploy.`,
    deferred: true,
  });
}
