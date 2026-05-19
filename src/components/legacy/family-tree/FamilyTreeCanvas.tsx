import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeMouseHandler,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FamilyPerson, LegacyRecording, RecordingPersonLink } from "@/lib/legacy/types";
import { buildFreeformTreeFlow, treeEdgesToFlowEdges } from "@/lib/legacy/buildFreeformTreeFlow";
import type { FamilyTreeNodeData } from "@/lib/legacy/familyTreeFlow";
import { filterValidTreeEdges, filterValidTreeNodes } from "@/lib/legacy/filterTreeNodes";
import { PersonFlowNode } from "@/components/legacy/family-tree/flow/PersonFlowNode";
import { MemoryFlowNode } from "@/components/legacy/family-tree/flow/MemoryFlowNode";
import { TreeFlowControls } from "@/components/legacy/family-tree/TreeFlowControls";
import { RelationshipPickerModal } from "@/components/legacy/family-tree/RelationshipPickerModal";
import { TreeEdgeContextMenu } from "@/components/legacy/family-tree/TreeEdgeContextMenu";
import { TreeNodeContextMenu } from "@/components/legacy/family-tree/TreeNodeContextMenu";
import { TreeSelectionToolbar } from "@/components/legacy/family-tree/TreeSelectionToolbar";
import {
  applyTreeGroupState,
  buildPersonAbsolutePositionMap,
  emptyTreeGroupState,
  getNodeAbsolutePosition,
  isTypingInInput,
  layoutGroupNodes,
  syncGroupStateFromNodes,
  ungroupNodes,
  type TreeGroupState,
} from "@/lib/legacy/layoutGroupNodes";
import { usePortraitPool, portraitForPerson } from "@/hooks/usePortraitPool";
import { TREE_HEADER_HEIGHT } from "@/components/family-trees/TreeAppShell";
import { useToast } from "@/hooks/use-toast";
import { defaultTreeHandles } from "@/lib/legacy/treeEdgeHandles";
import {
  deleteTreeEdge,
  deleteTreeEdgesForPerson,
  fetchTreeEdges,
  savePersonCanvasPosition,
  savePersonProfile,
  saveTreeEdge,
} from "@/lib/legacy/treeCanvasPersistence";
import {
  formatRelationship,
  TREE_DEFAULT_EDGE_OPTIONS,
  type RelationshipType,
  type TreeEdgeRow,
} from "@/lib/legacy/treeRelationships";

const nodeTypes = {
  person: PersonFlowNode,
  memory: MemoryFlowNode,
};

type FamilyTreeCanvasProps = {
  people: FamilyPerson[];
  links: RecordingPersonLink[];
  recordings?: LegacyRecording[];
  circleId?: string;
  treeEdges?: TreeEdgeRow[];
  persistViaApi?: boolean;
  selectedPersonId: string | null;
  onSelectPerson: (personId: string) => void;
  layout?: "fullViewport" | "embedded";
  fullscreen?: boolean;
  onFullscreenChange?: (active: boolean) => void;
  onPeopleChange?: (people: FamilyPerson[]) => void;
};

function isPersonNode(node: Node<FamilyTreeNodeData> | undefined) {
  return node?.data.kind === "person";
}

