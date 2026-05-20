import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import { isPersonFlowNodeType } from "@/lib/legacy/personNodeShapes";
import { TREE_LEADER_PIN } from "@/lib/legacy/leaderCenteredLayout";
import { buildLayoutOrderMap } from "@/lib/legacy/siblingBirthOrder";
import type { FamilyPerson } from "@/lib/legacy/types";

const NODE_W = 180;
const NODE_H = 160;
const RANK_SEP = 100;
const NODE_SEP = 60;

export type LayoutDirection = "TB" | "LR";

/**
 * Dagre auto-layout on person nodes; optionally re-centers so leaderId sits on TREE_LEADER_PIN.
 */
export function autoLayoutTree(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection,
  leaderId?: string | null,
  people: FamilyPerson[] = [],
): Node[] {
  const orderById = buildLayoutOrderMap(people);
  const personNodes = nodes.filter((n) => isPersonFlowNodeType(n.type ?? undefined));
  if (personNodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: RANK_SEP, nodesep: NODE_SEP });

  const personIds = new Set(personNodes.map((n) => n.id));

  for (const n of personNodes) {
    g.setNode(n.id, {
      width: NODE_W,
      height: NODE_H,
      order: orderById.get(n.id) ?? 100_000,
    });
  }

  for (const e of edges) {
    if (personIds.has(e.source) && personIds.has(e.target)) {
      g.setEdge(e.source, e.target);
    }
  }

  const leader = leaderId && personIds.has(leaderId) ? leaderId : null;
  if (leader) {
    for (const id of personIds) {
      if (id === leader) continue;
      const connected = g.edges().some((edge) => edge.v === id || edge.w === id);
      if (!connected) g.setEdge(leader, id);
    }
  }

  dagre.layout(g);

  const positionMap = new Map<string, { x: number; y: number }>();
  for (const id of g.nodes()) {
    const { x, y } = g.node(id);
    positionMap.set(id, { x: x - NODE_W / 2, y: y - NODE_H / 2 });
  }

  if (leader && positionMap.has(leader)) {
    const anchor = positionMap.get(leader)!;
    for (const [id, pos] of positionMap) {
      positionMap.set(id, {
        x: pos.x - anchor.x + TREE_LEADER_PIN.x,
        y: pos.y - anchor.y + TREE_LEADER_PIN.y,
      });
    }
  }

  return nodes.map((n) => {
    const pos = positionMap.get(n.id);
    if (!pos) return n;
    return { ...n, position: pos };
  });
}
