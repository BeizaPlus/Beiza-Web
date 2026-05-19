export type LegacyMemberRole = "keeper" | "member";

export interface FamilyCircle {
  id: string;
  name: string;
  invite_code: string;
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
}

export type RecordPhase = "prepare" | "recording" | "upload" | "seal";
