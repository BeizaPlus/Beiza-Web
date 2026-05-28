/**
 * Layout studio + on-page text edit: localhost dev server, or ?studio=1 (hide with ?studio=0).
 * Off on production unless ?studio=1. Use “Edit text on page” on any route (except /admin).
 * Site bounds (bottom-right): yellow = --beiza-site-padding-x; cyan = boundary + --beiza-content-indent (hero copy starts on cyan).
 * Heritage (/farewell) is the reference. Yellow guides when studio is on.
 */
const PRODUCTION_HOST_SUFFIXES = ["beizaplus.com", "beiza.tv"] as const;

export function isProductionHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return PRODUCTION_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

/** Public marketing / product UI — hide dev-only chrome (e.g. arm hamburger) on live domains. */
export function isBeizaLiveSite(): boolean {
  if (typeof window === "undefined") {
    return import.meta.env.PROD;
  }
  return import.meta.env.PROD || isProductionHostname(window.location.hostname);
}

export function isLayoutStudioEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("studio") === "0") return false;
  if (params.get("studio") === "1") return true;

  const host = window.location.hostname;

  // Live domains + Vercel builds: off unless ?studio=1 above
  if (import.meta.env.PROD || isProductionHostname(host)) return false;

  return host === "localhost" || host === "127.0.0.1";
}

/** Studio layout pass: skip auth gates and use mock legacy data when needed. */
export function isLegacyStudioPreview(): boolean {
  return isLayoutStudioEnabled();
}

export function studioRecordShellMode(): "signin" | "station" {
  if (typeof window === "undefined") return "station";
  const mode = new URLSearchParams(window.location.search).get("recordShell");
  return mode === "signin" ? "signin" : "station";
}

export function studioRecordPhaseParam():
  | "prepare"
  | "recording"
  | "upload"
  | "seal"
  | null {
  if (!isLegacyStudioPreview() || typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("recordPhase");
  if (raw === "prepare" || raw === "recording" || raw === "upload" || raw === "seal") {
    return raw;
  }
  return null;
}
