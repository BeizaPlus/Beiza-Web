import type { Edge, Node } from "@xyflow/react";
import { format } from "date-fns";
import type { FamilyPerson, LegacyRecording, RecordingPersonLink } from "@/lib/legacy/types";
import { countMemoriesForPerson, personInitials, resolveTreeAnchor } from "@/lib/legacy/familyTree";

export type PersonNodeData = {
  kind: "person";
  personId: string;
  name: string;
  relation: string;
  status: FamilyPerson["status"];
  initials: string;
  memoryCount: number;
  photoUrl?: string | null;
  selected?: boolean;
};

export type MemoryNodeData = {
  kind: "memory";
  recordingId: string;
  prompt: string;
  durationSeconds: number;
  recordedAt: string;
  recordedByName: string;
};

export type PlaceholderNodeData = {
  kind: "placeholder";
  slot: "parent" | "child";
  label: string;
};

export type FamilyTreeNodeData = PersonNodeData | MemoryNodeData | PlaceholderNodeData;

const PERSON_W = 180;
const MEMORY_OFFSET_X = 260;
const ROW_GAP = 300;
const COL_GAP = 240;

function confirmedMembers(people: FamilyPerson[]) {
  return people.filter((p) => p.status !== "invited" || p.user_id);
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

export function buildFamilyTreeFlow(params: {
  people: FamilyPerson[];
  links: RecordingPersonLink[];
  recordings: LegacyRecording[];
  selectedPersonId?: string | null;
  memberNames?: Map<string, string>;
}): { nodes: Node<FamilyTreeNodeData>[]; edges: Edge[] } {
  const { people, links, recordings, selectedPersonId, memberNames = new Map() } = params;
  const nodes: Node<FamilyTreeNodeData>[] = [];
  const edges: Edge[] = [];

  if (people.length === 0) {
    return { nodes, edges };
  }

  const recordingById = new Map(recordings.map((r) => [r.id, r]));
  const aboutByPerson = new Map<string, RecordingPersonLink[]>();
  for (const link of links) {
    if (link.link_type !== "about") continue;
    const list = aboutByPerson.get(link.person_id) ?? [];
    list.push(link);
    aboutByPerson.set(link.person_id, list);
  }

  const addPersonNode = (person: FamilyPerson, x: number, y: number) => {
    const memoryCount = countMemoriesForPerson(person.id, links);
    nodes.push({
      id: person.id,
      type: "person",
      position: { x, y },
      data: {
        kind: "person",
        personId: person.id,
        name: person.display_name,
        relation: (person.relation_label ?? "").toUpperCase(),
        status: person.status,
        initials: personInitials(person.display_name),
        memoryCount,
        photoUrl: person.photo_url ?? null,
        selected: selectedPersonId === person.id,
      },
    });
    return person.id;
  };

  const addMemoriesForPerson = (personId: string, baseX: number, baseY: number) => {
    const personLinks = aboutByPerson.get(personId) ?? [];
    personLinks.forEach((link, index) => {
      const rec = recordingById.get(link.recording_id);
      if (!rec) return;
      const memoryId = `memory-${rec.id}`;
      nodes.push({
        id: memoryId,
        type: "memory",
        position: { x: baseX + MEMORY_OFFSET_X, y: baseY + index * 130 },
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
        id: `e-${personId}-${memoryId}`,
        source: personId,
        target: memoryId,
        style: { stroke: "#3a2800", strokeWidth: 1 },
        animated: true,
      });
    });
  };

  const addPlaceholder = (id: string, slot: PlaceholderNodeData["slot"], label: string, x: number, y: number) => {
    nodes.push({
      id,
      type: "placeholder",
      position: { x, y },
      data: { kind: "placeholder", slot, label },
    });
  };

  const confirmed = confirmedMembers(people);
  const soloCreator = confirmed.length <= 1 && people.length <= 1;

  if (soloCreator) {
    const center = people[0]!;
    const cx = -PERSON_W / 2;
    addPersonNode(center, cx, 0);
    addMemoriesForPerson(center.id, cx, 0);

    addPlaceholder("ph-left", "parent", "Add parent →", -COL_GAP - 80, -ROW_GAP);
    addPlaceholder("ph-right", "parent", "Add parent →", COL_GAP - 80, -ROW_GAP);
    addPlaceholder("ch-left", "child", "Add family member →", -COL_GAP - 80, ROW_GAP);
    addPlaceholder("ch-right", "child", "Add family member →", COL_GAP - 80, ROW_GAP);

    edges.push(
      {
        id: "e-ph-left",
        source: "ph-left",
        target: center.id,
        style: { stroke: "#1e1e1e", strokeDasharray: "4 3" },
      },
      {
        id: "e-ph-right",
        source: "ph-right",
        target: center.id,
        style: { stroke: "#1e1e1e", strokeDasharray: "4 3" },
      },
      {
        id: "e-ch-left",
        source: center.id,
        target: "ch-left",
        style: { stroke: "#1e1e1e", strokeDasharray: "4 3" },
      },
      {
        id: "e-ch-right",
        source: center.id,
        target: "ch-right",
        style: { stroke: "#1e1e1e", strokeDasharray: "4 3" },
      },
    );

    return { nodes, edges };
  }

  const anchorId = resolveTreeAnchor(
    people,
    new Map(people.map((p) => [p.id, countMemoriesForPerson(p.id, links)])),
  );
  const anchor = people.find((p) => p.id === anchorId) ?? people[0]!;
  const byParent = new Map<string | null, FamilyPerson[]>();
  for (const p of people) {
    const key = p.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(p);
  }

  const positioned = new Set<string>();
  const placeSubtree = (person: FamilyPerson, x: number, y: number) => {
    if (positioned.has(person.id)) return;
    positioned.add(person.id);
    addPersonNode(person, x, y);
    addMemoriesForPerson(person.id, x, y);

    const children = byParent.get(person.id) ?? [];
    const childCount = children.length;
    children.forEach((child, i) => {
      const offset = (i - (childCount - 1) / 2) * COL_GAP;
      placeSubtree(child, x + offset, y + ROW_GAP);
      edges.push({
        id: `e-${person.id}-${child.id}`,
        source: person.id,
        target: child.id,
        style: { stroke: "#1e1e1e", strokeWidth: 1 },
      });
    });
  };

  placeSubtree(anchor, -PERSON_W / 2, 0);

  const parent = anchor.parent_id ? people.find((p) => p.id === anchor.parent_id) : null;
  if (parent && !positioned.has(parent.id)) {
    addPersonNode(parent, -PERSON_W / 2, -ROW_GAP);
    addMemoriesForPerson(parent.id, -PERSON_W / 2, -ROW_GAP);
    edges.push({
      id: `e-${parent.id}-${anchor.id}`,
      source: parent.id,
      target: anchor.id,
      style: { stroke: "#1e1e1e", strokeWidth: 1 },
    });
    positioned.add(parent.id);
  }

  let orphanX = COL_GAP * 2;
  for (const p of people) {
    if (positioned.has(p.id)) continue;
    placeSubtree(p, orphanX, 0);
    orphanX += COL_GAP;
  }

  return { nodes, edges };
}
