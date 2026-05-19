import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
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
import { PersonFlowNode } from "@/components/legacy/family-tree/flow/PersonFlowNode";
import { MemoryFlowNode } from "@/components/legacy/family-tree/flow/MemoryFlowNode";
import { PlaceholderFlowNode } from "@/components/legacy/family-tree/flow/PlaceholderFlowNode";
import { AddPersonSheet } from "@/components/legacy/family-tree/AddPersonSheet";
import { resolveTreeAnchor } from "@/lib/legacy/familyTree";

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
  /** Full viewport height (public /circle tree). Legacy layout uses `embedded`. */
  layout?: "fullViewport" | "embedded";
  className?: string;
};

function FamilyTreeCanvasInner({
  people,
  links,
  recordings = [],
  circleId,
  selectedPersonId,
  onSelectPerson,
  layout = "embedded",
}: FamilyTreeCanvasProps) {
  const { fitView } = useReactFlow();
  const [addOpen, setAddOpen] = useState(false);
  const [addSlot, setAddSlot] = useState<PlaceholderNodeData["slot"]>("child");

  const anchorId = useMemo(() => {
    const counts = new Map(people.map((p) => [p.id, links.filter((l) => l.person_id === p.id).length]));
    return resolveTreeAnchor(people, counts);
  }, [people, links]);

  const { nodes, edges } = useMemo(
    () =>
      buildFamilyTreeFlow({
        people,
        links,
        recordings,
        selectedPersonId,
      }),
    [people, links, recordings, selectedPersonId],
  );

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
        return;
      }
    },
    [circleId, onSelectPerson],
  );

  const heightStyle =
    layout === "fullViewport"
      ? { width: "100%", height: "calc(100vh - 80px)" }
      : { width: "100%", height: "calc(100vh - 220px)", minHeight: 520 };

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
        minZoom={0.2}
        maxZoom={1.5}
        style={heightStyle}
        className="family-tree-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={40} size={1} color="#1a1a1a" />
        <Controls
          showInteractive={false}
          style={{
            background: "#111111",
            border: "0.5px solid #1e1e1e",
            borderRadius: 8,
            padding: 4,
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            const d = node.data as FamilyTreeNodeData;
            if (d.kind === "person") return d.status === "gone" ? "#2a2a2a" : "#E6A817";
            return "#3a2800";
          }}
          maskColor="rgba(0,0,0,0.7)"
          style={{
            background: "#111111",
            border: "0.5px solid #1e1e1e",
            borderRadius: 8,
          }}
        />
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
