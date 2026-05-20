import { getStoredCircleToken } from "@/lib/circleAccess";
import type { HealthConditionCategory, PersonHealthCondition } from "@/lib/legacy/types";

function authHeaders(circleId: string) {
  const token = getStoredCircleToken(circleId);
  if (!token) throw new Error("Session expired. Enter your access code again.");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function fetchPersonHealth(
  circleId: string,
  personId?: string,
): Promise<PersonHealthCondition[]> {
  const q = new URLSearchParams({ circle_id: circleId });
  if (personId) q.set("person_id", personId);
  const res = await fetch(`/api/circle/person-health?${q}`, { headers: authHeaders(circleId) });
  if (res.status === 503) return [];
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not load health data.");
  }
  const data = (await res.json()) as { conditions: PersonHealthCondition[] };
  return data.conditions ?? [];
}

export async function upsertPersonHealthCondition(
  circleId: string,
  input: {
    person_id: string;
    category: HealthConditionCategory;
    condition: string;
    age_of_onset?: number | null;
    still_active?: boolean;
  },
): Promise<PersonHealthCondition> {
  const res = await fetch("/api/circle/person-health", {
    method: "POST",
    headers: authHeaders(circleId),
    body: JSON.stringify({ circle_id: circleId, ...input }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not save condition.");
  }
  const data = (await res.json()) as { condition: PersonHealthCondition };
  return data.condition;
}

export async function deletePersonHealthCondition(circleId: string, id: string) {
  const q = new URLSearchParams({ circle_id: circleId, id });
  const res = await fetch(`/api/circle/person-health?${q}`, {
    method: "DELETE",
    headers: authHeaders(circleId),
  });
  if (!res.ok) throw new Error("Could not remove condition.");
}

export async function fetchHealthPatterns(circleId: string) {
  const res = await fetch("/api/circle/health-patterns", {
    method: "POST",
    headers: authHeaders(circleId),
    body: JSON.stringify({ circle_id: circleId }),
  });
  if (res.status === 503) {
    return {
      unlocked: false,
      message: "Health patterns are temporarily unavailable.",
      patterns: [],
    };
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not analyze patterns.");
  }
  return res.json() as Promise<{
    unlocked: boolean;
    message?: string;
    patterns: import("@/lib/legacy/types").HealthPatternInsight[];
    member_count_with_health?: number;
  }>;
}
