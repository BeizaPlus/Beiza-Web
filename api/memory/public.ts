import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = String(req.query.token ?? "").trim();
  if (!token) {
    return res.status(400).json({ error: "Missing share token" });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({
      error: "Server configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("get_public_shared_memory", {
    p_share_token: token,
  });

  if (error) {
    console.error("[memory/public]", error);
    return res.status(500).json({ error: "Could not load memory" });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return res.status(404).json({ error: "Memory not found" });
  }

  return res.status(200).json({
    id: row.id,
    prompt: row.prompt,
    audio_url: row.audio_url,
    duration_seconds: row.duration_seconds,
    title: row.title,
    circle_name: row.circle_name,
  });
}
