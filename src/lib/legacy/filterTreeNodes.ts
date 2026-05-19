import type { Edge, Node } from "@xyflow/react";
import type { FamilyTreeNodeData } from "@/lib/legacy/familyTreeFlow";

/** Drop ghost nodes (empty person/memory) before rendering React Flow. */
export function filterValidTreeNodes(nodes: Node<FamilyTreeNodeData>[]): Node<FamilyTreeNodeData>[] {
  return nodes.filter((n) => {
    const d = n.data;
    if (d.kind === "placeholder") return Boolean(d.label?.trim());
    if (d.kind === "person") return Boolean(d.name?.trim());
    if (d.kind === "memory") return Boolean(d.prompt?.trim());
    return false;
  });
}

export function filterValidTreeEdges(
  edges: Edge[],
  nodes: Node<FamilyTreeNodeData>[],
): Edge[] {
  const ids = new Set(nodes.map((n) => n.id));
  return edges.filter((e) => ids.has(e.source) && ids.has(e.target));
}
