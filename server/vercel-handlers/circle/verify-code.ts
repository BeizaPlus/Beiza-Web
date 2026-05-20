import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import {
  generateCircleAccessToken,
  hashCircleToken,
  signCircleSessionToken,
} from "../../../api/lib/circleAccessToken.js";

type Body = {
  circle_id?: string;
  code?: string;
  email?: string;
};

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

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.VITE_SUPABASE_PRIVILEGED_KEY ??
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Server configuration missing." });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Body;
  const circleId = body.circle_id?.trim();
  const code = body.code?.trim().toUpperCase();

  if (!circleId || !code || code.length !== 6) {
    return res.status(400).json({ valid: false, error: "Circle id and 6-character code are required." });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: circle, error: circleError } = await supabase
    .from("family_circles")
    .select("id, access_code")
    .eq("id", circleId)
    .maybeSingle();

  if (circleError || !circle) {
    return res.status(404).json({ valid: false, error: "Circle not found." });
  }

  const overrideCode = (
    process.env.CIRCLE_ADMIN_OVERRIDE_CODE ?? process.env.VITE_CIRCLE_ADMIN_OVERRIDE_CODE ?? ""
  )
    .trim()
    .toUpperCase();
  const usedAdminOverride = Boolean(overrideCode && code === overrideCode);

  if (!usedAdminOverride && (circle.access_code as string)?.toUpperCase() !== code) {
    return res.status(200).json({ valid: false });
  }

  const { raw, hash, expiresAt } = generateCircleAccessToken();

  const { error: tokenError } = await supabase.from("circle_access_tokens").insert({
    circle_id: circleId,
    token_hash: hash,
    expires_at: expiresAt.toISOString(),
  });

  if (tokenError) {
    console.error("[verify-code] token insert:", tokenError);
    return res.status(500).json({ valid: false, error: "Could not grant access." });
  }

  const authHeader = req.headers.authorization;
  let userId: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    const jwt = authHeader.slice(7);
    const { data: userData } = await supabase.auth.getUser(jwt);
    userId = userData.user?.id ?? null;
  }

  const memberRow = {
    circle_id: circleId,
    user_id: userId,
    email: body.email?.trim() || null,
    role: "member" as const,
    joined_via: "code" as const,
  };

  if (userId) {
    const { error: memberError } = await supabase.from("circle_members").upsert(memberRow, {
      onConflict: "circle_id,user_id",
    });
    if (memberError) {
      console.error("[verify-code] circle_members upsert:", memberError);
    }
  }

  if (userId) {
    const { data: existing } = await supabase
      .from("family_members")
      .select("id")
      .eq("circle_id", circleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) {
      await supabase.from("family_members").insert({
        circle_id: circleId,
        user_id: userId,
        role: "member",
      });
    }
  }

  const sessionToken = signCircleSessionToken(circleId, raw);

  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ valid: true, token: sessionToken });
}
