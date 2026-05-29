import { useMemo } from "react";
import type { CircleStrengthMember, StrengthAxis } from "@/lib/legacy/familyStrengths";
import {
  defaultRadarScale,
  polarPoint,
  radarPolygonPoints,
} from "@/lib/legacy/radarChartGeometry";
import { cn } from "@/lib/utils";

type FamilyCircleStrengthsRadarProps = {
  members: CircleStrengthMember[];
  className?: string;
};

function RadarGrid({
  cx,
  cy,
  maxR,
  axes,
}: {
  cx: number;
  cy: number;
  maxR: number;
  axes: StrengthAxis[];
}) {
  return (
    <>
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon
          key={ring}
          points={radarPolygonPoints(cx, cy, maxR * ring, axes, () => 1)}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const outer = polarPoint(cx, cy, maxR, i, axes.length);
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
    </>
  );
}

export function FamilyCircleStrengthsRadar({
  members,
  className,
}: FamilyCircleStrengthsRadarProps) {
  const templateAxes = members[0]?.profile.axes ?? [];
  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => (a.isLeader === b.isLeader ? 0 : a.isLeader ? 1 : -1)),
    [members],
  );

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const scale = defaultRadarScale;

  if (templateAxes.length === 0) return null;

  const maxPoints = radarPolygonPoints(
    cx,
    cy,
    maxR,
    templateAxes.map((a) => ({ ...a, value: a.potential })),
    scale,
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] p-4",
        className,
      )}
    >
      <div className="mb-4">
        <p className="font-manrope text-[10px] font-normal uppercase tracking-[0.22em] text-[#E6A817]">
          Circle map
        </p>
        <h3 className="mt-1 font-manrope text-[15px] font-semibold text-white">Family DNA</h3>
        <p className="mt-1 font-manrope text-[11px] leading-relaxed text-[#666666]">
          Every person in the circle — each shape is someone&apos;s profile on the same axes.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          aria-label="Family circle strengths radar — all members overlaid"
          role="img"
        >
          <RadarGrid cx={cx} cy={cy} maxR={maxR} axes={templateAxes} />
          <polygon
            points={maxPoints}
            fill="rgba(80,80,80,0.08)"
            stroke="#3a3a3a"
            strokeWidth={1}
          />
          {sortedMembers.map((member) => (
            <polygon
              key={member.personId}
              points={radarPolygonPoints(cx, cy, maxR, member.profile.axes, scale)}
              fill={member.color}
              fillOpacity={member.isLeader ? 0.22 : 0.14}
              stroke={member.color}
              strokeWidth={member.isLeader ? 2 : 1.25}
              strokeOpacity={member.isLeader ? 1 : 0.85}
            />
          ))}
        </svg>

        <ul className="flex w-full flex-wrap justify-center gap-x-4 gap-y-2">
          {members.map((member) => (
            <li
              key={member.personId}
              className="inline-flex max-w-[10rem] items-center gap-2 font-manrope text-[11px] text-[#aaaaaa]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: member.color }}
                aria-hidden
              />
              <span className="truncate">
                {member.name}
                {member.isLeader ? " · Leader" : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
