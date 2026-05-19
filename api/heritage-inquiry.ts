import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

type HeritageInquiryBody = {
  name?: string;
  email?: string;
  country?: string;
  planning_for?: string;
  message?: string;
  referral_source?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[heritage-inquiry] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({
      error: "Server configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
    });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as HeritageInquiryBody;
  const name = body.name?.trim();
  const email = body.email?.trim();

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("heritage_inquiries").insert({
    name,
    email,
    country: body.country?.trim() || null,
    planning_for: body.planning_for?.trim() || null,
    message: body.message?.trim() || null,
    referral_source: body.referral_source?.trim() || null,
  });

  if (error) {
    console.error("[heritage-inquiry] Insert failed:", error);
    return res.status(500).json({ error: "Could not save your inquiry. Please try again." });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true });
}
