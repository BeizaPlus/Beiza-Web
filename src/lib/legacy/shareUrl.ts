const DEFAULT_SITE = "https://beizalegacy.com";

export function getPublicSiteOrigin() {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return DEFAULT_SITE;
}

/** Share link — listener plays in Beiza player only (no raw download). */
export function getMemoryShareUrl(shareToken: string) {
  return `${getPublicSiteOrigin()}/memory/${shareToken}`;
}

export function generateShareToken() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
