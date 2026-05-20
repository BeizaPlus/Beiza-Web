import type { SupabaseClient } from "@supabase/supabase-js";
import {
  executePersonaTool,
  formatTreeRosterForPrompt,
  PERSONA_TOOL_DEFINITIONS,
  type PersonaToolName,
} from "./personaTools";

export type PersonaChatMessage = { role: "user" | "assistant"; content: string };

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | AnthropicContentBlock[];
};

const MAX_TOOL_ROUNDS = 10;

function buildSystemPrompt(params: {
  circleName: string;
  roster: string;
  voiceContext: string;
}) {
  return `You are Beiza's family-tree guide — warm, precise, and action-oriented.

When the human describes family members or relationships, use tools in the SAME turn before asking your next question.
Example: "My father had three brothers — Kofi, Kwame, and Kojo — all farmers" → call add_person three times, connect_people for each brother to the father, update_person for career_path "farmer" on each — then one short follow-up question.

Tools:
- add_person — new node (returns person_id)
- connect_people — edge between two person_ids (parent_of, child_of, sibling_of, etc.)
- update_person — name, relation_label, gender, career_path

Current circle: ${params.circleName}
People on canvas:
${params.roster}

Voice memories (prioritize "by" links — their own words):
${params.voiceContext}

Rules:
- Use legacy language: memory, circle, voice, story — never "upload", "user", "admin".
- Resolve person_id from the roster; after add_person use the returned id immediately.
- One concise follow-up question after tool work when helpful.
- If nothing to change, reply without tools.`;
}

async function loadVoiceContext(supabase: SupabaseClient, circleId: string) {
  const { data: recordings } = await supabase
    .from("recordings")
    .select("id, prompt, title")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false })
    .limit(30);

  const ids = (recordings ?? []).map((r) => r.id);
  if (ids.length === 0) return "No recordings yet.";

  const { data: links } = await supabase
    .from("recording_person_links")
    .select("recording_id, link_type, person_id")
    .in("recording_id", ids);

  const { data: people } = await supabase
    .from("family_people")
    .select("id, display_name")
    .eq("circle_id", circleId);

  const nameById = new Map((people ?? []).map((p) => [p.id, p.display_name]));
  const byLinks = (links ?? []).filter((l) => l.link_type === "by");

  const lines: string[] = [];
  for (const rec of recordings ?? []) {
    const by = byLinks.filter((l) => l.recording_id === rec.id);
    const who = by.map((l) => nameById.get(l.person_id) ?? "Someone").join(", ");
    const label = rec.title || rec.prompt;
    if (by.length > 0) {
      lines.push(`[by ${who}] ${label}`);
    }
  }
  return lines.slice(0, 12).join("\n") || "No 'by' voice links yet.";
}

