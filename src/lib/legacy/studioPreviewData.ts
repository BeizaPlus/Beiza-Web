import type { FamilyCircle, FamilyMember, FamilyPerson, LegacyRecording } from "@/lib/legacy/types";
import type { RelationshipType, TreeEdgeRow } from "@/lib/legacy/treeRelationships";

export const STUDIO_MOCK_CIRCLE_ID = "00000000-0000-4000-8000-000000000001";

export const STUDIO_MOCK_CIRCLE: FamilyCircle = {
  id: STUDIO_MOCK_CIRCLE_ID,
  name: "Studio Preview Circle",
  invite_code: "STU-DIO-PRE",
  access_code: "STUDIO",
  created_by: null,
  created_at: new Date(0).toISOString(),
};

export const STUDIO_MOCK_MEMBER: FamilyMember = {
  id: "00000000-0000-4000-8000-000000000002",
  circle_id: STUDIO_MOCK_CIRCLE_ID,
  user_id: "00000000-0000-4000-8000-000000000099",
  role: "keeper",
  display_name: "Studio Editor",
  joined_at: new Date(0).toISOString(),
};

const now = new Date().toISOString();

export const STUDIO_MOCK_PEOPLE: FamilyPerson[] = [
  {
    id: "00000000-0000-4000-8000-000000000010",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    display_name: "Kwabena Oppong Steven",
    photo_url: null,
    relation_label: "SIBLING",
    gender: "male",
    status: "living",
    user_id: null,
    member_id: null,
    parent_id: null,
    is_tree_anchor: true,
    canvas_x: null,
    canvas_y: null,
    created_by: null,
    created_at: now,
  },
  {
    id: "00000000-0000-4000-8000-000000000011",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    display_name: "Parent",
    photo_url: null,
    relation_label: "PARENT",
    gender: "female",
    status: "living",
    user_id: null,
    member_id: null,
    parent_id: "00000000-0000-4000-8000-000000000010",
    is_tree_anchor: false,
    canvas_x: null,
    canvas_y: null,
    created_by: null,
    created_at: now,
  },
];

export const STUDIO_MOCK_RECORDINGS: LegacyRecording[] = [
  {
    id: "00000000-0000-4000-8000-000000000020",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    recorded_by: STUDIO_MOCK_MEMBER.user_id,
    prompt: "What's your earliest memory of your mother's cooking?",
    audio_url: null,
    duration_seconds: 62,
    title: "Eno Mansa",
    created_at: "2026-05-19T12:00:00.000Z",
    prompt_category: "open",
    prompt_arc_position: "roots",
  },
  {
    id: "00000000-0000-4000-8000-000000000021",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    recorded_by: STUDIO_MOCK_MEMBER.user_id,
    prompt: "Tell us about the home you grew up in.",
    audio_url: null,
    duration_seconds: 48,
    title: "Untitled memory",
    created_at: "2026-05-18T10:30:00.000Z",
    prompt_category: "open",
    prompt_arc_position: "roots",
  },
  {
    id: "00000000-0000-4000-8000-000000000022",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    recorded_by: STUDIO_MOCK_MEMBER.user_id,
    prompt: "What did faith mean in your household?",
    audio_url: null,
    duration_seconds: 91,
    title: "Sunday mornings",
    created_at: "2026-05-17T16:00:00.000Z",
    prompt_category: "open",
    prompt_arc_position: "middle",
  },
  {
    id: "00000000-0000-4000-8000-000000000023",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    recorded_by: STUDIO_MOCK_MEMBER.user_id,
    prompt: "What advice would you give the next generation?",
    audio_url: null,
    duration_seconds: 55,
    title: "For the children",
    created_at: "2026-05-16T09:00:00.000Z",
    prompt_category: "open",
    prompt_arc_position: "crown",
  },
  {
    id: "00000000-0000-4000-8000-000000000024",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    recorded_by: STUDIO_MOCK_MEMBER.user_id,
    prompt: "What is the story behind your name?",
    audio_url: null,
    duration_seconds: 38,
    title: "Kwabena's name",
    created_at: "2026-05-15T14:20:00.000Z",
    prompt_category: "open",
    prompt_arc_position: "roots",
  },
  {
    id: "00000000-0000-4000-8000-000000000025",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    recorded_by: STUDIO_MOCK_MEMBER.user_id,
    prompt: "What song takes you back home?",
    audio_url: null,
    duration_seconds: 44,
    title: "Highlife on Sunday",
    created_at: "2026-05-14T11:00:00.000Z",
    prompt_category: "open",
    prompt_arc_position: "middle",
  },
  {
    id: "00000000-0000-4000-8000-000000000026",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    recorded_by: STUDIO_MOCK_MEMBER.user_id,
    prompt: "Tell us about a family reunion.",
    audio_url: null,
    duration_seconds: 72,
    title: "Accra gathering '19",
    created_at: "2026-05-13T18:30:00.000Z",
    prompt_category: "open",
    prompt_arc_position: "middle",
  },
  {
    id: "00000000-0000-4000-8000-000000000027",
    circle_id: STUDIO_MOCK_CIRCLE_ID,
    recorded_by: STUDIO_MOCK_MEMBER.user_id,
    prompt: "What did your grandparents teach you?",
    audio_url: null,
    duration_seconds: 58,
    title: "Grandma's kitchen rules",
    created_at: "2026-05-12T08:15:00.000Z",
    prompt_category: "open",
    prompt_arc_position: "roots",
  },
];

