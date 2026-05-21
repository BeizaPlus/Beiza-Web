import { cn } from "@/lib/utils";
import type { HeroFrame } from "@/lib/heroFrame";

type HeroImageFrame = Pick<HeroFrame, "posX" | "posY" | "scale">;
import { heroFrameToImageStyle } from "@/lib/heroFrame";

type FramedHeroImageProps = {
  src: string;
  alt: string;
  frame: HeroImageFrame;
  className?: string;
  /** Swap to this asset if primary fails to load */
  onErrorSrc?: string;
};

/** Full-bleed hero photo with position + zoom from layout studio. */
export function FramedHeroImage({ src, alt, frame, className, onErrorSrc }: FramedHeroImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      style={heroFrameToImageStyle(frame)}
      loading="eager"
      onError={(e) => {
        if (!onErrorSrc || e.currentTarget.src.endsWith(onErrorSrc)) return;
        e.currentTarget.src = onErrorSrc;
      }}
    />
  );
}
