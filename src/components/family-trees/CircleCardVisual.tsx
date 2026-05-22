import { useState } from "react";
import { cn } from "@/lib/utils";
import { BeizaCircleMark } from "@/components/family-trees/BeizaCircleMark";
import {
  CIRCLE_CARD_STAMP_IMAGE,
  getAdinkraById,
  getCircleCardImage,
} from "@/lib/adinkra";

const CARD_GRADIENT =
  "linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(10,10,10,1) 100%)";

import { MEDIA_ASSETS } from "@/lib/mediaAssets";

const FALLBACK_IMAGE = MEDIA_ASSETS.home.adinkraHero.src;

type CircleCardVisualProps = {
  adinkraId?: string | null;
  className?: string;
};

/** Top card visual — Adinkra stamp (or per-circle symbol when assigned). No stick-figure tree. */
export function CircleCardVisual({ adinkraId, className }: CircleCardVisualProps) {
  const adinkra = getAdinkraById(adinkraId);
  const primarySrc = getCircleCardImage(adinkraId);
  const [src, setSrc] = useState(primarySrc);

  const onError = () => {
    if (src !== CIRCLE_CARD_STAMP_IMAGE) {
      setSrc(CIRCLE_CARD_STAMP_IMAGE);
      return;
    }
    if (src !== FALLBACK_IMAGE) {
      setSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height: 160 }}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover object-center"
        style={{ filter: "none" }}
        onError={onError}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: CARD_GRADIENT }}
        aria-hidden
      />
      <BeizaCircleMark
        size={20}
        className="pointer-events-none absolute left-3 top-3 z-[1] rounded-sm opacity-90"
      />

      {adinkra ? (
        <p className="pointer-events-none absolute bottom-2 left-3 z-[1] font-manrope text-[10px] font-normal italic text-[#555555]">
          {adinkra.name}
        </p>
      ) : null}
    </div>
  );
}
