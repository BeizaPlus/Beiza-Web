import { useMemo } from "react";
import {
  BookOpen,
  Mic2,
  Sparkles,
  UserRound,
  Wrench,
} from "lucide-react";
import type { FamilyPerson } from "@/lib/legacy/types";
import {
  computeFamilyStrengths,
  formatStrengthValue,
  type PersonTraitBuckets,
  type StrengthAxis,
  type StrengthAxisKey,
} from "@/lib/legacy/familyStrengths";
import { cn } from "@/lib/utils";

const AXIS_ICONS: Record<StrengthAxisKey, typeof Mic2> = {
  storytelling: Mic2,
  craft: Wrench,
  character: Sparkles,
  presence: UserRound,
  legacy: BookOpen,
};

type PersonStrengthsRadarProps = {
  person: FamilyPerson;
  traits: PersonTraitBuckets;
  memoryCount?: number;
  className?: string;
};

function polarPoint(cx: number, cy: number, radius: number, index: number, total: number) {
  const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / total;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function polygonPoints(
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

export function PersonStrengthsRadar({
  person,
  traits,
  memoryCount = 0,
  className,
}: PersonStrengthsRadarProps) {
  const profile = useMemo(
    () => computeFamilyStrengths(person, traits, memoryCount),
    [person, traits, memoryCount],
  );

  const size = 168;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const scale = (value: number, potential: number) =>
    potential <= 0 ? 0 : value / potential;

  const currentPoints = polygonPoints(cx, cy, maxR, profile.axes, scale);
  const maxPoints = polygonPoints(
    cx,
    cy,
    maxR,
    profile.axes.map((a) => ({ ...a, value: a.potential })),
    scale,
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-manrope text-[10px] font-normal uppercase tracking-[0.22em] text-[#E6A817]">
            Family ID
          </p>
          <h3 className="mt-1 font-manrope text-[15px] font-semibold text-white">Strengths</h3>
          <p className="mt-1 font-manrope text-[11px] leading-relaxed text-[#666666]">
            For the next generation — know what to lean into, not what to force.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-manrope text-[10px] uppercase tracking-wider text-[#444444]">
            Profile
          </p>
          <p className="font-manrope text-lg font-semibold tabular-nums text-white">
            {profile.completeness}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <ul className="space-y-2.5">
          {profile.axes.map((axis) => {
            const Icon = AXIS_ICONS[axis.key];
            return (
              <li key={axis.key} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#141414] text-[#888888]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-manrope text-[12px] text-[#cccccc]">{axis.label}</p>
                  <p className="font-manrope text-[10px] text-[#555555]">{axis.hint}</p>
                </div>
                <span className="font-manrope text-[13px] font-medium tabular-nums text-[#7ec8c8]">
                  {formatStrengthValue(axis.value)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto flex flex-col items-center sm:mx-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
            aria-label="Family strengths radar chart"
            role="img"
          >
            {[0.25, 0.5, 0.75, 1].map((ring) => (
              <polygon
                key={ring}
                points={polygonPoints(
                  cx,
                  cy,
                  maxR * ring,
                  profile.axes,
                  () => 1,
                )}
                fill="none"
                stroke="#2a2a2a"
                strokeWidth={1}
              />
            ))}
            {profile.axes.map((_, i) => {
              const outer = polarPoint(cx, cy, maxR, i, profile.axes.length);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#252525"
                  strokeWidth={1}
                />
              );
            })}
            <polygon
              points={maxPoints}
              fill="rgba(80,80,80,0.12)"
              stroke="#3a3a3a"
              strokeWidth={1}
            />
            <polygon
              points={currentPoints}
              fill="rgba(94, 196, 196, 0.28)"
              stroke="#5ec4c4"
              strokeWidth={1.5}
            />
            {profile.axes.map((axis, i) => {
              const r = maxR * scale(axis.value, axis.potential);
              const p = polarPoint(cx, cy, r, i, profile.axes.length);
              return <circle key={axis.key} cx={p.x} cy={p.y} r={2.5} fill="#5ec4c4" />;
            })}
          </svg>

          <div className="mt-2 flex flex-wrap justify-center gap-3 text-[9px] uppercase tracking-wider text-[#555555]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#5ec4c4]/80" />
              Current
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm border border-[#444444] bg-[#222222]" />
              Full potential
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-[#E6A817]/20 bg-[#E6A817]/5 px-3 py-2.5 font-manrope text-[12px] leading-relaxed text-[#d4b56a]">
        {profile.guidance}
      </p>
    </div>
  );
}
