import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  circleSessionFailure,
  unwrapCircleSession,
  verifyCircleSession,
} from "../lib/verifyCircleSession";

const BUCKET = "family-people-photos";
const MAX_BYTES = 5 * 1024 * 1024;

type Body = {
  circle_id?: string;
  person_id?: string;
  content_type?: string;
  data_base64?: string;
};

function publicObjectUrl(supabaseUrl: string, path: string): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`;
}

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
  const contentType = body.content_type?.trim() || "image/jpeg";
  const dataBase64 = body.data_base64?.trim();

  if (!circleId || !personId || !dataBase64) {
    return res.status(400).json({ error: "circle_id, person_id, and data_base64 are required." });
  }

  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(contentType)) {
    return res.status(400).json({ error: "Unsupported image type." });
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
    return res.status(400).json({ error: "Image must be under 5 MB." });
  }

  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  const objectPath = `${circleId}/${personId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: true });

  if (uploadError) {
    return res.status(500).json({ error: uploadError.message });
  }

  const photoUrl = publicObjectUrl(supabaseUrl, objectPath);

  const { data: person, error: updateError } = await supabase
    .from("family_people")
    .update({ photo_url: photoUrl })
    .eq("id", personId)
    .eq("circle_id", circleId)
    .select("id, photo_url")
    .single();

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true, photo_url: person?.photo_url ?? photoUrl });
}
