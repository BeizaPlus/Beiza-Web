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
import { CirclePersonFlowNode } from "@/components/legacy/family-tree/flow/CirclePersonFlowNode";
import { SquarePersonFlowNode } from "@/components/legacy/family-tree/flow/SquarePersonFlowNode";
import { MemoryFlowNode } from "@/components/legacy/family-tree/flow/MemoryFlowNode";
import { TreeAltDragHint } from "@/components/legacy/family-tree/TreeAltDragHint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TreeFlowControls } from "@/components/legacy/family-tree/TreeFlowControls";
import { useTreeTheme } from "@/components/legacy/family-tree/TreeThemeProvider";
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
import { autoLayoutTree, type LayoutDirection } from "@/lib/legacy/autoLayoutTree";
import { usePortraitPool, portraitForPerson } from "@/hooks/usePortraitPool";
import { TREE_HEADER_HEIGHT } from "@/components/family-trees/TreeAppShell";
import { useToast } from "@/hooks/use-toast";
import { defaultTreeHandles } from "@/lib/legacy/treeEdgeHandles";
import {
  deleteTreeEdge,
  deleteTreeEdgesForPerson,
  fetchTreeEdges,
  savePersonCanvasPosition,
  duplicateFamilyPerson,
  savePersonPhoto,
  savePersonProfile,
  saveTreeEdge,
  setTreeLeader,
  updateTreeEdge,
} from "@/lib/legacy/treeCanvasPersistence";
import { planEdgeUpdatesForRelationChange } from "@/lib/legacy/relationshipSync";
import { computeLeaderCenteredPositions } from "@/lib/legacy/leaderCenteredLayout";
import { resolveTreeLeader } from "@/lib/legacy/treeLeader";
import type { FamilyPersonGender } from "@/lib/legacy/types";
import {
  formatRelationship,
  TREE_DEFAULT_EDGE_OPTIONS,
  type RelationshipType,
  type TreeEdgeRow,
} from "@/lib/legacy/treeRelationships";
import {
  inferConnectionDirection,
  relationshipChoicesForDirection,
  type ConnectionDirection,
  type InferredRelationshipChoice,
} from "@/lib/legacy/treeConnectionInference";

const EMPTY_PORTRAIT_POOL: ReturnType<typeof usePortraitPool>["data"] = [];

const nodeTypes = {
  person: PersonFlowNode,
  circlePerson: CirclePersonFlowNode,
  squarePerson: SquarePersonFlowNode,
  memory: MemoryFlowNode,
};

const PERSON_NODE_TYPES = new Set(["person", "circlePerson", "squarePerson"]);

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
  onTreeEdgesChange?: (edges: TreeEdgeRow[]) => void;
  onOpenMemoir?: (memoirSlug: string, personId: string) => void;
  /** When true (e.g. returning from a memoir), fit the full tree in view once nodes load. */
  fitTreeOnLoad?: boolean;
};

function isPersonNode(node: Node<FamilyTreeNodeData> | undefined) {
  return node?.data.kind === "person";
}

function isPersonFlowNodeType(type: string | undefined) {
  return type !== undefined && PERSON_NODE_TYPES.has(type);
}

