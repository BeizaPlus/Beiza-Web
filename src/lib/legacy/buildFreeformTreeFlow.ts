import type { Edge, Node } from "@xyflow/react";
import { format } from "date-fns";
import type { FamilyPerson, LegacyRecording, RecordingPersonLink } from "@/lib/legacy/types";
import { countMemoriesForPerson, personInitials } from "@/lib/legacy/familyTree";
import {
  formatRelationship,
  PERSON_EDGE_STYLE,
  type TreeEdgeRow,
} from "@/lib/legacy/treeRelationships";
import { defaultTreeHandles, pickTreeEdgeHandles } from "@/lib/legacy/treeEdgeHandles";
import type { FamilyTreeNodeData, PersonNodeData } from "@/lib/legacy/familyTreeFlow";

const COL_GAP = 240;
const ROW_GAP = 200;

function defaultPosition(index: number, total: number): { x: number; y: number } {
  const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
  const row = Math.floor(index / cols);
  const col = index % cols;
  return { x: col * COL_GAP, y: row * ROW_GAP };
}

function recorderName(
  recordedBy: string,
  people: FamilyPerson[],
  memberNames: Map<string, string>,
) {
  const person = people.find((p) => p.user_id === recordedBy);
  if (person) return person.display_name;
  return memberNames.get(recordedBy) ?? "Family member";
}

export function treeEdgesToFlowEdges(
  rows: TreeEdgeRow[],
  positionsByNodeId?: Map<string, { x: number; y: number }>,
): Edge[] {
  return rows.map((row) => {
    const sourcePos = positionsByNodeId?.get(row.source_person_id);
    const targetPos = positionsByNodeId?.get(row.target_person_id);
    const handles =
      sourcePos && targetPos
        ? pickTreeEdgeHandles(sourcePos, targetPos)
        : defaultTreeHandles();

    return {
      id: row.id,
      source: row.source_person_id,
      target: row.target_person_id,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      label: formatRelationship(row.relationship_type),
      type: "smoothstep",
      style: PERSON_EDGE_STYLE,
      labelStyle: { fill: "#888888", fontSize: 10 },
      labelBgStyle: { fill: "#111111", fillOpacity: 0.9 },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
      animated: false,
      interactionWidth: 20,
    };
  });
}

export function buildFreeformTreeFlow(params: {
  people: FamilyPerson[];
  treeEdges: TreeEdgeRow[];
  links: RecordingPersonLink[];
  recordings: LegacyRecording[];
  selectedPersonId?: string | null;
  memberNames?: Map<string, string>;
  includeMemories?: boolean;
}): { nodes: Node<FamilyTreeNodeData>[]; edges: Edge[]; personEdgeCount: number } {
  const {
    people,
    treeEdges,
    links,
    recordings,
    selectedPersonId,
    memberNames = new Map(),
    includeMemories = false,
  } = params;

  const nodes: Node<FamilyTreeNodeData>[] = [];
  const positionMap = new Map<string, { x: number; y: number }>();
  const edges: Edge[] = [];

  if (people.length === 0) {
    return { nodes, edges, personEdgeCount: treeEdges.length };
  }

  const recordingById = new Map(recordings.map((r) => [r.id, r]));
  const aboutByPerson = new Map<string, RecordingPersonLink[]>();
  for (const link of links) {
    if (link.link_type !== "about") continue;
    const list = aboutByPerson.get(link.person_id) ?? [];
    list.push(link);
    aboutByPerson.set(link.person_id, list);
  }

  people.forEach((person, index) => {
    const hasCanvas =
      person.canvas_x != null &&
      person.canvas_y != null &&
      Number.isFinite(person.canvas_x) &&
      Number.isFinite(person.canvas_y);
    const position = hasCanvas
      ? { x: person.canvas_x!, y: person.canvas_y! }
      : defaultPosition(index, people.length);
    positionMap.set(person.id, position);

    const memoryCount = countMemoriesForPerson(person.id, links);
    nodes.push({
      id: person.id,
      type: "person",
      position,
      draggable: true,
      data: {
        kind: "person",
        personId: person.id,
        name: person.display_name,
        relation: (person.relation_label ?? "").toUpperCase(),
        gender: person.gender ?? null,
        careerPath: person.career_path ?? null,
        status: person.status,
        initials: personInitials(person.display_name),
        memoryCount,
        photoUrl: person.photo_url ?? null,
        selected: selectedPersonId === person.id,
      } satisfies PersonNodeData,
    });

    if (includeMemories) {
      const personLinks = aboutByPerson.get(person.id) ?? [];
      personLinks.forEach((plink, memIndex) => {
        const rec = recordingById.get(plink.recording_id);
        if (!rec) return;
        const memoryId = `memory-${rec.id}`;
        nodes.push({
          id: memoryId,
          type: "memory",
          position: { x: position.x + 260, y: position.y + memIndex * 130 },
          draggable: false,
          selectable: false,
          data: {
            kind: "memory",
            recordingId: rec.id,
            prompt: rec.prompt,
            durationSeconds: rec.duration_seconds,
            recordedAt: format(new Date(rec.created_at), "MMM d, yyyy"),
            recordedByName: recorderName(rec.recorded_by, people, memberNames),
          },
        });
        edges.push({
          id: `e-mem-${person.id}-${memoryId}`,
          source: person.id,
          target: memoryId,
          style: { stroke: "#3a2800", strokeWidth: 1 },
          animated: true,
        });
      });
    }
  });

  edges.push(...treeEdgesToFlowEdges(treeEdges, positionMap));

  return { nodes, edges, personEdgeCount: treeEdges.length };
}
