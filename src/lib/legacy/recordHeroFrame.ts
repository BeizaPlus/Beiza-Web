import type { HeritageHeroFrame } from "@/components/dev/heroLayoutStudioState";

/** Ghana (Marmah) — site default record hero framing */
export const RECORD_HERO_GHANA_DEFAULTS: HeritageHeroFrame = {
  posX: 48,
  posY: 32,
  scale: 108,
  textSide: "left",
  overlayStrength: 65,
  copyRaiseVh: 6,
};

/** Studio portrait — EN / ES / FR / CN entry */
export const RECORD_HERO_STUDIO_DEFAULTS: HeritageHeroFrame = {
  posX: 80,
  posY: 67,
  scale: 106,
  textSide: "left",
  overlayStrength: 68,
  copyRaiseVh: 4,
};

/** @deprecated use RECORD_HERO_GHANA_DEFAULTS */
export const RECORD_HERO_DEFAULTS = RECORD_HERO_GHANA_DEFAULTS;

/** @deprecated use RECORD_HERO_GHANA_DEFAULTS */
export const RECORD_HERO_AFRICA_DEFAULTS = RECORD_HERO_GHANA_DEFAULTS;