function FamilyTreeCanvasInner({
  people,
  links,
  recordings = [],
  circleId,
  treeEdges: initialTreeEdges = [],
  persistViaApi = false,
  selectedPersonId: _selectedPersonId,
  onSelectPerson,
  layout = "fullViewport",
  fullscreen = false,
  onFullscreenChange,
  onPeopleChange,
  onTreeEdgesChange,
  onOpenMemoir,
  fitTreeOnLoad = false,
}: FamilyTreeCanvasProps) {
  const { fitView, getNodes } = useReactFlow();
  const { isLight } = useTreeTheme();
  const { toast } = useToast();
  const [treeEdgeRows, setTreeEdgeRows] = useState<TreeEdgeRow[]>(initialTreeEdges);
  const [positionOverrides, setPositionOverrides] = useState<Map<string, { x: number; y: number }>>(
    () => new Map(),
  );
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [connectionDirection, setConnectionDirection] = useState<ConnectionDirection | null>(null);
  const [inferredChoices, setInferredChoices] = useState<InferredRelationshipChoice[] | null>(
    null,
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [edgeContextMenu, setEdgeContextMenu] = useState<{ x: number; y: number; edgeId: string } | null>(
    null,
  );
  const [nodeContextMenu, setNodeContextMenu] = useState<{ x: number; y: number; personId: string } | null>(
    null,
  );
  const [editingEdge, setEditingEdge] = useState<TreeEdgeRow | null>(null);
  type PersonEdit = Partial<FamilyPerson> & {
    displayName?: string;
    relationLabel?: string;
    careerPath?: string | null;
  };
  const [personEdits, setPersonEdits] = useState<Map<string, PersonEdit>>(() => new Map());
  const [pendingDisconnectPersonId, setPendingDisconnectPersonId] = useState<string | null>(null);
  const groupStateRef = useRef<TreeGroupState>(emptyTreeGroupState());
  const hasFittedRef = useRef(false);
  const fitOnLoadDoneRef = useRef(false);

  const memoirSlugByPersonId = useMemo(() => {
    const map = new Map<string, string>();
    for (const person of people) {
      const slug = person.memoir_slug?.trim();
      if (slug) map.set(person.id, slug);
    }
    return map;
  }, [people]);

  useEffect(() => {
    // Only reset from parent if the edge IDs actually changed — prevents
    // re-render loops when parent passes a new array reference with same data.
    setTreeEdgeRows((prev) => {
      const prevIds = prev.map((r) => r.id).join("\0");
      const nextIds = initialTreeEdges.map((r) => r.id).join("\0");
      return prevIds === nextIds ? prev : initialTreeEdges;
    });
  }, [initialTreeEdges]);

  useEffect(() => {
    onTreeEdgesChange?.(treeEdgeRows);
  }, [treeEdgeRows, onTreeEdgesChange]);

  useEffect(() => {
    if (!circleId) return;
    // Fetch once on mount / circleId change — do NOT include initialTreeEdges
    // in deps or every parent re-render triggers a re-fetch → flicker.
    void fetchTreeEdges(circleId, persistViaApi)
      .then((rows) => {
        if (rows.length > 0) setTreeEdgeRows(rows);
      })
      .catch(() => {/* keep current rows on error */});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId, persistViaApi]);

  const { data: portraitPoolData } = usePortraitPool();
  const portraitPool = portraitPoolData ?? EMPTY_PORTRAIT_POOL;

  const peopleWithPortraits = useMemo(
    () =>
      people.map((p) => {
        const override = positionOverrides.get(p.id);
        const edit = personEdits.get(p.id);
        return {
          ...p,
          ...edit,
          display_name: p.display_name ?? edit?.display_name ?? edit?.displayName,
          relation_label: p.relation_label ?? edit?.relation_label ?? edit?.relationLabel,
          career_path: p.career_path ?? edit?.career_path ?? edit?.careerPath,
          gender: p.gender ?? edit?.gender,
          birthplace: p.birthplace ?? edit?.birthplace,
          education: p.education ?? edit?.education,
          languages: p.languages ?? edit?.languages,
          religion: p.religion ?? edit?.religion,
          bio: p.bio ?? edit?.bio,
          nickname: p.nickname ?? edit?.nickname,
          birth_year: p.birth_year ?? edit?.birth_year,
          death_year: p.death_year ?? edit?.death_year,
          photo_url:
            edit?.photo_url ??
            portraitForPerson(p.id, p.photo_url, portraitPool) ??
            p.photo_url,
          canvas_x: override?.x ?? p.canvas_x,
          canvas_y: override?.y ?? p.canvas_y,
        };
      }),
    [people, portraitPool, positionOverrides, personEdits],
  );

  const treeLeader = useMemo(
    () => resolveTreeLeader(peopleWithPortraits, links),
    [peopleWithPortraits, links],
  );
  const treeLeaderId = treeLeader?.personId ?? null;

  const flowSnapshot = useMemo(() => {
    const built = buildFreeformTreeFlow({
      people: peopleWithPortraits,
      treeEdges: treeEdgeRows,
      links,
      recordings,
    });
    const validNodes = filterValidTreeNodes(built.nodes);
    return {
      nodes: validNodes,
      edges: filterValidTreeEdges(built.edges, validNodes),
      personEdgeCount: built.personEdgeCount,
    };
  }, [peopleWithPortraits, treeEdgeRows, links, recordings]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowSnapshot.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowSnapshot.edges);

  const applyPersonPatch = useCallback(
    (personId: string, patch: PersonEdit) => {
      const normalized: PersonEdit = {
        ...patch,
        display_name: patch.display_name ?? patch.displayName,
        relation_label: patch.relation_label ?? patch.relationLabel,
        career_path: patch.career_path ?? patch.careerPath,
      };
      setPersonEdits((prev) => {
        const next = new Map(prev);
        next.set(personId, { ...prev.get(personId), ...normalized });
        return next;
      });
      if (onPeopleChange) {
        onPeopleChange(
          people.map((p) => (p.id === personId ? { ...p, ...normalized } : p)),
        );
      }
    },
    [onPeopleChange, people],
  );

  const runDuplicatePerson = useCallback(
    async (personId: string, offsetX: number, offsetY: number) => {
      if (!circleId) return;
      const source = peopleWithPortraits.find((p) => p.id === personId);
      if (!source) return;

      const baseX = source.canvas_x ?? 0;
      const baseY = source.canvas_y ?? 0;

      try {
        const created = await duplicateFamilyPerson({
          circleId,
          personId,
          canvasX: baseX + offsetX,
          canvasY: baseY + offsetY,
          appendCopySuffix: true,
          useApi: persistViaApi,
        });
        if (onPeopleChange) {
          onPeopleChange([...people, created]);
        }
        toast({ title: "Person duplicated" });
      } catch {
        toast({ title: "Could not duplicate", variant: "destructive" });
      }
    },
    [circleId, people, peopleWithPortraits, persistViaApi, onPeopleChange, toast],
  );

  const applyEdgeUpdates = useCallback(
    async (updates: { edgeId: string; relationship_type: RelationshipType }[]) => {
      if (!circleId || updates.length === 0) return;
      const rowsById = new Map(treeEdgeRows.map((r) => [r.id, r]));
      for (const u of updates) {
        const row = await updateTreeEdge({
          circleId,
          edgeId: u.edgeId,
          relationshipType: u.relationship_type,
          useApi: persistViaApi,
        });
        rowsById.set(row.id, row);
      }
      setTreeEdgeRows(Array.from(rowsById.values()));
      toast({
        title: "Connections updated",
        description:
          updates.length === 1
            ? formatRelationship(updates[0]!.relationship_type)
            : `${updates.length} relationship lines updated`,
      });
    },
    [circleId, persistViaApi, treeEdgeRows, toast],
  );

  const syncEdgesForRelationChange = useCallback(
    async (personId: string, newRelationLabel: string) => {
      const updates = planEdgeUpdatesForRelationChange(
        personId,
        newRelationLabel,
        treeEdgeRows,
        peopleWithPortraits,
      );
      await applyEdgeUpdates(updates);
    },
    [treeEdgeRows, peopleWithPortraits, applyEdgeUpdates],
  );

  const handleEditPerson = useCallback(
    async (personId: string, displayName: string, relationLabel: string) => {
      if (!circleId) return;
      const prior = peopleWithPortraits.find((p) => p.id === personId)?.relation_label ?? null;
      try {
        await savePersonProfile({
          circleId,
          personId,
          displayName,
          relationLabel,
          useApi: persistViaApi,
        });
        applyPersonPatch(personId, {
          display_name: displayName,
          relation_label: relationLabel,
        });
        if (prior?.toUpperCase() !== relationLabel.toUpperCase()) {
          await syncEdgesForRelationChange(personId, relationLabel);
        }
      } catch {
        toast({ title: "Could not save", variant: "destructive" });
      }
    },
    [circleId, persistViaApi, applyPersonPatch, toast, peopleWithPortraits, syncEdgesForRelationChange],
  );

  const handleGenderChange = useCallback(
    async (personId: string, gender: FamilyPersonGender | null) => {
      if (!circleId) return;
      try {
        await savePersonProfile({ circleId, personId, gender, useApi: persistViaApi });
        applyPersonPatch(personId, { gender });
      } catch {
        toast({ title: "Could not save gender", variant: "destructive" });
      }
    },
    [circleId, persistViaApi, applyPersonPatch, toast],
  );

  const handleCareerSave = useCallback(
    async (personId: string, careerPath: string | null) => {
      if (!circleId) return;
      try {
        await savePersonProfile({ circleId, personId, careerPath, useApi: persistViaApi });
        applyPersonPatch(personId, { career_path: careerPath });
      } catch {
        toast({ title: "Could not save career", variant: "destructive" });
      }
    },
    [circleId, persistViaApi, applyPersonPatch, toast],
  );

  const handlePhotoUpload = useCallback(
    async (personId: string, file: File) => {
      if (!circleId) return;
      try {
        const photoUrl = await savePersonPhoto({
          circleId,
          personId,
          file,
          useApi: persistViaApi,
        });
        applyPersonPatch(personId, { photo_url: photoUrl });
        toast({ title: "Photo updated" });
      } catch {
        toast({ title: "Could not upload photo", variant: "destructive" });
      }
    },
    [circleId, persistViaApi, applyPersonPatch, toast],
  );

  const handleDuplicatePerson = useCallback(
    (personId: string) => {
      void runDuplicatePerson(personId, 60, 60);
    },
    [runDuplicatePerson],
  );

  const handleSetTreeLeader = useCallback(
    async (personId: string) => {
      if (!circleId) return;
      try {
        await setTreeLeader({ circleId, personId, useApi: persistViaApi });
        const positions = computeLeaderCenteredPositions(people, treeEdgeRows, personId);
        const nextPeople = people.map((p) => {
          const pos = positions.get(p.id);
          return {
            ...p,
            is_tree_anchor: p.id === personId,
            canvas_x: pos?.x ?? p.canvas_x,
            canvas_y: pos?.y ?? p.canvas_y,
          };
        });
        if (onPeopleChange) onPeopleChange(nextPeople);
        setPositionOverrides(new Map());
        for (const p of nextPeople) {
          if (p.canvas_x == null || p.canvas_y == null) continue;
          void savePersonCanvasPosition({
            circleId,
            personId: p.id,
            x: p.canvas_x,
            y: p.canvas_y,
            useApi: persistViaApi,
          });
        }
        toast({ title: "Family leader pinned", description: "Tree reorganizes around this person." });
        window.requestAnimationFrame(() => {
          void fitView({
            padding: 0.22,
            duration: 400,
            nodes: [{ id: personId }],
          });
        });
      } catch {
        toast({ title: "Could not pin leader", variant: "destructive" });
      }
    },
    [circleId, persistViaApi, onPeopleChange, people, toast, fitView],
  );

  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node<FamilyTreeNodeData>) => {
      if (!event.altKey || node.data.kind !== "person" || !circleId) return;
      void runDuplicatePerson(node.id, 40, 40);
    },
    [circleId, runDuplicatePerson],
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
    const merged = mergeWithGroupState(flowSnapshot.nodes);
    setNodes(merged);
    setEdges(flowSnapshot.edges);
    // Fit view once — after the first real nodes land (not on every update)
    if (!hasFittedRef.current && merged.some((n) => isPersonFlowNodeType(n.type))) {
      hasFittedRef.current = true;
      window.requestAnimationFrame(() => {
        if (fitTreeOnLoad) {
          void fitView({ padding: 0.2, duration: 300 });
        } else if (treeLeaderId) {
          void fitView({ padding: 0.22, duration: 300, nodes: [{ id: treeLeaderId }] });
        } else {
          void fitView({ padding: 0.2, duration: 300 });
        }
      });
    }
  }, [
    flowSnapshot.nodes,
    flowSnapshot.edges,
    setNodes,
    setEdges,
    mergeWithGroupState,
    fitView,
    treeLeaderId,
    fitTreeOnLoad,
  ]);

  useEffect(() => {
    if (!fitTreeOnLoad || fitOnLoadDoneRef.current) return;
    const hasPeople = flowSnapshot.nodes.some((n) => isPersonFlowNodeType(n.type));
    if (!hasPeople) return;
    fitOnLoadDoneRef.current = true;
    window.requestAnimationFrame(() => {
      void fitView({ padding: 0.2, duration: 400 });
    });
  }, [fitTreeOnLoad, flowSnapshot.nodes, fitView]);

  const groupSelectedNodes = useCallback(() => {
    const current = getNodes();
    const selectedIds = current
      .filter((n) => n.selected && isPersonFlowNodeType(n.type))
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

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;

      const current = getNodes() as Node<FamilyTreeNodeData>[];
      const sourceNode = current.find((n) => n.id === connection.source);
      const targetNode = current.find((n) => n.id === connection.target);
      if (!isPersonNode(sourceNode) || !isPersonNode(targetNode)) return;

      const nodesById = new Map(current.map((n) => [n.id, n]));
      const sourcePos = getNodeAbsolutePosition(connection.source, nodesById);
      const targetPos = getNodeAbsolutePosition(connection.target, nodesById);
      const direction = inferConnectionDirection({
        sourcePos,
        targetPos,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      });
      const choices = relationshipChoicesForDirection(direction);

      setPendingConnection(connection);
      setConnectionDirection(direction);
      setInferredChoices(choices);
      setShowRelationshipPicker(true);
    },
    [getNodes],
  );

  const cancelRelationshipPicker = useCallback(() => {
    setPendingConnection(null);
    setConnectionDirection(null);
    setInferredChoices(null);
    setEditingEdge(null);
    setShowRelationshipPicker(false);
  }, []);

  const confirmEditEdge = useCallback(
    async (relationshipType: RelationshipType) => {
      if (!editingEdge || !circleId) {
        cancelRelationshipPicker();
        return;
      }
      try {
        await applyEdgeUpdates([
          { edgeId: editingEdge.id, relationship_type: relationshipType },
        ]);
      } catch {
        toast({
          title: "Could not update relationship",
          variant: "destructive",
        });
      } finally {
        cancelRelationshipPicker();
      }
    },
    [editingEdge, circleId, applyEdgeUpdates, cancelRelationshipPicker, toast],
  );

  const confirmConnection = useCallback(
    async (relationshipType: RelationshipType) => {
      if (!pendingConnection?.source || !pendingConnection?.target || !circleId) {
        cancelRelationshipPicker();
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
        cancelRelationshipPicker();
      }
    },
    [pendingConnection, circleId, persistViaApi, cancelRelationshipPicker, setEdges, nodes, toast],
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

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (event, edge) => {
      if (!circleId) return;
      const row = treeEdgeRows.find((r) => r.id === edge.id);
      if (!row) return;
      event.preventDefault();
      setEdgeContextMenu(null);
      setNodeContextMenu(null);
      setPendingConnection(null);
      setConnectionDirection(null);
      setInferredChoices(null);
      setEditingEdge(row);
      setShowRelationshipPicker(true);
    },
    [circleId, treeEdgeRows],
  );

  const openEdgeEditor = useCallback(
    (edgeId: string) => {
      const row = treeEdgeRows.find((r) => r.id === edgeId);
      if (!row) return;
      setEditingEdge(row);
      setShowRelationshipPicker(true);
    },
    [treeEdgeRows],
  );

  const onNodeContextMenu: NodeMouseHandler<Node<FamilyTreeNodeData>> = useCallback((event, node) => {
    if (node.data.kind !== "person") return;
    event.preventDefault();
    setEdgeContextMenu(null);
    setNodeContextMenu({ x: event.clientX, y: event.clientY, personId: node.id });
  }, []);

  const onPaneClick = useCallback(() => {
    setEdgeContextMenu(null);
    setNodeContextMenu(null);
    setEditingEdge(null);
  }, []);

  const handleAutoLayout = useCallback(
    (direction: LayoutDirection) => {
      const laid = autoLayoutTree(
        nodes,
        edges,
        direction,
        treeLeaderId,
        people,
      ) as Node<FamilyTreeNodeData>[];
      setNodes(laid);
      if (circleId) {
        for (const n of laid) {
          if (!isPersonFlowNodeType(n.type)) continue;
          void savePersonCanvasPosition({
            circleId,
            personId: n.id,
            x: n.position.x,
            y: n.position.y,
            useApi: persistViaApi,
          });
        }
      }
      window.requestAnimationFrame(() => {
        if (treeLeaderId) {
          void fitView({ padding: 0.22, duration: 350, nodes: [{ id: treeLeaderId }] });
        } else {
          void fitView({ padding: 0.18, duration: 350 });
        }
      });
    },
    [nodes, edges, setNodes, circleId, persistViaApi, fitView, treeLeaderId, people],
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node<FamilyTreeNodeData>) => {
      const currentNodes = getNodes();
      groupStateRef.current = syncGroupStateFromNodes(currentNodes);

      // Dragging a group moves children with it — refresh edges and persist all member positions.
      if (node.type === "group") {
        const nodesById = new Map(currentNodes.map((n) => [n.id, n]));
        const members = currentNodes.filter(
          (n) => n.parentId === node.id && isPersonFlowNodeType(n.type),
        );

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

  const onNodeDoubleClick: NodeMouseHandler<Node<FamilyTreeNodeData>> = useCallback(
    (event, node) => {
      if (node.data.kind !== "person") return;
      event.preventDefault();
      const slug =
        node.data.memoirSlug?.trim() ?? memoirSlugByPersonId.get(node.data.personId);
      if (slug && onOpenMemoir) {
        onOpenMemoir(slug, node.data.personId);
      }
    },
    [memoirSlugByPersonId, onOpenMemoir],
  );

  const canvasHeight = fullscreen
    ? "100vh"
    : layout === "fullViewport"
      ? `calc(100vh - ${TREE_HEADER_HEIGHT}px)`
      : "calc(100vh - 220px)";

  const showConnectHint = people.length > 0 && flowSnapshot.personEdgeCount === 0;

  const pickerSourceName = editingEdge
    ? (personNameById.get(editingEdge.source_person_id) ?? "Person")
    : pendingConnection?.source
      ? (personNameById.get(pendingConnection.source) ?? "Person")
      : "";
  const pickerTargetName = editingEdge
    ? (personNameById.get(editingEdge.target_person_id) ?? "Person")
    : pendingConnection?.target
      ? (personNameById.get(pendingConnection.target) ?? "Person")
      : "";

  const selectedPersonCount = nodes.filter(
    (n) => n.selected && isPersonFlowNodeType(n.type),
  ).length;
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
        onNodeDragStart={onNodeDragStart}
        onConnectStart={() => setIsConnecting(true)}
        onConnectEnd={() => setIsConnecting(false)}
        connectionRadius={50}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgeClick={onEdgeClick}
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
          // fitView is called via the nodes-populated effect below
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2.5}
        style={{ width: "100vw", height: canvasHeight }}
        className={isConnecting ? "family-tree-flow connecting" : "family-tree-flow"}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={40}
          size={1}
          color={isLight ? "#d4d3cb" : "#1a1a1a"}
        />
        <TreeFlowControls
          onFullscreenChange={onFullscreenChange}
          onAutoLayout={circleId ? handleAutoLayout : undefined}
        />
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
          onEdit={() => {
            openEdgeEditor(edgeContextMenu.edgeId);
            setEdgeContextMenu(null);
          }}
          onRemove={() => void disconnectEdge(edgeContextMenu.edgeId)}
          onClose={() => setEdgeContextMenu(null)}
        />
      ) : null}

      {nodeContextMenu ? (
        <TreeNodeContextMenu
          x={nodeContextMenu.x}
          y={nodeContextMenu.y}
          displayName={
            peopleWithPortraits.find((p) => p.id === nodeContextMenu.personId)?.display_name ??
            "Person"
          }
          gender={peopleWithPortraits.find((p) => p.id === nodeContextMenu.personId)?.gender}
          careerPath={
            peopleWithPortraits.find((p) => p.id === nodeContextMenu.personId)?.career_path
          }
          isTreeLeader={nodeContextMenu.personId === treeLeaderId}
          onSetTreeLeader={
            circleId ? () => void handleSetTreeLeader(nodeContextMenu.personId) : undefined
          }
          onGenderChange={(g) => void handleGenderChange(nodeContextMenu.personId, g)}
          onCareerSave={(c) => void handleCareerSave(nodeContextMenu.personId, c)}
          onPhotoSelected={(file) => void handlePhotoUpload(nodeContextMenu.personId, file)}
          onDuplicate={() => void handleDuplicatePerson(nodeContextMenu.personId)}
          onDisconnect={() => setPendingDisconnectPersonId(nodeContextMenu.personId)}
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

      <TreeAltDragHint />

      <Dialog open={Boolean(pendingDisconnectPersonId)} onOpenChange={(o) => !o && setPendingDisconnectPersonId(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove all connections?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Remove all connections for{" "}
              {pendingDisconnectPersonId
                ? (personNameById.get(pendingDisconnectPersonId) ?? "this person")
                : "this person"}
              ? The node will stay on the canvas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPendingDisconnectPersonId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDisconnectPersonId) {
                  void disconnectAllEdgesForPerson(pendingDisconnectPersonId);
                }
                setPendingDisconnectPersonId(null);
              }}
            >
              Remove connections
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RelationshipPickerModal
        open={showRelationshipPicker}
        mode={editingEdge ? "edit" : "create"}
        currentRelationshipType={editingEdge?.relationship_type}
        sourceName={pickerSourceName}
        targetName={pickerTargetName}
        connectionDirection={editingEdge ? null : connectionDirection}
        inferredChoices={editingEdge ? null : inferredChoices}
        onConfirm={(type) =>
          void (editingEdge ? confirmEditEdge(type) : confirmConnection(type))
        }
        onCancel={cancelRelationshipPicker}
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
