import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { allowStaticContentFallback } from "@/lib/contentPolicy";
import { BRAND_IMAGES } from "@/lib/brandImages";
import { mediaSrcFromJson, publicStorageUrl } from "@/lib/supabaseMedia";

/** Published portrait URLs from gallery_assets + memoir heroes (for tree + voices). */
export function usePortraitPool() {
  return useQuery({
    queryKey: ["portrait-pool"],
    queryFn: async (): Promise<string[]> => {
      const urls: string[] = allowStaticContentFallback()
        ? [BRAND_IMAGES.eventsStoriesHero, BRAND_IMAGES.heritageHero]
        : [];

      if (!supabase) return urls;

      const { data: gallery } = await supabase
        .from("gallery_assets")
        .select("storage_path")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .limit(12);

      for (const row of gallery ?? []) {
        const url = publicStorageUrl(row.storage_path);
        if (url) urls.push(url);
      }

      const { data: memoirs } = await supabase
        .from("memoirs")
        .select("hero_media")
        .eq("is_published", true)
        .limit(8);

      for (const row of memoirs ?? []) {
        const url = mediaSrcFromJson(row.hero_media);
        if (url) urls.push(url);
      }

      return [...new Set(urls)];
    },
    staleTime: 60_000,
  });
}

export function portraitForPerson(
  personId: string,
  photoUrl: string | null | undefined,
  pool: string[],
): string | null {
  const direct = publicStorageUrl(photoUrl ?? null);
  if (direct) return direct;
  if (pool.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < personId.length; i++) hash = (hash + personId.charCodeAt(i)) | 0;
  return pool[Math.abs(hash) % pool.length] ?? null;
}
