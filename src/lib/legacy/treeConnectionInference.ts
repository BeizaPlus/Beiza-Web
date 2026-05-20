import type { RelationshipType } from "@/lib/legacy/treeRelationships";

export type ConnectionDirection =
  | "parent_to_child"
  | "child_to_parent"
  | "sibling"
  | "diagonal";

export type InferredRelationshipChoice = {
  type: RelationshipType;
  label: string;
};

// Drag from BOTTOM (going down) → you are the parent, target is your child
const PARENT_DOWN: InferredRelationshipChoice[] = [
  { type: "parent_of", label: "Son" },
  { type: "parent_of", label: "Daughter" },
];

// Drag from TOP (going up) → you are the child, target is your parent
const CHILD_UP: InferredRelationshipChoice[] = [
  { type: "child_of", label: "Mother" },
  { type: "child_of", label: "Father" },
];

// Drag from LEFT or RIGHT → same generation
const SIBLING: InferredRelationshipChoice[] = [
  { type: "sibling_of", label: "Brother" },
  { type: "sibling_of", label: "Sister" },
];

function handleSide(id: string | null | undefined): "top" | "bottom" | "left" | "right" | null {
  if (!id) return null;
  if (id.startsWith("top")) return "top";
  if (id.startsWith("bottom")) return "bottom";
  if (id.startsWith("left")) return "left";
  if (id.startsWith("right")) return "right";
  return null;
}

/** Infer relationship family from handle ids and node positions (canvas coords). */
export function inferConnectionDirection(params: {
  sourcePos: { x: number; y: number };
  targetPos: { x: number; y: number };
  sourceHandle?: string | null;
  targetHandle?: string | null;
}): ConnectionDirection {
  const { sourcePos, targetPos, sourceHandle, targetHandle } = params;
  const sourceSide = handleSide(sourceHandle);
  const targetSide = handleSide(targetHandle);

  if (sourceSide === "bottom" || targetSide === "top") {
    if (targetPos.y >= sourcePos.y - 20) return "parent_to_child";
  }
  if (sourceSide === "top" || targetSide === "bottom") {
    if (targetPos.y <= sourcePos.y + 20) return "child_to_parent";
  }
  if (
    (sourceSide === "left" && targetSide === "right") ||
    (sourceSide === "right" && targetSide === "left") ||
    sourceSide === "left" ||
    sourceSide === "right"
  ) {
    if (Math.abs(targetPos.y - sourcePos.y) < Math.abs(targetPos.x - sourcePos.x) * 1.2) {
      return "sibling";
    }
  }

  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const dominance = 1.2;

  if (absDy > absDx * dominance) {
    return dy > 0 ? "parent_to_child" : "child_to_parent";
  }
  if (absDx > absDy * dominance) {
    return "sibling";
  }
  return "diagonal";
}

export function relationshipChoicesForDirection(
  direction: ConnectionDirection,
): InferredRelationshipChoice[] | null {
  switch (direction) {
    case "parent_to_child":
      return PARENT_DOWN;
    case "child_to_parent":
      return CHILD_UP;
    case "sibling":
      return SIBLING;
    case "diagonal":
      return null;
  }
}
