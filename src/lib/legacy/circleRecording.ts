import { getStoredCircleToken } from "@/lib/circleAccess";
import type { LegacyRecording, MemoryAboutChoice } from "@/lib/legacy/types";
import type { StoryPrompt } from "@/lib/prompts";
import { FREE_VAULT_STORAGE_BYTES } from "@/lib/legacy/audioRecording";

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function memoryAboutToApi(choice: MemoryAboutChoice) {
  if (choice.type === "person") {
    return { type: "person" as const, person_id: choice.personId };
  }
  if (choice.type === "new") {
    return { type: "new" as const, name: choice.name.trim() };
  }
  return { type: "self" as const };
}

/**
 * Upload a sealed memory for the public circle tree (`/circle/:id/tree`).
 * Uses bearer token + `POST /api/circle/record-memory` (service role on server).
 *
 * Do NOT use for `/legacy/record` — that path requires Supabase auth via
 * {@link uploadLegacyRecording} in `useLegacy.ts`.
 */
export async function uploadCircleRecording(params: {
  circleId: string;
  prompt: StoryPrompt;
  blob: Blob;
  durationSeconds: number;
  title?: string;
  memoryAbout: MemoryAboutChoice;
}): Promise<LegacyRecording> {
  const token = getStoredCircleToken(params.circleId);
  if (!token) {
    throw new Error("Session expired — re-enter your circle access code.");
  }

  if (params.blob.size > FREE_VAULT_STORAGE_BYTES) {
    throw new Error(
      "This recording exceeds your vault storage limit (5 GB on Circle). Free space or upgrade to Keeper.",
    );
  }

  const dataBase64 = await blobToBase64(params.blob);
  const mime = params.blob.type || "audio/webm";

  const res = await fetch("/api/circle/record-memory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      circle_id: params.circleId,
      content_type: mime,
      data_base64: dataBase64,
      duration_seconds: params.durationSeconds,
      prompt: params.prompt.text,
      prompt_id: params.prompt.id,
      prompt_category: params.prompt.category,
      prompt_arc_position: params.prompt.arc_position,
      prompt_tags: params.prompt.tags,
      title: params.title ?? null,
      memory_about: memoryAboutToApi(params.memoryAbout),
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    recording?: LegacyRecording;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(body.error ?? "Could not save memory.");
  }

  if (!body.recording) {
    throw new Error("Recording saved but response was incomplete.");
  }

  return body.recording;
}
