import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin } from "../lib/supabaseAdmin.js";
import { verifyHealthUnsubscribe } from "../lib/healthUnsubscribe.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const token = (req.query.token as string)?.trim();
  if (!token) return res.status(400).send("Missing token.");

  const parsed = verifyHealthUnsubscribe(token);
  if (!parsed) return res.status(400).send("Invalid or expired link.");

  const supabase = getSupabaseAdmin();
  if (!supabase) return res.status(500).send("Server error.");

  await supabase.from("health_question_opt_outs").upsert({
    email: parsed.email.toLowerCase(),
    circle_id: parsed.circleId,
    unsubscribed_at: new Date().toISOString(),
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res
    .status(200)
    .send(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:48px;text-align:center"><h1>Unsubscribed</h1><p>You will no longer receive weekly health questions for this circle.</p><p><a href="/" style="color:#E6A817">Return to Beiza</a></p></body></html>`,
    );
}
