import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyCircleSession } from "../lib/verifyCircleSession";

type Body = {
  circle_id?: string;
  person_id?: string;
  display_name?: string;
  relation_label?: string;
  gender?: string | null;
  career_path?: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Body;
  const circleId = body.circle_id?.trim();
  const personId = body.person_id?.trim();

  if (!circleId || !personId) {
    return res.status(400).json({ error: "circle_id and person_id are required." });
  }

  const update: Record<string, string | null> = {};

  if (body.display_name !== undefined) {
    const displayName = body.display_name.trim();
    if (!displayName) {
      return res.status(400).json({ error: "display_name cannot be empty." });
    }
    update.display_name = displayName;
  }

  if (body.relation_label !== undefined) {
    update.relation_label = body.relation_label.trim().toUpperCase() || "FAMILY";
  }

  if (body.gender !== undefined) {
    const g = body.gender === null || body.gender === "" ? null : body.gender.trim().toLowerCase();
    if (g !== null && g !== "male" && g !== "female") {
      return res.status(400).json({ error: "gender must be male, female, or null." });
    }
    update.gender = g;
  }

  if (body.career_path !== undefined) {
    const career = body.career_path === null ? null : body.career_path.trim();
    update.career_path = career || null;
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  const session = await verifyCircleSession(req, circleId);
  if (!session.ok) {
    return res.status(session.status).json({ error: session.error });
  }

  const { data: person, error } = await session.supabase
    .from("family_people")
    .update(update)
    .eq("id", personId)
    .eq("circle_id", circleId)
    .select("id, display_name, relation_label, gender, career_path, photo_url")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true, person });
}
