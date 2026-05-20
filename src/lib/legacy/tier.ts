export type LegacyTier = "circle" | "keeper" | "heritage";

/** Dev override: VITE_LEGACY_TIER=keeper|heritage */
export function getLegacyTier(): LegacyTier {
  const raw = import.meta.env.VITE_LEGACY_TIER?.toLowerCase();
  if (raw === "keeper" || raw === "heritage") return raw;
  return "circle";
}

export function canDeleteVaultMemories(tier: LegacyTier) {
  return tier === "keeper" || tier === "heritage";
}

/** Raw audio file download — Keeper+ only. Sharing via link is free on all tiers. */
export function canDownloadRecordings(tier: LegacyTier) {
  return tier === "keeper" || tier === "heritage";
}