export const STUDIO_MOCK_SESSION = {
  access_token: "studio-preview",
  user: { id: STUDIO_MOCK_MEMBER.user_id, email: "studio@beiza.local" },
} as unknown as import("@supabase/supabase-js").Session;

export const STUDIO_MOCK_PROMPT_TEXT =
  "What is the story behind your name, and who gave it to you?";

/** In-memory tree edges for localhost studio preview (no Supabase writes). */
const studioTreeEdgesByCircle = new Map<string, TreeEdgeRow[]>();

export function getStudioTreeEdges(circleId: string): TreeEdgeRow[] {
  return studioTreeEdgesByCircle.get(circleId) ?? [];
}

export function saveStudioTreeEdge(params: {
  circleId: string;
  sourcePersonId: string;
  targetPersonId: string;
  relationshipType: RelationshipType;
}): TreeEdgeRow {
  const { circleId, sourcePersonId, targetPersonId, relationshipType } = params;
  const existing = getStudioTreeEdges(circleId);
  const duplicate = existing.find(
    (row) =>
      row.source_person_id === sourcePersonId && row.target_person_id === targetPersonId,
  );
  if (duplicate) {
    throw new Error("These people are already connected.");
  }

  const row: TreeEdgeRow = {
    id: crypto.randomUUID(),
    circle_id: circleId,
    source_person_id: sourcePersonId,
    target_person_id: targetPersonId,
    relationship_type: relationshipType,
    created_at: new Date().toISOString(),
  };
  studioTreeEdgesByCircle.set(circleId, [...existing, row]);
  return row;
}

export function updateStudioTreeEdge(params: {
  circleId: string;
  edgeId: string;
  relationshipType: RelationshipType;
}): TreeEdgeRow {
  const { circleId, edgeId, relationshipType } = params;
  const existing = getStudioTreeEdges(circleId);
  const index = existing.findIndex((row) => row.id === edgeId);
  if (index < 0) throw new Error("Connection not found.");
  const updated = { ...existing[index]!, relationship_type: relationshipType };
  const next = [...existing];
  next[index] = updated;
  studioTreeEdgesByCircle.set(circleId, next);
  return updated;
}

export function deleteStudioTreeEdge(circleId: string, edgeId: string): void {
  const existing = getStudioTreeEdges(circleId);
  studioTreeEdgesByCircle.set(
    circleId,
    existing.filter((row) => row.id !== edgeId),
  );
}

export function resetStudioTreeEdges(circleId?: string): void {
  if (circleId) {
    studioTreeEdgesByCircle.delete(circleId);
    return;
  }
  studioTreeEdgesByCircle.clear();
}
