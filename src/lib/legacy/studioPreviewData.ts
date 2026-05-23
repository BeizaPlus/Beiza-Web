import type { FamilyCircle, FamilyMember, FamilyPerson, LegacyRecording } from "@/lib/legacy/types";

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
    canvas_x: 0,
    canvas_y: 0,
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
    canvas_x: 0,
    canvas_y: 120,
    created_by: null,
    created_at: now,
  },
];

export const STUDIO_MOCK_RECORDINGS: LegacyRecording[] = [];

export const STUDIO_MOCK_SESSION = {
  access_token: "studio-preview",
  user: { id: STUDIO_MOCK_MEMBER.user_id, email: "studio@beiza.local" },
} as unknown as import("@supabase/supabase-js").Session;

export const STUDIO_MOCK_PROMPT_TEXT =
  "What is the story behind your name, and who gave it to you?";
