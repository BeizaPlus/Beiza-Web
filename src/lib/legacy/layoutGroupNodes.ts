import type { Node } from "@xyflow/react";

const GROUP_PADDING = 24;
const DEFAULT_PERSON_WIDTH = 180;
const DEFAULT_PERSON_HEIGHT = 160;

/** Skip canvas shortcuts while the user is typing in a field or the edit popover. */
export function isTypingInInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return true;
  return false;
}

export function getNodeAbsolutePosition(
  nodeId: string,
  nodesById: Map<string, Node>,
): { x: number; y: number } {
  const node = nodesById.get(nodeId);
  if (!node) return { x: 0, y: 0 };
  if (!node.parentId) return { x: node.position.x, y: node.position.y };
  const parentAbs = getNodeAbsolutePosition(node.parentId, nodesById);
  return {
    x: parentAbs.x + node.position.x,
    y: parentAbs.y + node.position.y,
  };
}

/** React Flow requires parent nodes before their children in the nodes array. */
export function sortNodesParentFirst<T extends Node>(nodes: T[]): T[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const depth = (node: Node): number => {
    if (!node.parentId) return 0;
    const parent = byId.get(node.parentId);
    return parent ? depth(parent) + 1 : 0;
  };
  return [...nodes].sort((a, b) => depth(a) - depth(b));
}

function readNodeSize(node: Node): { width: number; height: number } {
  const style = node.style as { width?: number | string; height?: number | string } | undefined;
  const width =
    node.measured?.width ??
    (typeof node.width === "number" ? node.width : undefined) ??
    (typeof style?.width === "number" ? style.width : DEFAULT_PERSON_WIDTH);
  const height =
    node.measured?.height ??
    (typeof node.height === "number" ? node.height : undefined) ??
    (typeof style?.height === "number" ? style.height : DEFAULT_PERSON_HEIGHT);
  return { width, height };
}

export type TreeGroupState = {
  groupNodes: Node[];
  /** personId → parent group + relative position inside group */
  memberships: Map<string, { parentId: string; position: { x: number; y: number } }>;
};

export const emptyTreeGroupState = (): TreeGroupState => ({
  groupNodes: [],
  memberships: new Map(),
});

export function applyTreeGroupState<T extends Node>(baseNodes: T[], groupState: TreeGroupState): T[] {
  if (groupState.groupNodes.length === 0 && groupState.memberships.size === 0) {
    return baseNodes;
  }

  const groupIds = new Set(groupState.groupNodes.map((g) => g.id));
  const merged = baseNodes
    .filter((n) => !groupIds.has(n.id))
    .map((node) => {
      const membership = groupState.memberships.get(node.id);
      if (!membership) return node;
      return {
        ...node,
        parentId: membership.parentId,
        extent: "parent" as const,
        position: membership.position,
      };
    });

  return sortNodesParentFirst([...(groupState.groupNodes as T[]), ...merged]);
}

/**
 * Groups selected person nodes under a `type: 'group'` parent.
 * Normalises child coordinates relative to the group bbox origin (0,0 inside the box).
 */
export function layoutGroupNodes(
  selectedPersonIds: string[],
  allNodes: Node[],
  existingGroupId?: string,
): { nodes: Node[]; groupState: TreeGroupState } {
  const groupId = existingGroupId ?? `tree-group-${crypto.randomUUID()}`;
  const nodesById = new Map(allNodes.map((n) => [n.id, n]));

  const selected = selectedPersonIds
    .map((id) => nodesById.get(id))
    .filter((n): n is Node => Boolean(n && n.type === "person"));

  const existingState = syncGroupStateFromNodes(allNodes);

  if (selected.length < 2) {
    return { nodes: allNodes, groupState: existingState };
  }

  const bounds = selected.map((node) => {
    const abs = getNodeAbsolutePosition(node.id, nodesById);
    const { width, height } = readNodeSize(node);
    return { node, abs, width, height };
  });

  const minX = Math.min(...bounds.map((b) => b.abs.x));
  const minY = Math.min(...bounds.map((b) => b.abs.y));
  const maxX = Math.max(...bounds.map((b) => b.abs.x + b.width));
  const maxY = Math.max(...bounds.map((b) => b.abs.y + b.height));

  const groupNode: Node = {
    id: groupId,
    type: "group",
    position: { x: minX - GROUP_PADDING, y: minY - GROUP_PADDING },
    data: { label: "Family group" },
    style: {
      width: maxX - minX + GROUP_PADDING * 2,
      height: maxY - minY + GROUP_PADDING * 2,
      backgroundColor: "rgba(230, 168, 23, 0.06)",
      border: "1px dashed rgba(230, 168, 23, 0.35)",
      borderRadius: 12,
    },
    draggable: true,
    selectable: true,
  };

  const selectedIds = new Set(selected.map((n) => n.id));
  const memberships = new Map(existingState.memberships);

  for (const id of selectedIds) {
    memberships.delete(id);
  }

  for (const { node, abs } of bounds) {
    memberships.set(node.id, {
      parentId: groupId,
      position: {
        x: abs.x - minX + GROUP_PADDING,
        y: abs.y - minY + GROUP_PADDING,
      },
    });
  }

  const groupNodes = [
    ...existingState.groupNodes.filter((g) => g.id !== groupId),
    groupNode,
  ];

  const baseNodes = allNodes.filter((n) => n.type !== "group");
  const groupState: TreeGroupState = { groupNodes, memberships };
  const nodes = applyTreeGroupState(baseNodes, groupState);
  return { nodes, groupState };
}

/** Detach all children from a group and restore absolute canvas positions. */
export function ungroupNodes(groupId: string, allNodes: Node[]): { nodes: Node[]; groupState: TreeGroupState } {
  const nodesById = new Map(allNodes.map((n) => [n.id, n]));
  const group = nodesById.get(groupId);
  if (!group || group.type !== "group") {
    return { nodes: allNodes, groupState: emptyTreeGroupState() };
  }

  const groupAbs = getNodeAbsolutePosition(groupId, nodesById);

  const nodes = allNodes
    .filter((n) => n.id !== groupId)
    .map((node) => {
      if (node.parentId !== groupId) return node;
      const { parentId: _p, extent: _e, ...rest } = node;
      return {
        ...rest,
        position: {
          x: groupAbs.x + node.position.x,
          y: groupAbs.y + node.position.y,
        },
      };
    });

  return { nodes, groupState: syncGroupStateFromNodes(nodes) };
}

/** Absolute canvas positions for person nodes (required for edge handle refresh when grouped). */
export function buildPersonAbsolutePositionMap(nodes: Node[]): Map<string, { x: number; y: number }> {
  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const map = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    if (node.type !== "person") continue;
    map.set(node.id, getNodeAbsolutePosition(node.id, nodesById));
  }
  return map;
}

export function syncGroupStateFromNodes(nodes: Node[]): TreeGroupState {
  const groupNodes = nodes.filter((n) => n.type === "group");
  const memberships = new Map<string, { parentId: string; position: { x: number; y: number } }>();

  for (const node of nodes) {
    if (node.type !== "person" || !node.parentId) continue;
    const parent = nodes.find((n) => n.id === node.parentId);
    if (parent?.type !== "group") continue;
    memberships.set(node.id, {
      parentId: node.parentId,
      position: { ...node.position },
    });
  }

  return { groupNodes, memberships };
}
