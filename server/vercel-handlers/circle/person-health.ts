import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  circleSessionFailure,
  unwrapCircleSession,
  verifyCircleSession,
} from "../../../api/lib/verifyCircleSession.js";

const CATEGORIES = new Set([
  "cardiovascular",
  "metabolic",
  "neurological",
  "mental_health",
  "cancer",
  "autoimmune",
  "respiratory",
  "musculoskeletal",
  "hereditary",
  "addiction",
  "other",
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const circleId = (
    req.method === "GET"
      ? (req.query.circle_id as string)
      : ((typeof req.body === "string" ? JSON.parse(req.body) : req.body) as { circle_id?: string })
          .circle_id
  )?.trim();

  if (!circleId) return res.status(400).json({ error: "circle_id is required." });

  const session = await verifyCircleSession(req, circleId);
  const authFail = circleSessionFailure(session);
  if (authFail) return res.status(authFail.status).json({ error: authFail.error });
  const { supabase } = unwrapCircleSession(session);

  if (req.method === "GET") {
    const personId = (req.query.person_id as string)?.trim();
    let q = supabase
      .from("person_health_conditions")
      .select("*")
      .eq("circle_id", circleId);
    if (personId) q = q.eq("person_id", personId);
    const { data, error } = await q.order("created_at", { ascending: true });
    if (error && !error.message.includes("person_health_conditions")) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ conditions: data ?? [] });
  }

  if (req.method === "POST") {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
      person_id?: string;
      category?: string;
      condition?: string;
      age_of_onset?: number | null;
      still_active?: boolean;
    };
    const personId = body.person_id?.trim();
    const condition = body.condition?.trim();
    const category = body.category?.trim() ?? "other";
    if (!personId || !condition) {
      return res.status(400).json({ error: "person_id and condition are required." });
    }
    if (!CATEGORIES.has(category)) {
      return res.status(400).json({ error: "Invalid category." });
    }

    const { data, error } = await supabase
      .from("person_health_conditions")
      .upsert(
        {
          circle_id: circleId,
          person_id: personId,
          category,
          condition,
          age_of_onset: body.age_of_onset ?? null,
          still_active: body.still_active ?? true,
        },
        { onConflict: "circle_id,person_id,category,condition" },
      )
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ condition: data });
  }

  if (req.method === "DELETE") {
    const id = (req.query.id as string)?.trim();
    if (!id) return res.status(400).json({ error: "id is required." });
    const { error } = await supabase
      .from("person_health_conditions")
      .delete()
      .eq("id", id)
      .eq("circle_id", circleId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
