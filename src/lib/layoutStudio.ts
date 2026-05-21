/**
 * Layout studio + on-page text edit: localhost dev server, or ?studio=1 (hide with ?studio=0).
 * Off on production unless ?studio=1. Use “Edit text on page” on any route (except /admin).
 * Site padding (bottom-right): boundary --beiza-site-padding-x + inner --beiza-content-indent.
 * Heritage (/farewell) is the reference. Yellow guides when studio is on.
 */
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
