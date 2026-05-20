import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  circleSessionFailure,
  unwrapCircleSession,
  verifyCircleSession,
} from "../../../api/lib/verifyCircleSession.js";

type ConditionRow = {
  person_id: string;
  category: string;
  condition: string;
  still_active: boolean;
};

type PersonRow = {
  id: string;
  display_name: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
    circle_id?: string;
  };
  const circleId = body.circle_id?.trim();
  if (!circleId) return res.status(400).json({ error: "circle_id is required." });

  const session = await verifyCircleSession(req, circleId);
  const authFail = circleSessionFailure(session);
  if (authFail) return res.status(authFail.status).json({ error: authFail.error });
  const { supabase } = unwrapCircleSession(session);

  const { data: people } = await supabase
    .from("family_people")
    .select("id, display_name, relation_label, parent_id")
    .eq("circle_id", circleId);

  const { data: conditions, error: condErr } = await supabase
    .from("person_health_conditions")
    .select("person_id, category, condition, still_active")
    .eq("circle_id", circleId);

  if (condErr && !condErr.message.includes("person_health_conditions")) {
    return res.status(500).json({ error: condErr.message });
  }

  const rows = (conditions ?? []) as ConditionRow[];
  const peopleWithHealth = new Set(rows.map((r) => r.person_id));
  if (peopleWithHealth.size < 3) {
    return res.status(200).json({
      unlocked: false,
      message: "Add health notes for at least 3 family members to unlock pattern insights.",
      patterns: [],
    });
  }

  const peopleRows = (people ?? []) as PersonRow[];
  const nameById = new Map(
    peopleRows.map((p) => [String(p.id), p.display_name ?? "Someone"] as const),
  );
  const byCategory = new Map<string, { condition: string; names: string[] }[]>();

  for (const row of rows) {
    if (!row.still_active) continue;
    const key = row.category;
    const list = byCategory.get(key) ?? [];
    const name = nameById.get(row.person_id) ?? "Someone";
    const existing = list.find((e) => e.condition.toLowerCase() === row.condition.toLowerCase());
    if (existing) {
      if (!existing.names.includes(name)) existing.names.push(name);
    } else {
      list.push({ condition: row.condition, names: [name] });
    }
    byCategory.set(key, list);
  }

  const patterns: { title: string; body: string; severity: "info" | "watch" }[] = [];

  for (const [category, items] of byCategory) {
    for (const item of items) {
      if (item.names.length >= 2) {
        const label = category.replace(/_/g, " ");
        patterns.push({
          title: `${label}: ${item.condition}`,
          body: `Seen in ${item.names.length} family members (${item.names.join(", ")}). Consider discussing screening or prevention with your clinician.`,
          severity: item.names.length >= 3 ? "watch" : "info",
        });
      }
    }
  }

  const cardio = rows.filter((r) => r.category === "cardiovascular" && r.still_active);
  if (cardio.length >= 2) {
    const names = [...new Set(cardio.map((r) => nameById.get(r.person_id) ?? "Someone"))];
    patterns.unshift({
      title: "Cardiovascular thread",
      body: `${names.length} relatives have heart or blood pressure conditions recorded. Regular blood pressure screening is worth prioritizing for the next generation.`,
      severity: "watch",
    });
  }

  return res.status(200).json({
    unlocked: true,
    patterns: patterns.slice(0, 12),
    member_count_with_health: peopleWithHealth.size,
  });
}
