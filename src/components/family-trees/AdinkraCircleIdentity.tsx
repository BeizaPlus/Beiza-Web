import { useState } from "react";
import {
  CIRCLE_CARD_STAMP_IMAGE,
  DEFAULT_ADINKRA,
  formatAdinkraCaption,
  getAdinkraById,
} from "@/lib/adinkra";

type AdinkraCircleIdentityProps = {
  adinkraId?: string | null;
};

/** Access gate — circle Adinkra symbol + meaning below the family name. */
export function AdinkraCircleIdentity({ adinkraId }: AdinkraCircleIdentityProps) {
  const symbol = getAdinkraById(adinkraId) ?? DEFAULT_ADINKRA;
  const [iconSrc, setIconSrc] = useState(symbol.image);

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <img
        src={iconSrc}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 object-contain opacity-70"
        style={{ filter: "sepia(0.35) saturate(1.1) hue-rotate(-8deg) brightness(1.05)" }}
        onError={() => {
          if (iconSrc !== CIRCLE_CARD_STAMP_IMAGE) {
            setIconSrc(CIRCLE_CARD_STAMP_IMAGE);
          }
        }}
      />
      <p className="max-w-xs font-manrope text-xs font-normal italic leading-relaxed text-[#555555]">
        {formatAdinkraCaption(symbol)}
      </p>
    </div>
  );
}
