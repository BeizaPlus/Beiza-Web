import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyCircleSession } from "../lib/verifyCircleSession";

type Body = {
  circle_id?: string;
  person_id?: string;
  display_name?: string;
  relation_label?: string;
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
  const displayName = body.display_name?.trim();
  const relationLabel = body.relation_label?.trim().toUpperCase();

  if (!circleId || !personId || !displayName || !relationLabel) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const session = await verifyCircleSession(req, circleId);
  if (!session.ok) {
    return res.status(session.status).json({ error: session.error });
  }

  const { error } = await session.supabase
    .from("family_people")
    .update({
      display_name: displayName,
      relation_label: relationLabel,
    })
    .eq("id", personId)
    .eq("circle_id", circleId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true });
}
