import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  circleSessionFailure,
  unwrapCircleSession,
  verifyCircleSession,
} from "../../../api/lib/verifyCircleSession.js";
import { applyMemoryAboutLinks } from "../../../api/lib/recordMemoryLinks.js";

const BUCKET = "legacy-recordings";
const MAX_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB Circle vault limit

type Body = {
  circle_id?: string;
  content_type?: string;
  data_base64?: string;
  duration_seconds?: number;
  prompt?: string;
  prompt_id?: string | null;
  prompt_category?: string | null;
  prompt_arc_position?: string | null;
  prompt_tags?: string[] | null;
  title?: string | null;
  memory_about?: {
    type: "self" | "person" | "new";
    person_id?: string;
    name?: string;
  };
};

function extensionForMime(mime: string) {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

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
  const contentType = body.content_type?.trim() || "audio/webm";
  const dataBase64 = body.data_base64?.trim();
  const memoryAbout = body.memory_about;

  if (!circleId || !dataBase64 || !memoryAbout?.type) {
    return res.status(400).json({ error: "circle_id, data_base64, and memory_about are required." });
  }

  const session = await verifyCircleSession(req, circleId);
  const authFail = circleSessionFailure(session);
  if (authFail) return res.status(authFail.status).json({ error: authFail.error });
  const { supabase } = unwrapCircleSession(session);

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  if (!supabaseUrl) {
    return res.status(500).json({ error: "Server configuration missing." });
  }

  const buffer = Buffer.from(dataBase64, "base64");
  if (buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: "Recording exceeds vault storage limit (5 GB)." });
  }

  const { data: circle, error: circleError } = await supabase
    .from("family_circles")
    .select("created_by")
    .eq("id", circleId)
    .single();

  if (circleError || !circle?.created_by) {
    return res.status(500).json({ error: "Circle has no owner for recording attribution." });
  }

  const recordingId = crypto.randomUUID();
  const ext = extensionForMime(contentType);
  const objectPath = `${circleId}/${recordingId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: false });

  if (uploadError) {
    return res.status(500).json({ error: uploadError.message });
  }

  const audioUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${objectPath}`;

  const { data: recording, error: insertError } = await supabase
    .from("recordings")
    .insert({
      id: recordingId,
      circle_id: circleId,
      recorded_by: circle.created_by,
      prompt: body.prompt?.trim() || "Memory",
      prompt_id: body.prompt_id ?? null,
      prompt_category: body.prompt_category ?? null,
      prompt_arc_position: body.prompt_arc_position ?? null,
      prompt_tags: body.prompt_tags ?? null,
      audio_url: audioUrl,
      duration_seconds: Math.max(0, Math.round(body.duration_seconds ?? 0)),
      title: body.title?.trim() || null,
    })
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  try {
    await applyMemoryAboutLinks({
      supabase: supabase,
      circleId,
      recordingId,
      recordedByUserId: circle.created_by,
      memoryAbout:
        memoryAbout.type === "person"
          ? { type: "person", person_id: memoryAbout.person_id ?? "" }
          : memoryAbout.type === "new"
            ? { type: "new", name: memoryAbout.name ?? "" }
            : { type: "self" },
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Could not link memory to person.",
    });
  }

  return res.status(200).json({ recording });
}
