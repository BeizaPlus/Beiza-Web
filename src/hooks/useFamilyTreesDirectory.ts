import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export type PublicCircleCover = {
  id: string;
  name: string;
  member_count: number;
  memory_count: number;
  since_year: number | null;
  is_in_memoriam: boolean;
};

export function usePublicFamilyCircles() {
  return useQuery({
    queryKey: ["family-trees", "directory"],
    queryFn: async () => {
      const { data, error } = await supabase!.rpc("list_public_family_circles");
      if (error) throw error;
      return (data ?? []) as PublicCircleCover[];
    },
    enabled: Boolean(supabase),
  });
}

export function usePublicCircleCover(circleId?: string) {
  return useQuery({
    queryKey: ["family-trees", "cover", circleId],
    queryFn: async () => {
      const { data, error } = await supabase!.rpc("get_public_circle_cover", {
        p_circle_id: circleId,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row as PublicCircleCover | undefined;
    },
    enabled: Boolean(supabase && circleId),
  });
}

export type CircleTreePayload = {
  circle: {
    id: string;
    name: string;
    access_code?: string;
    access_code_hint?: string | null;
    since_year?: number | null;
    is_in_memoriam?: boolean;
  };
  people: import("@/lib/legacy/types").FamilyPerson[];
  recordings: import("@/lib/legacy/types").LegacyRecording[];
  links: import("@/lib/legacy/types").RecordingPersonLink[];
  memberCount: number;
  memoryCount: number;
};

export async function fetchCircleTreeData(
  circleId: string,
  token: string,
): Promise<CircleTreePayload> {
  const res = await fetch(`/api/circle/tree-data?circle_id=${encodeURIComponent(circleId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not load this circle.");
  }
  return res.json() as Promise<CircleTreePayload>;
}

export async function verifyCircleAccessCode(
  circleId: string,
  code: string,
  email?: string,
): Promise<{ valid: boolean; token?: string }> {
  const res = await fetch("/api/circle/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ circle_id: circleId, code, email }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    valid: boolean;
    token?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body.error ?? `Verification failed (${res.status}).`);
  }
  return body;
}
