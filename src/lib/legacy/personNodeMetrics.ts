import type { PersonNodeVisual } from "@/lib/legacy/personNodeShapes";

/** Visual card box used for handle placement and edge routing (excludes name below circle nodes). */
export function getPersonCardMetrics(visual: PersonNodeVisual) {
  switch (visual) {
    case "circle-ancestor":
      return { width: 140, height: 140 };
    case "circle-child":
      return { width: 100, height: 100 };
    case "soft-square":
      return { width: 160, height: 176 };
    case "rounded-rect":
    default:
      return { width: 180, height: 156 };
  }
}

/** Map legacy dual-handle ids to a single border handle id. */
export function normalizeTreeHandleId(handleId: string | null | undefined): string {
  if (!handleId) return "right";
  if (handleId === "left-s" || handleId === "left") return "left";
  if (handleId === "right-t" || handleId === "right") return "right";
  if (handleId === "top-s" || handleId === "top") return "top";
  if (handleId === "bottom-t" || handleId === "bottom") return "bottom";
  return handleId;
}
