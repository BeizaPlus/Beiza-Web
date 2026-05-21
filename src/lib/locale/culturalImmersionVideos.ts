import type { BeizaLocale } from "@/lib/locale/types";
import { getWelcomeCardImage } from "@/lib/locale/welcomeImages";

export type CulturalImmersionVideo = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** MP4 or embed URL when production assets land */
  videoSrc?: string;
  posterSrc: string;
  posterAlt: string;
};

const COPY: Record<
  BeizaLocale,
  Pick<CulturalImmersionVideo, "eyebrow" | "title" | "subtitle">
> = {
  "black-american": {
    eyebrow: "Cultural immersion",
    title: "Step into your roots",
    subtitle:
      "Short films that open the door — music, ritual, and everyday life that shaped your people.",
  },
  africa: {
    eyebrow: "Cultural immersion · Africa",
    title: "Step into the continent",
    subtitle:
      "Voices from Ghana, Nigeria, Kenya, and beyond — Adinkra, drum, and the wisdom elders still carry.",
  },
  fr: {
    eyebrow: "Immersion culturelle",
    title: "Entrez dans votre monde",
    subtitle:
      "Films qui vous plongent dans la France, l'outre-mer, et les traditions que votre famille a gardées.",
  },
  indian: {
    eyebrow: "Cultural immersion",
    title: "Enter your heritage",
    subtitle:
      "Raga, festival, and family ritual — video journeys that place you inside Indian life and memory.",
  },
  latina: {
    eyebrow: "Inmersión cultural",
    title: "Entra en tu mundo",
    subtitle:
      "Historias en imagen — música, mesa, y fe que conectan generaciones en América Latina y el Caribe.",
  },
  chinese: {
    eyebrow: "文化沉浸",
    title: "走进您的文化",
    subtitle: "短片带您进入节庆、家训与华人家庭代代相传的生活。",
  },
  brazilian: {
    eyebrow: "Imersão cultural",
    title: "Entre no seu mundo",
    subtitle:
      "Filmes que colocam você dentro da música, da mesa e das tradições que sua família guarda.",
  },
};

export function getCulturalImmersionVideo(locale: BeizaLocale): CulturalImmersionVideo {
  const poster = getWelcomeCardImage(locale, "education");
  const text = COPY[locale] ?? COPY["black-american"];
  return {
    ...text,
    posterSrc: poster.src,
    posterAlt: poster.alt,
  };
}
