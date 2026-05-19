import { getLegacyTier } from "@/lib/legacy/tier";

const GOLD = "#E6A817";

/** True when Heritage tier has been active 12+ months (env stub until billing ships). */
export function isWhiteSwanIncludedForUser(options?: {
  subscriptionStartedAt?: string | null;
}): boolean {
  if (getLegacyTier() !== "heritage") return false;

  const started =
    options?.subscriptionStartedAt ??
    import.meta.env.VITE_HERITAGE_SUBSCRIPTION_STARTED_AT ??
    null;

  if (!started) return false;

  const start = new Date(started);
  if (Number.isNaN(start.getTime())) return false;

  const months =
    (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
  return months >= 12;
}

export { GOLD as HERITAGE_GOLD };
