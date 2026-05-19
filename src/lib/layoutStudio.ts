/** Layout studio panel: dev, localhost, or ?studio=1 (hide with ?studio=0). */
export function isLayoutStudioEnabled(): boolean {
  if (typeof window === "undefined") {
    return import.meta.env.DEV;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("studio") === "1") return true;
  if (params.get("studio") === "0") return false;

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return true;

  return import.meta.env.DEV;
}
