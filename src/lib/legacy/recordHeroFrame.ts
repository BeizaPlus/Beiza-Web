import type { HeritageHeroFrame } from "@/components/dev/heroLayoutStudioState";
import { LAYOUT_CANONICAL } from "@/lib/layoutCanonical";

/** Ghana (Marmah) — site default record hero framing */
export const RECORD_HERO_GHANA_DEFAULTS: HeritageHeroFrame = {
  posX: 48,
  posY: 32,
  scale: 108,
  textSide: "left",
  overlayStrength: 65,
  copyRaiseVh: 6,
};

/** Studio portrait — from `beiza-layout-canonical.json` */
export const RECORD_HERO_STUDIO_DEFAULTS = LAYOUT_CANONICAL.recordPage
  .hero as HeritageHeroFrame;

/** @deprecated use RECORD_HERO_GHANA_DEFAULTS */
export const RECORD_HERO_DEFAULTS = RECORD_HERO_GHANA_DEFAULTS;

/** @deprecated use RECORD_HERO_GHANA_DEFAULTS */
export const RECORD_HERO_AFRICA_DEFAULTS = RECORD_HERO_GHANA_DEFAULTS;
