import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  circleSessionFailure,
  unwrapCircleSession,
  verifyCircleSession,
} from "../../../api/lib/verifyCircleSession.js";

type Body = {
  circle_id?: string;
  source_person_id?: string;
  target_person_id?: string;
  relationship_type?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, PATCH, DELETE, OPTIONS");
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
    const deleteAuthFail = circleSessionFailure(session);
    if (deleteAuthFail) return res.status(deleteAuthFail.status).json({ error: deleteAuthFail.error });
    const { supabase: deleteSupabase } = unwrapCircleSession(session);

    const { error } = await deleteSupabase
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

  if (req.method === "PATCH") {
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Body & {
      edge_id?: string;
    };
    const patchCircleId = body.circle_id?.trim();
    const edgeId = body.edge_id?.trim();
    const relationshipType = body.relationship_type?.trim();

    if (!patchCircleId || !edgeId || !relationshipType) {
      return res.status(400).json({ error: "circle_id, edge_id, and relationship_type are required." });
    }

    const session = await verifyCircleSession(req, patchCircleId);
    const patchAuthFail = circleSessionFailure(session);
    if (patchAuthFail) return res.status(patchAuthFail.status).json({ error: patchAuthFail.error });
    const { supabase: patchSupabase } = unwrapCircleSession(session);

    const { data: edge, error } = await patchSupabase
      .from("tree_edges")
      .update({ relationship_type: relationshipType })
      .eq("id", edgeId)
      .eq("circle_id", patchCircleId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ edge });
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
  const postAuthFail = circleSessionFailure(session);
  if (postAuthFail) return res.status(postAuthFail.status).json({ error: postAuthFail.error });
  const { supabase: postSupabase } = unwrapCircleSession(session);

  const { data: edge, error } = await postSupabase
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
