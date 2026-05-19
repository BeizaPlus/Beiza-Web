/** User-facing circle title — never raw UUIDs or smoke-test timestamps. */
export function displayCircleName(name: string | null | undefined): string {
  const raw = (name ?? "").trim();
  if (!raw) return "Your family circle";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)) {
    return "Your family circle";
  }
  const withoutTimestamp = raw.replace(/\s+\d{10,}\s*$/u, "").trim();
  if (/^Screenshot Tree\b/i.test(withoutTimestamp)) return "Your family circle";
  return withoutTimestamp || "Your family circle";
}
