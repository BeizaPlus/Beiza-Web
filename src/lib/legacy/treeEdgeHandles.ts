/** Pick handle ids so edges attach flush to card borders (handles sit on edges with -5px offset). */

export type TreeHandleIds = {
  sourceHandle: string;
  targetHandle: string;
};

const NODE_W = 180;
const NODE_H = 156;

export function pickTreeEdgeHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
): TreeHandleIds {
  const sx = sourcePos.x + NODE_W / 2;
  const sy = sourcePos.y + NODE_H / 2;
  const tx = targetPos.x + NODE_W / 2;
  const ty = targetPos.y + NODE_H / 2;
  const dx = tx - sx;
  const dy = ty - sy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "right", targetHandle: "left" }
      : { sourceHandle: "left", targetHandle: "right" };
  }

  return dy >= 0
    ? { sourceHandle: "bottom", targetHandle: "top" }
    : { sourceHandle: "top", targetHandle: "bottom" };
}

export function defaultTreeHandles(): TreeHandleIds {
  return { sourceHandle: "right", targetHandle: "left" };
}
