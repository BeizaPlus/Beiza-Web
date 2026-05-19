import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { hashCircleToken, verifyCircleSessionToken } from "../lib/circleAccessToken";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization");
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const circleId = (req.query.circle_id as string)?.trim();
  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!circleId || !auth) {
    return res.status(401).json({ error: "Missing circle_id or token." });
  }

  const verified = verifyCircleSessionToken(auth, circleId);
  if (!verified.valid || !verified.rawToken) {
    return res.status(401).json({ error: "Invalid or expired access." });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.VITE_SUPABASE_PRIVILEGED_KEY ??
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Server configuration missing." });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tokenHash = hashCircleToken(verified.rawToken);
  const { data: sessionRow } = await supabase
    .from("circle_access_tokens")
    .select("id, expires_at")
    .eq("circle_id", circleId)
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!sessionRow) {
    return res.status(401).json({ error: "Session expired. Enter your access code again." });
  }

  const { data: circle } = await supabase
    .from("family_circles")
    .select("id, name, access_code, access_code_hint, since_year, is_in_memoriam")
    .eq("id", circleId)
    .single();

  const { data: people } = await supabase.from("family_people").select("*").eq("circle_id", circleId);

  const { data: treeEdges, error: edgesError } = await supabase
    .from("tree_edges")
    .select("*")
    .eq("circle_id", circleId);
  if (edgesError && !edgesError.message.includes("tree_edges")) {
    return res.status(500).json({ error: edgesError.message });
  }

  const { data: recordings } = await supabase
    .from("recordings")
    .select("id, circle_id, prompt, audio_url, duration_seconds, title, created_at, recorded_by")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });

  const recordingIds = (recordings ?? []).map((r) => r.id);
  let links: unknown[] = [];

  if (recordingIds.length > 0) {
    const { data: linkRows } = await supabase
      .from("recording_person_links")
      .select("*")
      .in("recording_id", recordingIds);
    links = linkRows ?? [];
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({
    circle,
    people: people ?? [],
    recordings: recordings ?? [],
    links,
    treeEdges: treeEdges ?? [],
    memberCount: people?.length ?? 0,
    memoryCount: recordings?.length ?? 0,
  });
}