function FamilyTreeCanvasInner({
  people,
  links,
  recordings = [],
  circleId,
  treeEdges: initialTreeEdges = [],
  persistViaApi = false,
  selectedPersonId,
  onSelectPerson,
  layout = "fullViewport",
  fullscreen = false,
  onFullscreenChange,
  onPeopleChange,
}: FamilyTreeCanvasProps) {
  const { fitView, getNodes } = useReactFlow();
  const { toast } = useToast();
  const [treeEdgeRows, setTreeEdgeRows] = useState<TreeEdgeRow[]>(initialTreeEdges);
  const [positionOverrides, setPositionOverrides] = useState<Map<string, { x: number; y: number }>>(
    () => new Map(),
  );
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [edgeContextMenu, setEdgeContextMenu] = useState<{ x: number; y: number; edgeId: string } | null>(
    null,
  );
  const [nodeContextMenu, setNodeContextMenu] = useState<{ x: number; y: number; personId: string } | null>(
    null,
  );
  const [personEdits, setPersonEdits] = useState<Map<string, { display_name: string; relation_label: string }>>(
    () => new Map(),
  );
  const groupStateRef = useRef<TreeGroupState>(emptyTreeGroupState());

  useEffect(() => {
    setTreeEdgeRows(initialTreeEdges);
  }, [initialTreeEdges]);

  useEffect(() => {
    if (!circleId) return;
    void fetchTreeEdges(circleId, persistViaApi)
      .then((rows) => {
        if (rows.length > 0) setTreeEdgeRows(rows);
        else if (initialTreeEdges.length === 0) setTreeEdgeRows([]);
      })
      .catch(() => setTreeEdgeRows(initialTreeEdges));
  }, [circleId, persistViaApi, initialTreeEdges]);

  const { data: portraitPool = [] } = usePortraitPool();

  const peopleWithPortraits = useMemo(
    () =>
      people.map((p) => {
        const override = positionOverrides.get(p.id);
        const edit = personEdits.get(p.id);
        return {
          ...p,
          display_name: edit?.display_name ?? p.display_name,
          relation_label: edit?.relation_label ?? p.relation_label,
          photo_url: portraitForPerson(p.id, p.photo_url, portraitPool) ?? p.photo_url,
          canvas_x: override?.x ?? p.canvas_x,
          canvas_y: override?.y ?? p.canvas_y,
        };
      }),
    [people, portraitPool, positionOverrides, personEdits],
  );

  const flowSnapshot = useMemo(() => {
    const built = buildFreeformTreeFlow({
      people: peopleWithPortraits,
      treeEdges: treeEdgeRows,
      links,
      recordings,
      selectedPersonId,
    });
    const validNodes = filterValidTreeNodes(built.nodes);
    return {
      nodes: validNodes,
      edges: filterValidTreeEdges(built.edges, validNodes),
      personEdgeCount: built.personEdgeCount,
    };
  }, [peopleWithPortraits, treeEdgeRows, links, recordings, selectedPersonId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowSnapshot.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowSnapshot.edges);

  const handleEditPerson = useCallback(
    async (personId: string, displayName: string, relationLabel: string) => {
      if (!circleId) return;
      try {
        await savePersonProfile({
          circleId,
          personId,
          displayName,
          relationLabel,
          useApi: persistViaApi,
        });
        setPersonEdits((prev) => {
          const next = new Map(prev);
          next.set(personId, { display_name: displayName, relation_label: relationLabel });
          return next;
        });
        if (onPeopleChange) {
          onPeopleChange(
            people.map((p) =>
              p.id === personId
                ? { ...p, display_name: displayName, relation_label: relationLabel }
                : p,
            ),
          );
        }
      } catch {
        // ignore
      }
    },
    [circleId, persistViaApi, onPeopleChange, people],
  );

  const enrichPersonNodes = useCallback(
    (baseNodes: Node<FamilyTreeNodeData>[]) =>
      baseNodes.map((n) => {
        if (n.data.kind !== "person") return n;
        return {
          ...n,
          data: {
            ...n.data,
            canEdit: Boolean(circleId),
            onEditPerson: handleEditPerson,
          },
        };
      }),
    [circleId, handleEditPerson],
  );

  const mergeWithGroupState = useCallback(
    (baseNodes: Node<FamilyTreeNodeData>[]) =>
      applyTreeGroupState(enrichPersonNodes(baseNodes), groupStateRef.current),
    [enrichPersonNodes],
  );

  useEffect(() => {
    setNodes(mergeWithGroupState(flowSnapshot.nodes));
    setEdges(flowSnapshot.edges);
  }, [flowSnapshot.nodes, flowSnapshot.edges, setNodes, setEdges, mergeWithGroupState]);

  const groupSelectedNodes = useCallback(() => {
    const current = getNodes();
    const selectedIds = current
      .filter((n) => n.selected && n.type === "person")
      .map((n) => n.id);
    if (selectedIds.length < 2) return;

    const { nodes: grouped, groupState } = layoutGroupNodes(selectedIds, current);
    groupStateRef.current = groupState;
    setNodes(grouped as Node<FamilyTreeNodeData>[]);
  }, [getNodes, setNodes]);

  const ungroupSelectedGroup = useCallback(() => {
    const current = getNodes();
    const selectedGroup = current.find((n) => n.selected && n.type === "group");
    if (!selectedGroup) return;

    const { nodes: ungrouped, groupState } = ungroupNodes(selectedGroup.id, current);
    groupStateRef.current = groupState;
    setNodes(ungrouped as Node<FamilyTreeNodeData>[]);
  }, [getNodes, setNodes]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingInInput(event.target)) return;
      if (event.key === "g" || event.key === "G") {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        event.preventDefault();
        groupSelectedNodes();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [groupSelectedNodes]);

  const personNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of people) map.set(p.id, p.display_name);
    return map;
  }, [people]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    if (connection.source === connection.target) return;

    const current = getNodes() as Node<FamilyTreeNodeData>[];
    const sourceNode = current.find((n) => n.id === connection.source);
    const targetNode = current.find((n) => n.id === connection.target);
    if (!isPersonNode(sourceNode) || !isPersonNode(targetNode)) return;

    setPendingConnection(connection);
    setShowRelationshipPicker(true);
  }, [getNodes]);

  const cancelConnection = useCallback(() => {
    setPendingConnection(null);
    setShowRelationshipPicker(false);
  }, []);

  const confirmConnection = useCallback(
    async (relationshipType: RelationshipType) => {
      if (!pendingConnection?.source || !pendingConnection?.target || !circleId) {
        cancelConnection();
        return;
      }

      try {
        const row = await saveTreeEdge({
          circleId,
          sourcePersonId: pendingConnection.source,
          targetPersonId: pendingConnection.target,
          relationshipType,
          useApi: persistViaApi,
        });
        setTreeEdgeRows((rows) => [...rows.filter((r) => r.id !== row.id), row]);
        const positionMap = new Map(nodes.map((n) => [n.id, n.position]));
        const [flowEdge] = treeEdgesToFlowEdges([row], positionMap);
        const handles = defaultTreeHandles();
        const connected = {
          ...flowEdge,
          sourceHandle: pendingConnection.sourceHandle ?? handles.sourceHandle,
          targetHandle: pendingConnection.targetHandle ?? handles.targetHandle,
        };
        setEdges((eds) => [...eds.filter((e) => e.id !== connected.id), connected]);
        toast({
          title: "Connection saved",
          description: formatRelationship(relationshipType),
        });
      } catch (err) {
        toast({
          title: "Could not save connection",
          description: err instanceof Error ? err.message : "Try again.",
          variant: "destructive",
        });
      } finally {
        cancelConnection();
      }
    },
    [pendingConnection, circleId, persistViaApi, cancelConnection, setEdges, nodes, toast],
  );

  const disconnectEdge = useCallback(
    async (edgeId: string) => {
      if (!circleId) return;
      try {
        await deleteTreeEdge({ edgeId, circleId, useApi: persistViaApi });
        setTreeEdgeRows((rows) => rows.filter((r) => r.id !== edgeId));
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      } catch {
        // ignore
      }
    },
    [circleId, persistViaApi, setEdges],
  );

  const disconnectAllEdgesForPerson = useCallback(
    async (personId: string) => {
      if (!circleId) return;
      try {
        const removedIds = await deleteTreeEdgesForPerson({
          personId,
          circleId,
          edges: treeEdgeRows,
          useApi: persistViaApi,
        });
        if (removedIds.length === 0) return;
        setTreeEdgeRows((rows) => rows.filter((r) => !removedIds.includes(r.id)));
        setEdges((eds) => eds.filter((e) => !removedIds.includes(e.id)));
        toast({
          title: "Node disconnected",
          description:
            removedIds.length === 1
              ? "Removed 1 connection."
              : `Removed ${removedIds.length} connections.`,
        });
      } catch {
        toast({
          title: "Could not disconnect node",
          description: "Try again.",
          variant: "destructive",
        });
      }
    },
    [circleId, persistViaApi, treeEdgeRows, setEdges, toast],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      if (!circleId) return;
      for (const edge of deleted) {
        void deleteTreeEdge({ edgeId: edge.id, circleId, useApi: persistViaApi }).catch(() => {});
        setTreeEdgeRows((rows) => rows.filter((r) => r.id !== edge.id));
      }
    },
    [circleId, persistViaApi],
  );

  const onEdgeContextMenu: EdgeMouseHandler = useCallback((event, edge) => {
    event.preventDefault();
    setNodeContextMenu(null);
    setEdgeContextMenu({ x: event.clientX, y: event.clientY, edgeId: edge.id });
  }, []);

  const onNodeContextMenu: NodeMouseHandler<Node<FamilyTreeNodeData>> = useCallback((event, node) => {
    if (node.data.kind !== "person") return;
    event.preventDefault();
    setEdgeContextMenu(null);
    setNodeContextMenu({ x: event.clientX, y: event.clientY, personId: node.id });
  }, []);

  const onPaneClick = useCallback(() => {
    setEdgeContextMenu(null);
    setNodeContextMenu(null);
  }, []);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node<FamilyTreeNodeData>) => {
      const currentNodes = getNodes();
      groupStateRef.current = syncGroupStateFromNodes(currentNodes);

      // Dragging a group moves children with it — refresh edges and persist all member positions.
      if (node.type === "group") {
        const nodesById = new Map(currentNodes.map((n) => [n.id, n]));
        const members = currentNodes.filter((n) => n.parentId === node.id && n.type === "person");

        setPositionOverrides((prev) => {
          const next = new Map(prev);
          for (const member of members) {
            const abs = getNodeAbsolutePosition(member.id, nodesById);
            next.set(member.id, { x: abs.x, y: abs.y });
          }
          return next;
        });

        setEdges((eds) => {
          const positionMap = buildPersonAbsolutePositionMap(currentNodes);
          const personEdgeIds = new Set(treeEdgeRows.map((r) => r.id));
          return eds.map((e) => {
            if (!personEdgeIds.has(e.id)) return e;
            const [refreshed] = treeEdgesToFlowEdges(
              treeEdgeRows.filter((r) => r.id === e.id),
              positionMap,
            );
            return refreshed ?? e;
          });
        });

        if (circleId) {
          for (const member of members) {
            const abs = getNodeAbsolutePosition(member.id, nodesById);
            void savePersonCanvasPosition({
              circleId,
              personId: member.id,
              x: abs.x,
              y: abs.y,
              useApi: persistViaApi,
            });
          }
        }
        return;
      }

      if (node.data.kind !== "person") return;

      const nodesById = new Map(currentNodes.map((n) => [n.id, n]));
      const abs = getNodeAbsolutePosition(node.id, nodesById);

      setPositionOverrides((prev) => {
        const next = new Map(prev);
        next.set(node.id, { x: abs.x, y: abs.y });
        return next;
      });

      setEdges((eds) => {
        const nextNodes = currentNodes.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n,
        );
        const positionMap = buildPersonAbsolutePositionMap(nextNodes);
        const personEdgeIds = new Set(treeEdgeRows.map((r) => r.id));
        return eds.map((e) => {
          if (!personEdgeIds.has(e.id)) return e;
          const [refreshed] = treeEdgesToFlowEdges(
            treeEdgeRows.filter((r) => r.id === e.id),
            positionMap,
          );
          return refreshed ?? e;
        });
      });

      if (!circleId) return;
      void savePersonCanvasPosition({
        circleId,
        personId: node.id,
        x: abs.x,
        y: abs.y,
        useApi: persistViaApi,
      });
    },
    [circleId, persistViaApi, getNodes, treeEdgeRows, setEdges],
  );

  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;
      const current = getNodes() as Node<FamilyTreeNodeData>[];
      const sourceNode = current.find((n) => n.id === connection.source);
      const targetNode = current.find((n) => n.id === connection.target);
      return isPersonNode(sourceNode) && isPersonNode(targetNode);
    },
    [getNodes],
  );

  const onNodeClick: NodeMouseHandler<Node<FamilyTreeNodeData>> = useCallback(
    (_, node) => {
      if (node.data.kind === "person") {
        onSelectPerson(node.data.personId);
      }
    },
    [onSelectPerson],
  );

  const canvasHeight = fullscreen
    ? "100vh"
    : layout === "fullViewport"
      ? `calc(100vh - ${TREE_HEADER_HEIGHT}px)`
      : "calc(100vh - 220px)";

  const showConnectHint = people.length > 0 && flowSnapshot.personEdgeCount === 0;

  const pendingSourceName = pendingConnection?.source
    ? (personNameById.get(pendingConnection.source) ?? "Person")
    : "";
  const pendingTargetName = pendingConnection?.target
    ? (personNameById.get(pendingConnection.target) ?? "Person")
    : "";

  const selectedPersonCount = nodes.filter((n) => n.selected && n.type === "person").length;
  const selectedGroupId = nodes.find((n) => n.selected && n.type === "group")?.id ?? null;

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgesDelete={onEdgesDelete}
        onPaneClick={onPaneClick}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        nodesConnectable={Boolean(circleId)}
        edgesFocusable
        nodesDraggable
        multiSelectionKeyCode="Shift"
        selectionKeyCode={null}
        deleteKeyCode={["Backspace", "Delete"]}
        defaultEdgeOptions={TREE_DEFAULT_EDGE_OPTIONS}
        connectionLineStyle={{ stroke: "rgba(68, 102, 255, 0.5)", strokeWidth: 1.5 }}
        onInit={() => {
          window.requestAnimationFrame(() => {
            void fitView({ padding: 0.2, duration: 200 });
          });
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2.5}
        style={{ width: "100vw", height: canvasHeight }}
        className="family-tree-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={40} size={1} color="#1a1a1a" />
        <TreeFlowControls onFullscreenChange={onFullscreenChange} />
      </ReactFlow>

      <TreeSelectionToolbar
        selectedPersonCount={selectedPersonCount}
        selectedGroupId={selectedGroupId}
        onGroup={groupSelectedNodes}
        onUngroup={ungroupSelectedGroup}
      />

      {edgeContextMenu ? (
        <TreeEdgeContextMenu
          x={edgeContextMenu.x}
          y={edgeContextMenu.y}
          onRemove={() => void disconnectEdge(edgeContextMenu.edgeId)}
          onClose={() => setEdgeContextMenu(null)}
        />
      ) : null}

      {nodeContextMenu ? (
        <TreeNodeContextMenu
          x={nodeContextMenu.x}
          y={nodeContextMenu.y}
          onDisconnect={() => void disconnectAllEdgesForPerson(nodeContextMenu.personId)}
          onClose={() => setNodeContextMenu(null)}
        />
      ) : null}

      {showConnectHint ? (
        <p
          className="pointer-events-none absolute bottom-4 left-0 right-0 text-center font-project text-[11px] text-[#333333]"
          style={{ fontFamily: "var(--font-project, inherit)" }}
        >
          Hover a card for gold dots → drag to another person to connect. No lines until you connect.
        </p>
      ) : null}

      <RelationshipPickerModal
        open={showRelationshipPicker}
        sourceName={pendingSourceName}
        targetName={pendingTargetName}
        onConfirm={(type) => void confirmConnection(type)}
        onCancel={cancelConnection}
      />
    </div>
  );
}

export function FamilyTreeCanvas(props: FamilyTreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
