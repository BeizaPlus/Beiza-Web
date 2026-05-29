/**
 * Framer-aligned layout breakpoints (Beiza site + layout studio).
 * Phone · Tablet · Desktop — edit gutters per tier in Site padding studio.
 */
export const FRAMER_LAYOUT_BREAKPOINTS = {
  phoneMaxPx: 767,
  tabletMinPx: 768,
  tabletMaxPx: 1199,
  desktopMinPx: 1200,
} as const;

export type LayoutStudioBreakpoint = "phone" | "tablet" | "desktop";

export function layoutBreakpointFromWidth(widthPx: number): LayoutStudioBreakpoint {
  if (widthPx < FRAMER_LAYOUT_BREAKPOINTS.tabletMinPx) return "phone";
  if (widthPx < FRAMER_LAYOUT_BREAKPOINTS.desktopMinPx) return "tablet";
  return "desktop";
}

export function layoutBreakpointLabel(bp: LayoutStudioBreakpoint): string {
  switch (bp) {
    case "phone":
      return `Phone (≤${FRAMER_LAYOUT_BREAKPOINTS.phoneMaxPx}px)`;
    case "tablet":
      return `Tablet (${FRAMER_LAYOUT_BREAKPOINTS.tabletMinPx}–${FRAMER_LAYOUT_BREAKPOINTS.tabletMaxPx}px)`;
    case "desktop":
      return `Desktop (≥${FRAMER_LAYOUT_BREAKPOINTS.desktopMinPx}px)`;
  }
}

export const LAYOUT_BREAKPOINT_MQ = {
  phone: `(max-width: ${FRAMER_LAYOUT_BREAKPOINTS.phoneMaxPx}px)`,
  tablet: `(min-width: ${FRAMER_LAYOUT_BREAKPOINTS.tabletMinPx}px) and (max-width: ${FRAMER_LAYOUT_BREAKPOINTS.tabletMaxPx}px)`,
  desktop: `(min-width: ${FRAMER_LAYOUT_BREAKPOINTS.desktopMinPx}px)`,
} as const;

/** Tailwind class fragments — always match Framer tiers (do not use `sm:` / `md:` for product layout). */
export const LAYOUT_TW = {
  phoneOnly: "max-[767px]",
  tabletUp: "min-[768px]",
  desktopUp: "min-[1200px]",
  legacyRailClearance: "min-[768px]:pr-[calc(5.5rem+var(--beiza-site-padding-x,1.25rem))]",
} as const;

/** @deprecated use LayoutStudioBreakpoint */
export function isLayoutStudioPhone(widthPx: number): boolean {
  return widthPx <= FRAMER_LAYOUT_BREAKPOINTS.phoneMaxPx;
}
