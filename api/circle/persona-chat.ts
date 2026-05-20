import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  circleSessionFailure,
  unwrapCircleSession,
  verifyCircleSession,
} from "../lib/verifyCircleSession";
import { runPersonaAgenticChat, type PersonaChatMessage } from "../lib/personaAgent";

type Body = {
  circle_id?: string;
  messages?: PersonaChatMessage[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Body;
  const circleId = body.circle_id?.trim();
  const messages = body.messages ?? [];

  if (!circleId) {
    return res.status(400).json({ error: "circle_id is required." });
  }
  if (messages.length === 0) {
    return res.status(400).json({ error: "messages are required." });
  }

  const session = await verifyCircleSession(req, circleId);
  const authFail = circleSessionFailure(session);
  if (authFail) return res.status(authFail.status).json({ error: authFail.error });
  const { supabase } = unwrapCircleSession(session);

  const { data: circle } = await supabase
    .from("family_circles")
    .select("name")
    .eq("id", circleId)
    .single();

  if (!circle) {
    return res.status(404).json({ error: "Circle not found." });
  }

  try {
    const { reply, treeUpdated } = await runPersonaAgenticChat({
      supabase,
      circleId,
      circleName: circle.name,
      messages: messages.slice(-20),
    });

    return res.status(200).json({
      reply,
      tree_updated: treeUpdated,
    });
  } catch (err) {
    console.error("[persona-chat]", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Persona chat failed.",
    });
  }
}
