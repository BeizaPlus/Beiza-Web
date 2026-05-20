import dagre from "@dagrejs/dagre";
import type { FamilyPerson } from "@/lib/legacy/types";
import type { TreeEdgeRow } from "@/lib/legacy/treeRelationships";
import { isPersonFlowNodeType } from "@/lib/legacy/personNodeShapes";
import { layoutOrderForPerson } from "@/lib/legacy/siblingBirthOrder";

const NODE_W = 180;
const NODE_H = 160;
const RANK_SEP = 120;
const NODE_SEP = 72;

/** Pin origin — the family leader sits here; everyone else is laid out around them. */
export const TREE_LEADER_PIN = { x: 0, y: 0 } as const;

/** Directed edge for layout: parent/grandparent above leader, children below. */
function layoutEdgeDirection(row: TreeEdgeRow): { from: string; to: string } | null {
  const { source_person_id: s, target_person_id: t, relationship_type: rel } = row;
  switch (rel) {
    case "parent_of":
    case "grandparent_of":
      return { from: s, to: t };
    case "child_of":
    case "grandchild_of":
      return { from: t, to: s };
    case "uncle_aunt_of":
      return { from: s, to: t };
    case "nephew_niece_of":
      return { from: t, to: s };
    default:
      return { from: s, to: t };
  }
}

/**
 * Compute canvas positions with the leader pinned at TREE_LEADER_PIN.
 * Uses tree_edges when present; falls back to parent_id hierarchy.
 */
export function computeLeaderCenteredPositions(
  people: FamilyPerson[],
  treeEdges: TreeEdgeRow[],
  leaderId: string,
): Map<string, { x: number; y: number }> {
  const ids = people.map((p) => p.id);
  if (ids.length === 0) return new Map();

  const leader = leaderId && ids.includes(leaderId) ? leaderId : ids[0]!;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: RANK_SEP, nodesep: NODE_SEP });

  const personById = new Map(people.map((p) => [p.id, p]));
  for (const id of ids) {
    const person = personById.get(id);
    g.setNode(id, {
      width: NODE_W,
      height: NODE_H,
      order: person ? layoutOrderForPerson(person) : 100_000,
    });
  }

  const edgeKeys = new Set<string>();
  const addEdge = (from: string, to: string) => {
    if (!ids.includes(from) || !ids.includes(to) || from === to) return;
    const key = `${from}->${to}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    g.setEdge(from, to);
  };

  for (const row of treeEdges) {
    const dir = layoutEdgeDirection(row);
    if (dir) addEdge(dir.from, dir.to);
  }

  if (treeEdges.length === 0) {
    for (const p of people) {
      if (p.parent_id) addEdge(p.parent_id, p.id);
    }
  }

  // Tie disconnected nodes to leader so nothing floats far away
  for (const id of ids) {
    if (id === leader) continue;
    const hasEdge = g.edges().some((e) => e.v === id || e.w === id);
    if (!hasEdge) addEdge(leader, id);
  }

  dagre.layout(g);

  const raw = new Map<string, { x: number; y: number }>();
  for (const id of g.nodes()) {
    const { x, y } = g.node(id);
    raw.set(id, { x: x - NODE_W / 2, y: y - NODE_H / 2 });
  }

  const leaderPos = raw.get(leader) ?? TREE_LEADER_PIN;
  const centered = new Map<string, { x: number; y: number }>();
  for (const [id, pos] of raw) {
    centered.set(id, {
      x: pos.x - leaderPos.x + TREE_LEADER_PIN.x,
      y: pos.y - leaderPos.y + TREE_LEADER_PIN.y,
    });
  }

  return centered;
}

export function isPersonNode(node: { type?: string | null }) {
  return isPersonFlowNodeType(node.type ?? undefined);
}
