import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  circleSessionFailure,
  unwrapCircleSession,
  verifyCircleSession,
} from "../lib/verifyCircleSession";

type Body = {
  circle_id?: string;
  person_id?: string;
  display_name?: string;
  relation_label?: string;
  gender?: string | null;
  career_path?: string | null;
  birthplace?: string | null;
  education?: string | null;
  languages?: string[] | null;
  religion?: string | null;
  bio?: string | null;
  nickname?: string | null;
  birth_year?: number | null;
  sibling_order?: number | null;
  death_year?: number | null;
  is_tree_anchor?: boolean;
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

  const update: Record<string, unknown> = {};

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
    update.career_path = body.career_path === null ? null : body.career_path.trim() || null;
  }

  if (body.birthplace !== undefined) {
    update.birthplace = body.birthplace === null ? null : body.birthplace.trim() || null;
  }

  if (body.education !== undefined) {
    update.education = body.education === null ? null : body.education.trim() || null;
  }

  if (body.languages !== undefined) {
    update.languages =
      body.languages === null || body.languages.length === 0 ? null : body.languages;
  }

  if (body.religion !== undefined) {
    update.religion = body.religion === null ? null : body.religion.trim() || null;
  }

  if (body.bio !== undefined) {
    update.bio = body.bio === null ? null : body.bio.trim() || null;
  }

  if (body.nickname !== undefined) {
    update.nickname = body.nickname === null ? null : body.nickname.trim() || null;
  }

  if (body.birth_year !== undefined) {
    update.birth_year = body.birth_year;
  }

  if (body.sibling_order !== undefined) {
    const order = body.sibling_order;
    if (order !== null && (!Number.isInteger(order) || order < 1)) {
      return res.status(400).json({ error: "sibling_order must be a positive integer or null." });
    }
    update.sibling_order = order;
  }

  if (body.death_year !== undefined) {
    update.death_year = body.death_year;
  }

  if (body.is_tree_anchor === true) {
    update.is_tree_anchor = true;
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  const session = await verifyCircleSession(req, circleId);
  const authFail = circleSessionFailure(session);
  if (authFail) return res.status(authFail.status).json({ error: authFail.error });
  const { supabase } = unwrapCircleSession(session);

  if (body.is_tree_anchor === true) {
    await supabase
      .from("family_people")
      .update({ is_tree_anchor: false })
      .eq("circle_id", circleId);
  }

  const { data: person, error } = await supabase
    .from("family_people")
    .update(update)
    .eq("id", personId)
    .eq("circle_id", circleId)
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true, person });
}
