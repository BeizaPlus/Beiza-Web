import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FamilyPerson, LegacyRecording, RecordingPersonLink } from "@/lib/legacy/types";
import {
  buildFamilyTreeFlow,
  type FamilyTreeNodeData,
  type PlaceholderNodeData,
} from "@/lib/legacy/familyTreeFlow";
import { filterValidTreeEdges, filterValidTreeNodes } from "@/lib/legacy/filterTreeNodes";
import { PersonFlowNode } from "@/components/legacy/family-tree/flow/PersonFlowNode";
import { MemoryFlowNode } from "@/components/legacy/family-tree/flow/MemoryFlowNode";
import { PlaceholderFlowNode } from "@/components/legacy/family-tree/flow/PlaceholderFlowNode";
import { AddPersonSheet } from "@/components/legacy/family-tree/AddPersonSheet";
import { TreeFlowControls } from "@/components/legacy/family-tree/TreeFlowControls";
import { resolveTreeAnchor } from "@/lib/legacy/familyTree";
import { usePortraitPool, portraitForPerson } from "@/hooks/usePortraitPool";
import { TREE_HEADER_HEIGHT } from "@/components/family-trees/TreeAppShell";

const nodeTypes = {
  person: PersonFlowNode,
  memory: MemoryFlowNode,
  placeholder: PlaceholderFlowNode,
};

type FamilyTreeCanvasProps = {
  people: FamilyPerson[];
  links: RecordingPersonLink[];
  recordings?: LegacyRecording[];
  circleId?: string;
  selectedPersonId: string | null;
  onSelectPerson: (personId: string) => void;
  layout?: "fullViewport" | "embedded";
  className?: string;
  fullscreen?: boolean;
  onFullscreenChange?: (active: boolean) => void;
};

function FamilyTreeCanvasInner({
  people,
  links,
  recordings = [],
  circleId,
  selectedPersonId,
  onSelectPerson,
  layout = "fullViewport",
  fullscreen = false,
  onFullscreenChange,
}: FamilyTreeCanvasProps) {
  const { fitView } = useReactFlow();
  const [addOpen, setAddOpen] = useState(false);
  const [addSlot, setAddSlot] = useState<PlaceholderNodeData["slot"]>("child");

  const anchorId = useMemo(() => {
    const counts = new Map(people.map((p) => [p.id, links.filter((l) => l.person_id === p.id).length]));
    return resolveTreeAnchor(people, counts);
  }, [people, links]);

  const { data: portraitPool = [] } = usePortraitPool();

  const peopleWithPortraits = useMemo(
    () =>
      people.map((p) => ({
        ...p,
        photo_url: portraitForPerson(p.id, p.photo_url, portraitPool) ?? p.photo_url,
      })),
    [people, portraitPool],
  );

  const { nodes, edges } = useMemo(() => {
    const built = buildFamilyTreeFlow({
      people: peopleWithPortraits,
      links,
      recordings,
      selectedPersonId,
    });
    const validNodes = filterValidTreeNodes(built.nodes);
    return {
      nodes: validNodes,
      edges: filterValidTreeEdges(built.edges, validNodes),
    };
  }, [peopleWithPortraits, links, recordings, selectedPersonId]);

  const onNodeClick: NodeMouseHandler<Node<FamilyTreeNodeData>> = useCallback(
    (_, node) => {
      const data = node.data;
      if (data.kind === "person") {
        onSelectPerson(data.personId);
        return;
      }
      if (data.kind === "placeholder" && circleId) {
        setAddSlot(data.slot);
        setAddOpen(true);
      }
    },
    [circleId, onSelectPerson],
  );

  const canvasHeight = fullscreen
    ? "100vh"
    : layout === "fullViewport"
      ? `calc(100vh - ${TREE_HEADER_HEIGHT}px)`
      : "calc(100vh - 220px)";

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onInit={() => {
          window.requestAnimationFrame(() => {
            void fitView({ padding: 0.2, duration: 200 });
          });
        }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={2.5}
        style={{
          width: "100vw",
          height: canvasHeight,
        }}
        className="family-tree-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={40} size={1} color="#1a1a1a" />
        <TreeFlowControls onFullscreenChange={onFullscreenChange} />
      </ReactFlow>

      {circleId ? (
        <AddPersonSheet
          open={addOpen}
          onOpenChange={setAddOpen}
          circleId={circleId}
          slot={addSlot}
          parentId={addSlot === "child" ? anchorId : undefined}
        />
      ) : null}
    </>
  );
}

export function FamilyTreeCanvas(props: FamilyTreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
