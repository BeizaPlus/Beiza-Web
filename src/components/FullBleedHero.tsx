import type { CSSProperties, ReactNode } from "react";
import type { HeritageHeroFrame } from "@/components/dev/heroLayoutStudioState";
import { FramedHeroImage } from "@/components/FramedHeroImage";
import {
  HERO_CONTENT_BOTTOM_STYLE,
  HERO_CONTENT_CLASS,
  HERO_OVERLAY_GRADIENT,
  HERO_SHELL_CLASS,
} from "@/lib/brandImages";
import type { HeroFrame } from "@/lib/heroFrame";
import { cn } from "@/lib/utils";

type FullBleedHeroProps = {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  overlayGradient?: string;
  /** When set, overlay uses this class (e.g. heritage responsive gradients via CSS vars). */
  overlayClassName?: string;
  /** Fixed object-position when not using layout studio frame */
  objectPosition?: string;
  backgroundScale?: number;
  frame?: HeroFrame | Pick<HeritageHeroFrame, "posX" | "posY" | "scale">;
  contentStyle?: CSSProperties;
  id?: string;
};

/**
 * Full-bleed hero shell — same dimensions and layout as homepage `Hero`.
 * No border-radius, no card wrapper, 100% width.
 */
export function FullBleedHero({
  imageSrc,
  imageAlt,
  children,
  className,
  contentClassName,
  overlayGradient = HERO_OVERLAY_GRADIENT,
  overlayClassName,
  objectPosition = "center top",
  backgroundScale = 100,
  frame,
  contentStyle,
  id,
}: FullBleedHeroProps) {
  const imageStyle: CSSProperties = frame
    ? undefined
    : {
        objectPosition,
        transform: backgroundScale !== 100 ? `scale(${backgroundScale / 100})` : undefined,
        transformOrigin: objectPosition,
      };

  return (
    <header id={id} className={cn(HERO_SHELL_CLASS, className)}>
      {frame ? (
        <FramedHeroImage src={imageSrc} alt={imageAlt} frame={frame} />
      ) : (
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          style={imageStyle}
          loading="eager"
        />
      )}
      <div
        className={cn("absolute inset-0", overlayClassName)}
        style={overlayClassName ? undefined : { background: overlayGradient }}
        aria-hidden
      />
      <div
        className={cn(HERO_CONTENT_CLASS, contentClassName)}
        style={contentStyle ?? HERO_CONTENT_BOTTOM_STYLE}
      >
        {children}
      </div>
    </header>
  );
}
