/**
 * Beiza Legacy — generate-prompts
 * Claude Haiku memory prompts for Legacy Circle members.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Anthropic from "npm:@anthropic-ai/sdk@^0.39";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CORE_SYSTEM = `You are a warm memory companion for Beiza Legacy — families preserving voices and stories.

RULES:
- Use legacy language only: "memory", "legacy", "circle", "voice", "story".
- NEVER use: memorial, funeral, passed away, upload, file, sync, error, user, admin.
- One open-ended question at a time. Max 200 characters per prompt.
- Be SPECIFIC and SENSORY — sights, sounds, smells, tastes.
- Be POSITIVE — joy, pride, love, humor, wonder.
- Starters: "What was...", "Tell us about...", "How did..."
- Honor heritage warmly; Adinkra symbols represent wisdom, strength, and continuity when relevant.
- Never mention AI, bots, or technology.

Examples of good prompts:
- "What is your earliest memory of your mother's cooking?"
- "Describe the house you grew up in — what did it smell like?"
- "Who taught you the most important thing you know?"`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ message: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const circleId = body.circleId as string;
    const mode = (body.mode as string) ?? "suggest";
    const count = Math.min(Number(body.count) || 3, 10);
    const topic = body.topic as string | undefined;
    const roughPrompt = body.roughPrompt as string | undefined;

    if (!circleId) {
      return json({ message: "circleId is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return json({ message: "Unauthorized" }, 401);
    }

    const { data: membership } = await supabase
      .from("family_members")
      .select("id")
      .eq("circle_id", circleId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!membership) {
      return json({ message: "Not a member of this Legacy Circle" }, 403);
    }

    const { data: recordings } = await supabase
      .from("recordings")
      .select("title, prompt")
      .eq("circle_id", circleId)
      .order("created_at", { ascending: false })
      .limit(15);

    const existing =
      (recordings ?? [])
        .map((r) => r.title || r.prompt)
        .filter(Boolean)
        .join(" | ") || "None yet";

    let userMessage = `Generate ${count} story prompts. Existing memories: ${existing}. Return ONLY a JSON array of strings.`;

    if (mode === "refine" && roughPrompt) {
      userMessage = `Polish this rough idea into 3 warm prompts: "${roughPrompt}". Return ONLY a JSON array of 3 strings.`;
    } else if (mode === "pack" && topic) {
      userMessage = `Generate ${count} prompts about: "${topic}". Return ONLY a JSON array of strings.`;
    } else if (topic) {
      userMessage += ` Topic: ${topic}.`;
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json({ message: "ANTHROPIC_API_KEY not configured" }, 500);
    }

    const client = new Anthropic({ apiKey });
    const completion = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      temperature: 0.8,
      system: CORE_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = completion.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return json({ message: "Empty AI response" }, 500);
    }

    const match = text.text.match(/\[[\s\S]*\]/);
    if (!match) {
      return json({ message: "Could not parse prompts" }, 500);
    }

    const prompts = JSON.parse(match[0]) as string[];
    if (!Array.isArray(prompts)) {
      return json({ message: "Invalid prompt format" }, 500);
    }

    return json({ prompts, mode });
  } catch (err) {
    console.error("[generate-prompts]", err);
    return json(
      { message: err instanceof Error ? err.message : "Internal error" },
      500,
    );
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
