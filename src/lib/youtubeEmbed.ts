/** Parse youtu.be / youtube.com URLs into an embed-safe ID */
export function youtubeVideoId(urlOrId: string): string | undefined {
  const trimmed = urlOrId.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/,
  );
  return match?.[1];
}

export function youtubeEmbedUrl(urlOrId: string, params?: Record<string, string>): string | undefined {
  const id = youtubeVideoId(urlOrId);
  if (!id) return undefined;
  const search = new URLSearchParams({ rel: "0", modestbranding: "1", ...params });
  return `https://www.youtube.com/embed/${id}?${search.toString()}`;
}
