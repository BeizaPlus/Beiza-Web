import type { MemoirHighlight, MemoirTimelineEntry, MemoirTimelineMedia } from "@/types/memoir";

export type GalleryImagePoolItem = {
  src: string;
  alt: string;
};

export type ResolvedTimelineImage = {
  src: string;
  alt: string;
  /** True when the entry has no service photo and a gallery image is standing in. */
  isGalleryPlaceholder: boolean;
};

function hasServicePhoto(image: MemoirTimelineMedia | undefined): boolean {
  return Boolean(image?.src?.trim());
}

/** Published gallery + hero images used when timeline entries lack service photos. */
export function buildGalleryImagePool(
  highlights: MemoirHighlight[],
  heroMedia?: MemoirTimelineMedia | null,
): GalleryImagePoolItem[] {
  const seen = new Set<string>();
  const pool: GalleryImagePoolItem[] = [];

  const push = (src?: string | null, alt?: string | null) => {
    const trimmed = src?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    pool.push({ src: trimmed, alt: alt?.trim() || "Memoir gallery" });
  };

  push(heroMedia?.src, heroMedia?.alt);
  for (const highlight of highlights) {
    push(highlight.media.src, highlight.media.alt);
  }

  return pool;
}

export function resolveTimelineEntryImage(
  entry: MemoirTimelineEntry,
  entryIndex: number,
  galleryPool: GalleryImagePoolItem[],
): ResolvedTimelineImage {
  if (hasServicePhoto(entry.image)) {
    return {
      src: entry.image.src,
      alt: entry.image.alt || entry.title,
      isGalleryPlaceholder: false,
    };
  }

  const blurPlaceholder = entry.image.placeholder?.trim();
  if (blurPlaceholder) {
    return {
      src: blurPlaceholder,
      alt: entry.image.alt || entry.title,
      isGalleryPlaceholder: false,
    };
  }

  if (galleryPool.length > 0) {
    const pick = galleryPool[entryIndex % galleryPool.length];
    return {
      src: pick.src,
      alt: pick.alt,
      isGalleryPlaceholder: true,
    };
  }

  return {
    src: "",
    alt: entry.title,
    isGalleryPlaceholder: false,
  };
}
