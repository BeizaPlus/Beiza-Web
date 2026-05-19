import type { CSSProperties } from "react";
import {
  DEFAULT_STUDIO_STATE,
  loadStudioState,
  type LandingLayoutStudioState,
} from "@/components/dev/landingLayoutStudioState";

export type HeroFrame = LandingLayoutStudioState["hero"];

export const DEFAULT_HERO_FRAME: HeroFrame = DEFAULT_STUDIO_STATE.hero;

export function loadHeroFrame(): HeroFrame {
  return loadStudioState().hero;
}

export function heroFrameToImageStyle(frame: HeroFrame): CSSProperties {
  return {
    objectPosition: `${frame.posX}% ${frame.posY}%`,
    transform: frame.scale !== 100 ? `scale(${frame.scale / 100})` : undefined,
    transformOrigin: `${frame.posX}% ${frame.posY}%`,
  };
}