async function runAnthropicAgenticLoop(params: {
  apiKey: string;
  system: string;
  messages: PersonaChatMessage[];
  supabase: SupabaseClient;
  circleId: string;
}): Promise<{ reply: string; treeUpdated: boolean }> {
  const anthropicMessages: AnthropicMessage[] = params.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let treeUpdated = false;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2048,
        system: params.system,
        tools: PERSONA_TOOL_DEFINITIONS,
        messages: anthropicMessages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic error (${res.status}): ${errText.slice(0, 200)}`);
    }

    const body = (await res.json()) as {
      content: AnthropicContentBlock[];
      stop_reason: string;
    };

    const toolUses = body.content.filter(
      (b): b is Extract<AnthropicContentBlock, { type: "tool_use" }> => b.type === "tool_use",
    );

    anthropicMessages.push({ role: "assistant", content: body.content });

    if (toolUses.length === 0) {
      const text = body.content.find((b) => b.type === "text");
      return {
        reply: text?.type === "text" ? text.text.trim() : "Done.",
        treeUpdated,
      };
    }

    const toolResults: { type: "tool_result"; tool_use_id: string; content: string }[] = [];

    for (const tool of toolUses) {
      const name = tool.name as PersonaToolName;
      const outcome = await executePersonaTool(
        params.supabase,
        params.circleId,
        name,
        tool.input ?? {},
      );
      if (outcome.ok) treeUpdated = true;
      toolResults.push({
        type: "tool_result",
        tool_use_id: tool.id,
        content: JSON.stringify(outcome.ok ? outcome.result : { error: outcome.error }),
      });
    }

    anthropicMessages.push({ role: "user", content: toolResults });
  }

  return {
    reply: "I've updated the tree — tell me who to add or connect next.",
    treeUpdated,
  };
}

async function runOllamaAgenticLoop(params: {
  baseUrl: string;
  model: string;
  system: string;
  messages: PersonaChatMessage[];
  supabase: SupabaseClient;
  circleId: string;
}): Promise<{ reply: string; treeUpdated: boolean }> {
  const ollamaMessages = [
    { role: "system", content: params.system },
    ...params.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let treeUpdated = false;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch(`${params.baseUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: params.model,
        stream: false,
        messages: ollamaMessages,
        format: "json",
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama error (${res.status})`);
    }

    const body = (await res.json()) as { message?: { content?: string } };
    const raw = body.message?.content?.trim() ?? "";
    let parsed: {
      assistant_message?: string;
      tool_calls?: { name: PersonaToolName; input: Record<string, unknown> }[];
    };

    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      return { reply: raw || "I couldn't parse that — try again?", treeUpdated };
    }

    const calls = parsed.tool_calls ?? [];
    if (calls.length === 0) {
      return {
        reply: parsed.assistant_message?.trim() || raw,
        treeUpdated,
      };
    }

    const results: unknown[] = [];
    for (const call of calls) {
      const outcome = await executePersonaTool(
        params.supabase,
        params.circleId,
        call.name,
        call.input ?? {},
      );
      if (outcome.ok) treeUpdated = true;
      results.push({ tool: call.name, ...(outcome.ok ? outcome.result : { error: outcome.error }) });
    }

    ollamaMessages.push({
      role: "assistant",
      content: JSON.stringify({ tool_results: results }),
    });
    ollamaMessages.push({
      role: "user",
      content:
        "Tool results above. Reply with JSON: { assistant_message, tool_calls: [] } or more tool_calls if needed.",
    });
  }

  return { reply: "Tree updated. Who should we connect next?", treeUpdated };
}

export async function runPersonaAgenticChat(params: {
  supabase: SupabaseClient;
  circleId: string;
  circleName: string;
  messages: PersonaChatMessage[];
}): Promise<{ reply: string; treeUpdated: boolean }> {
  const { data: people } = await params.supabase
    .from("family_people")
    .select("id, display_name, relation_label, career_path")
    .eq("circle_id", params.circleId);

  const roster = formatTreeRosterForPrompt(people ?? []);
  const voiceContext = await loadVoiceContext(params.supabase, params.circleId);
  const system = buildSystemPrompt({
    circleName: params.circleName,
    roster,
    voiceContext,
  });

  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const provider = (process.env.VITE_AI_PROVIDER ?? (hasAnthropicKey ? "anthropic" : "ollama")).toLowerCase();

  if (provider === "ollama" || (provider === "anthropic" && !hasAnthropicKey)) {
    return runOllamaAgenticLoop({
      baseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
      model: process.env.OLLAMA_MODEL ?? "llama3.2",
      system:
        system +
        '\nRespond ONLY with JSON: {"assistant_message":"...","tool_calls":[{"name":"add_person","input":{...}}]}. tool_calls may be empty.',
      messages: params.messages,
      supabase: params.supabase,
      circleId: params.circleId,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not configured.");
  }

  return runAnthropicAgenticLoop({
    apiKey,
    system,
    messages: params.messages,
    supabase: params.supabase,
    circleId: params.circleId,
  });
}
