import { useMemo } from "react";
import { allowStaticContentFallback } from "@/lib/contentPolicy";
import { useTestimonials } from "@/hooks/usePublicContent";
import { usePortraitPool } from "@/hooks/usePortraitPool";
import { VOICES_TESTIMONIALS, type VoiceTestimonial } from "@/lib/legacy/voicesTestimonials";

export type VoiceCardData = VoiceTestimonial & {
  imageUrl: string | null;
};

function portraitFromTestimonial(
  portraitUrl: string | null | undefined,
  pool: string[],
  index: number,
): string | null {
  if (portraitUrl?.trim()) return portraitUrl.trim();
  if (pool.length === 0) return null;
  return pool[index % pool.length] ?? null;
}

/** Landing voices — published testimonials (`surfaces` contains `landing`) + portrait pool. */
export function useVoicesTestimonials(): VoiceCardData[] {
  const { data: published = [] } = useTestimonials("landing");
  const { data: pool = [] } = usePortraitPool();

  return useMemo(() => {
    if (published.length === 0) {
      if (!allowStaticContentFallback()) return [];
      return VOICES_TESTIMONIALS.map((item, index) => ({
        ...item,
        imageUrl: portraitFromTestimonial(null, pool, index),
      }));
    }

    return [...published]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((t, index) => {
        const roleParts = (t.role ?? "").split("·").map((s) => s.trim()).filter(Boolean);
        const relation = t.relation ?? roleParts[0] ?? "Family";
        const location = t.location ?? roleParts[1] ?? "";
        const country = t.country ?? (location || "Ghana");

        return {
          initials: t.initials ?? t.author.slice(0, 2).toUpperCase(),
          name: t.author,
          relation,
          location: location || "Accra",
          countryCode: t.countryCode ?? "GH",
          country,
          featured: t.isFeatured ?? index === 0,
          quote: t.quote,
          imageUrl: portraitFromTestimonial(t.portraitUrl, pool, index),
        };
      });
  }, [published, pool]);
}
