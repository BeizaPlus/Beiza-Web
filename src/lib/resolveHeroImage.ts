import { BRAND_IMAGES } from "@/lib/brandImages";

const LOCAL_HERO_FALLBACK = BRAND_IMAGES.homepageHero;

function isBrokenOrRemoteHeroSrc(src: string): boolean {
  const trimmed = src.trim();
  if (!trimmed) return true;
  if (/framerusercontent\.com/i.test(trimmed)) return true;
  if (trimmed.startsWith("/assets/")) return true;
  if (trimmed.startsWith("/images/")) return false;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return !/supabase\.co/i.test(trimmed);
  }
  return false;
}

/** Prefer manifest local paths; never pass dead Framer URLs to `<img>`. */
export function resolveHeroBackgroundSrc(
  src: string | null | undefined,
  fallback: string = LOCAL_HERO_FALLBACK,
): string {
  if (!src || isBrokenOrRemoteHeroSrc(src)) return fallback;
  return src.trim();
}
