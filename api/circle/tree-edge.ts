import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyCircleSession } from "../lib/verifyCircleSession";

type Body = {
  circle_id?: string;
  source_person_id?: string;
  target_person_id?: string;
  relationship_type?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  const circleId = (
    (req.query.circle_id as string) ??
    (typeof req.body === "object" && req.body?.circle_id) ??
    ""
  ).trim();

  if (req.method === "DELETE") {
    const edgeId = (req.query.edge_id as string)?.trim();
    if (!circleId || !edgeId) {
      return res.status(400).json({ error: "Missing circle_id or edge_id." });
    }

    const session = await verifyCircleSession(req, circleId);
    if (!session.ok) {
      return res.status(session.status).json({ error: session.error });
    }

    const { error } = await session.supabase
      .from("tree_edges")
      .delete()
      .eq("id", edgeId)
      .eq("circle_id", circleId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Body;
  const postCircleId = body.circle_id?.trim();
  const sourcePersonId = body.source_person_id?.trim();
  const targetPersonId = body.target_person_id?.trim();
  const relationshipType = body.relationship_type?.trim();

  if (!postCircleId || !sourcePersonId || !targetPersonId || !relationshipType) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (sourcePersonId === targetPersonId) {
    return res.status(400).json({ error: "Cannot connect a person to themselves." });
  }

  const session = await verifyCircleSession(req, postCircleId);
  if (!session.ok) {
    return res.status(session.status).json({ error: session.error });
  }

  const { data: edge, error } = await session.supabase
    .from("tree_edges")
    .insert({
      circle_id: postCircleId,
      source_person_id: sourcePersonId,
      target_person_id: targetPersonId,
      relationship_type: relationshipType,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "These people are already connected." });
    }
    return res.status(500).json({ error: error.message });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ edge });
}
