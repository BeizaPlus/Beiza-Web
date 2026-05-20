import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  circleSessionFailure,
  unwrapCircleSession,
  verifyCircleSession,
} from "../../../api/lib/verifyCircleSession.js";

type Body = {
  circle_id?: string;
  person_id?: string;
  canvas_x?: number;
  canvas_y?: number;
  append_copy_suffix?: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Body;
  const circleId = body.circle_id?.trim();
  const personId = body.person_id?.trim();

  if (!circleId || !personId) {
    return res.status(400).json({ error: "circle_id and person_id are required." });
  }

  const session = await verifyCircleSession(req, circleId);
  const authFail = circleSessionFailure(session);
  if (authFail) return res.status(authFail.status).json({ error: authFail.error });
  const { supabase } = unwrapCircleSession(session);

  const { data: source, error: fetchError } = await supabase
    .from("family_people")
    .select("*")
    .eq("id", personId)
    .eq("circle_id", circleId)
    .maybeSingle();

  if (fetchError || !source) {
    return res.status(404).json({ error: "Person not found." });
  }

  const baseX = source.canvas_x ?? 0;
  const baseY = source.canvas_y ?? 0;
  const offsetX = typeof body.canvas_x === "number" ? body.canvas_x : baseX + 60;
  const offsetY = typeof body.canvas_y === "number" ? body.canvas_y : baseY + 60;

  const displayName =
    body.append_copy_suffix && !String(source.display_name).includes("(copy)")
      ? `${source.display_name} (copy)`
      : source.display_name;

  const { data: created, error: insertError } = await supabase
    .from("family_people")
    .insert({
      circle_id: circleId,
      display_name: displayName,
      relation_label: source.relation_label,
      status: source.status,
      gender: source.gender ?? null,
      career_path: source.career_path ?? null,
      birthplace: source.birthplace ?? null,
      education: source.education ?? null,
      languages: source.languages ?? null,
      religion: source.religion ?? null,
      bio: source.bio ?? null,
      nickname: source.nickname ?? null,
      birth_year: source.birth_year ?? null,
      sibling_order: source.sibling_order ?? null,
      death_year: source.death_year ?? null,
      photo_url: source.photo_url ?? null,
      adinkra_id: source.adinkra_id ?? null,
      canvas_x: offsetX,
      canvas_y: offsetY,
    })
    .select("*")
    .single();

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ person: created });
}
