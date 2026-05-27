/** Vault storage caps — keep in sync with `server/vercel-handlers/circle/record-memory.ts`. */

export const CIRCLE_VAULT_MAX_BYTES = 50 * 1024 * 1024;
export const KEEPER_VAULT_MAX_BYTES = 500 * 1024 * 1024;

/** @deprecated use CIRCLE_VAULT_MAX_BYTES */
export const FREE_VAULT_STORAGE_BYTES = CIRCLE_VAULT_MAX_BYTES;

export const VAULT_STORAGE_FEATURE_COPY = {
  circle: "50 MB shared vault storage",
  keeper: "500 MB vault storage",
  heritage: "Unlimited vault storage",
} as const;

export function circleVaultLimitLabel(): string {
  return "50 MB";
}

export function keeperVaultLimitLabel(): string {
  return "500 MB";
}

export function circleVaultExceededMessage(): string {
  return `This recording exceeds your Circle vault limit (${circleVaultLimitLabel()}). Free space or upgrade to Keeper.`;
}
