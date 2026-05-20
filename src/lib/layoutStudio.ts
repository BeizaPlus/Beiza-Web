/** Layout studio panel: localhost dev server, or explicit ?studio=1 (hide with ?studio=0). Never on production hosts by default. */
export function isLayoutStudioEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("studio") === "0") return false;
  if (params.get("studio") === "1") return true;

  // Production / preview deploys: off unless ?studio=1 above
  if (import.meta.env.PROD) return false;

  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}
