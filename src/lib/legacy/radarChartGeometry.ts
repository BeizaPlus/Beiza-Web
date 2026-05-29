import type { StrengthAxis } from "@/lib/legacy/familyStrengths";

export function polarPoint(cx: number, cy: number, radius: number, index: number, total: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function radarPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  axes: StrengthAxis[],
  scale: (value: number, potential: number) => number,
) {
  return axes
    .map((axis, i) => {
      const r = radius * scale(axis.value, axis.potential);
      const p = polarPoint(cx, cy, r, i, axes.length);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

export function defaultRadarScale(value: number, potential: number) {
  return potential <= 0 ? 0 : value / potential;
}
