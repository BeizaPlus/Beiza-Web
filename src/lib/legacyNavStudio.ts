import type { CSSProperties } from "react";

/** Legacy bottom tab bar (Home · Tree · Record · Vault · Invite) */

export type LegacyNavStudioFrame = {
  offsetX: number;
  offsetY: number;
  /** Lift tab labels under icons, px */
  labelLift: number;
  /** Nav row max width, rem */
  maxWidthRem: number;
};

export const LEGACY_NAV_STUDIO_DEFAULTS: LegacyNavStudioFrame = {
  offsetX: 0,
  offsetY: 70,
  labelLift: 0,
  maxWidthRem: 40,
};

const STORAGE_KEY = "beiza-legacy-nav-studio";

export function loadLegacyNavStudioFrame(): LegacyNavStudioFrame {
  if (typeof window === "undefined") return { ...LEGACY_NAV_STUDIO_DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...LEGACY_NAV_STUDIO_DEFAULTS };
    return { ...LEGACY_NAV_STUDIO_DEFAULTS, ...(JSON.parse(raw) as Partial<LegacyNavStudioFrame>) };
  } catch {
    return { ...LEGACY_NAV_STUDIO_DEFAULTS };
  }
}

export function saveLegacyNavStudioFrame(frame: LegacyNavStudioFrame) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(frame));
}

export function legacyNavStudioStyle(frame: LegacyNavStudioFrame): CSSProperties {
  const transform =
    frame.offsetX !== 0 || frame.offsetY !== 0
      ? `translate(${frame.offsetX}px, ${frame.offsetY}px)`
      : undefined;
  return {
    maxWidth: `${frame.maxWidthRem}rem`,
    transform,
  };
}
