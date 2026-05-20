export type LegacyMemberRole = "keeper" | "member";

export interface FamilyCircle {
  id: string;
  name: string;
  invite_code: string;
  access_code?: string;
  access_code_hint?: string | null;
  since_year?: number | null;
  is_in_memoriam?: boolean;
  adinkra_id?: string | null;
  created_by: string | null;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: LegacyMemberRole;
  display_name: string | null;
  joined_at: string;
}

export interface LegacyRecording {
  id: string;
  circle_id: string;
  recorded_by: string;
  prompt: string;
  audio_url: string | null;
  duration_seconds: number;
  title: string | null;
  created_at: string;
  prompt_id?: string | null;
  prompt_category?: string | null;
  prompt_arc_position?: string | null;
  prompt_tags?: string[] | null;
  share_token?: string | null;
}

export type RecordPhase = "prepare" | "recording" | "upload" | "tag" | "seal";

export type FamilyPersonStatus = "living" | "gone" | "invited";

export type FamilyPersonGender = "male" | "female";

export type RecordingPersonLinkType = "about" | "by";

export interface FamilyPerson {
  id: string;
  circle_id: string;
  display_name: string;
  photo_url?: string | null;
  relation_label: string | null;
  gender?: FamilyPersonGender | null;
  career_path?: string | null;
  birthplace?: string | null;
  education?: string | null;
  languages?: string[] | null;
  religion?: string | null;
  bio?: string | null;
  nickname?: string | null;
  birth_year?: number | null;
  /** 1 = eldest among siblings (same parent_id). Drives auto-layout sibling order. */
  sibling_order?: number | null;
  death_year?: number | null;
  adinkra_id?: string | null;
  status: FamilyPersonStatus;
  user_id: string | null;
  member_id: string | null;
  parent_id: string | null;
  is_tree_anchor: boolean;
  canvas_x?: number | null;
  canvas_y?: number | null;
  created_by: string | null;
  created_at: string;
}

/** Profile fields editable from tree UI — patterns dataset building blocks. */
export type FamilyPersonProfilePatch = Partial<{
  display_name: string;
  relation_label: string;
  gender: FamilyPersonGender | null;
  career_path: string | null;
  birthplace: string | null;
  education: string | null;
  languages: string[] | null;
  religion: string | null;
  bio: string | null;
  nickname: string | null;
  birth_year: number | null;
  sibling_order: number | null;
  death_year: number | null;
}>;

export interface RecordingPersonLink {
  id: string;
  recording_id: string;
  person_id: string;
  link_type: RecordingPersonLinkType;
  created_at: string;
}

export interface PersonBiographyFragment {
  recording_id: string;
  audio_url: string | null;
  prompt_text: string;
  prompt_category: string | null;
  arc_position: string | null;
  title: string | null;
  recorded_at: string;
  link_type: RecordingPersonLinkType;
  recorded_by: { name: string; relation: string | null };
}

export type MemoryAboutChoice =
  | { type: "self" }
  | { type: "person"; personId: string }
  | { type: "new"; name: string };
