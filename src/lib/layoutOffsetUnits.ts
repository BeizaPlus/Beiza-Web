/** Detect legacy studio values stored as px (large magnitudes). */
export function looksLikePxOffset(value: number): boolean {
  return Math.abs(value) > 50 || (value < 0 && value < -25);
}

export function pxToViewportPercent(px: number, ref = 1440): number {
  return Math.min(100, Math.max(0, 100 + (px / ref) * 100));
}

/** px translate on a right-anchored rail → % from left edge of viewport */
export function legacyNavPxToXPercent(px: number, ref = 1440): number {
  const railHalf = 28;
  const padding = 24;
  const fromLeft = ref - padding - railHalf + px;
  return Math.min(100, Math.max(0, (fromLeft / ref) * 100));
}

export function pxToVw(px: number, ref = 1440): number {
  return Math.round((px / ref) * 100 * 10) / 10;
}

export function pxToVh(px: number, ref = 900): number {
  return Math.round((px / ref) * 100 * 10) / 10;
}
