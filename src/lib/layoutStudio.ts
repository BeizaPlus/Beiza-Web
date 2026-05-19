/** Layout studio panel: dev by default, or any environment with ?studio=1 */
export function isLayoutStudioEnabled(): boolean {
  if (typeof window === "undefined") {
    return import.meta.env.DEV;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("studio") === "1") return true;
  if (params.get("studio") === "0") return false;
  return import.meta.env.DEV;
}
