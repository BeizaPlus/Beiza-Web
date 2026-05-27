/** Normalize Instagram post/reel URLs for reliable iframe playback. */

const SHORTCODE_RE = /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i;

export function instagramShortCode(url: string, fallbackId?: string): string | null {
  const match = url.match(SHORTCODE_RE);
  if (match?.[1]) return match[1];
  return fallbackId?.trim() || null;
}

/** Prefer /reel/ embed path — plays more reliably than /p/ for vertical clips. */
export function instagramReelPermalink(shortCode: string): string {
  return `https://www.instagram.com/reel/${shortCode}/`;
}

export function instagramEmbedSrc(url: string, shortCodeFallback?: string): string {
  const code = instagramShortCode(url, shortCodeFallback);
  if (!code) {
    return `${url.replace(/\/$/, "")}/embed/`;
  }
  return `https://www.instagram.com/reel/${code}/embed/`;
}
