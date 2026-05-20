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
  const canvasX = body.canvas_x;
  const canvasY = body.canvas_y;

  if (!circleId || !personId || typeof canvasX !== "number" || typeof canvasY !== "number") {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const session = await verifyCircleSession(req, circleId);
  const authFail = circleSessionFailure(session);
  if (authFail) return res.status(authFail.status).json({ error: authFail.error });
  const { supabase } = unwrapCircleSession(session);

  const { error } = await supabase
    .from("family_people")
    .update({ canvas_x: canvasX, canvas_y: canvasY })
    .eq("id", personId)
    .eq("circle_id", circleId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true });
}
