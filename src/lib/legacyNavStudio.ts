import type { CSSProperties } from "react";
import {
  legacyNavPxToXPercent,
  looksLikePxOffset,
  pxToVh,
} from "@/lib/layoutOffsetUnits";
import { LAYOUT_CANONICAL } from "@/lib/layoutCanonical";

/** Legacy bottom tab bar + record vertical rail */

export type LegacyNavStudioFrame = {
  /** Record rail: 0 = left edge, 100 = right edge (% of viewport width) */
  offsetXPercent: number;
  /** Record rail: 0 = top, 100 = bottom (% of viewport height) */
  offsetYPercent: number;
  /** Record rail: fine shift after % anchor (vw) */
  offsetXVw: number;
  /** Record rail: fine shift after % anchor (vh) */
  offsetYVh: number;
  /** Bottom tab bar: fine shift left/right (% of bar width) */
  tabShiftXPercent: number;
  /** Bottom tab bar: fine shift up/down (% of bar height) */
  tabShiftYPercent: number;
  /** Lift tab labels under icons (vh) */
  labelLiftVh: number;
  /** Nav row max width, rem */
  maxWidthRem: number;
};

export const LEGACY_NAV_STUDIO_DEFAULTS =
  LAYOUT_CANONICAL.legacyNav as LegacyNavStudioFrame;

const STORAGE_KEY = "beiza-legacy-nav-studio";

function migrateLegacyNavFrame(raw: Record<string, unknown>): LegacyNavStudioFrame {
  const d = LEGACY_NAV_STUDIO_DEFAULTS;
  if (typeof raw.offsetXPercent === "number") {
    const partial = raw as Partial<LegacyNavStudioFrame>;
    return {
      ...d,
      ...partial,
      offsetXPercent: Math.min(100, Math.max(0, partial.offsetXPercent ?? d.offsetXPercent)),
      offsetYPercent: Math.min(100, Math.max(0, partial.offsetYPercent ?? d.offsetYPercent)),
      offsetXVw: partial.offsetXVw ?? d.offsetXVw,
      offsetYVh: partial.offsetYVh ?? d.offsetYVh,
    };
  }

  const legacyX = typeof raw.offsetX === "number" ? raw.offsetX : d.offsetXPercent;
  const legacyY = typeof raw.offsetY === "number" ? raw.offsetY : d.offsetYPercent;
  const legacyLift = typeof raw.labelLift === "number" ? raw.labelLift : d.labelLiftVh;

  return {
    ...d,
    offsetXPercent: looksLikePxOffset(legacyX) ? legacyNavPxToXPercent(legacyX) : legacyX,
    offsetYPercent: looksLikePxOffset(legacyY)
      ? Math.min(100, Math.max(0, 50 + pxToVh(legacyY, 900) * 10))
      : legacyY,
    tabShiftXPercent: typeof raw.tabShiftXPercent === "number" ? raw.tabShiftXPercent : 0,
    tabShiftYPercent: typeof raw.tabShiftYPercent === "number" ? raw.tabShiftYPercent : 0,
    labelLiftVh: looksLikePxOffset(legacyLift) ? pxToVh(legacyLift, 900) : legacyLift,
    maxWidthRem: typeof raw.maxWidthRem === "number" ? raw.maxWidthRem : d.maxWidthRem,
    offsetXVw: typeof raw.offsetXVw === "number" ? raw.offsetXVw : d.offsetXVw,
    offsetYVh: typeof raw.offsetYVh === "number" ? raw.offsetYVh : d.offsetYVh,
  };
}

export function loadLegacyNavStudioFrame(): LegacyNavStudioFrame {
  if (typeof window === "undefined") return { ...LEGACY_NAV_STUDIO_DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...LEGACY_NAV_STUDIO_DEFAULTS };
    return migrateLegacyNavFrame(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return { ...LEGACY_NAV_STUDIO_DEFAULTS };
  }
}

export function saveLegacyNavStudioFrame(frame: LegacyNavStudioFrame) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(frame));
}

/** Vertical record rail — full viewport (0–100% X/Y) + vw/vh fine offset */
export function legacyNavRecordRailStyle(frame: LegacyNavStudioFrame): CSSProperties {
  const parts = ["translate(-50%, -50%)"];
  if (frame.offsetXVw !== 0 || frame.offsetYVh !== 0) {
    parts.push(`translate(${frame.offsetXVw}vw, ${frame.offsetYVh}vh)`);
  }
  return {
    position: "fixed",
    left: `${frame.offsetXPercent}%`,
    top: `${frame.offsetYPercent}%`,
    transform: parts.join(" "),
    maxWidth: `min(${frame.maxWidthRem}rem, calc(100vw - 2 * var(--beiza-site-padding-x, 1.25rem)))`,
    width: "max-content",
    zIndex: 85,
  };
}

/** Horizontal bottom tab bar — shift within site bounds */
export function legacyNavTabBarStyle(frame: LegacyNavStudioFrame): CSSProperties {
  const transform =
    frame.tabShiftXPercent !== 0 || frame.tabShiftYPercent !== 0
      ? `translate(${frame.tabShiftXPercent}%, ${frame.tabShiftYPercent}%)`
      : undefined;
  return {
    maxWidth: `min(${frame.maxWidthRem}rem, calc(100vw - 2 * var(--beiza-site-padding-x, 1.25rem)))`,
    width: "100%",
    transform,
  };
}

export function legacyNavStudioStyle(
  frame: LegacyNavStudioFrame,
  options?: { recordRail?: boolean },
): CSSProperties {
  return options?.recordRail ? legacyNavRecordRailStyle(frame) : legacyNavTabBarStyle(frame);
}
