/** Public Supabase storage URL from a bucket path or full URL. */
export function publicStorageUrl(path: string | null | undefined): string | null {
  if (!path?.trim()) return null;
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${trimmed.replace(/^\//, "")}`;
}

/** Hero media JSON from memoirs / events ({ src, alt }). */
export function mediaSrcFromJson(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const src = (media as { src?: string }).src;
  return publicStorageUrl(src ?? null);
}
