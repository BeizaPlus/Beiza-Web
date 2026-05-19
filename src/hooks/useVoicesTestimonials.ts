import { useMemo } from "react";
import { useTestimonials } from "@/hooks/usePublicContent";
import { usePortraitPool } from "@/hooks/usePortraitPool";
import { VOICES_TESTIMONIALS, type VoiceTestimonial } from "@/lib/legacy/voicesTestimonials";

export type VoiceCardData = VoiceTestimonial & {
  imageUrl: string | null;
};

/** Landing voices — Supabase testimonials when available, with portrait pool images. */
export function useVoicesTestimonials(): VoiceCardData[] {
  const { data: published = [] } = useTestimonials("landing");
  const { data: pool = [] } = usePortraitPool();

  return useMemo(() => {
    const fromDb = published
      .filter((t) => t.surfaces.includes("landing"))
      .map((t, index) => {
        const roleParts = (t.role ?? "Family").split("·").map((s) => s.trim());
        const relation = roleParts[0] ?? "Family";
        const location = roleParts[1] ?? "";
        return {
          initials: t.author.slice(0, 2).toUpperCase(),
          name: t.author,
          relation,
          location: location || "Ghana",
          countryCode: "GH",
          country: location || "Ghana",
          featured: index === 0,
          quote: t.quote,
          imageUrl: pool[index % pool.length] ?? pool[0] ?? null,
        } satisfies VoiceCardData;
      });

    if (fromDb.length > 0) return fromDb;

    return VOICES_TESTIMONIALS.map((item, index) => ({
      ...item,
      imageUrl: pool[index % pool.length] ?? pool[0] ?? null,
    }));
  }, [published, pool]);
}
