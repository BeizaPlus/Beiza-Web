import { uploadCircleRecording } from "@/lib/legacy/circleRecording";
import { uploadLegacyRecording } from "@/hooks/useLegacy";
import type { LegacyRecording, MemoryAboutChoice } from "@/lib/legacy/types";
import type { StoryPrompt } from "@/lib/prompts";

export type SaveRecordedMemoryParams = {
  circleId: string;
  /** When true, use circle bearer token API (public tree). When false, Supabase auth (legacy shell). */
  persistViaApi: boolean;
  prompt: StoryPrompt;
  blob: Blob;
  durationSeconds: number;
  title?: string;
  memoryAbout: MemoryAboutChoice;
};

/**
 * Single entry for sealing a memory — routes by `persistViaApi` (same flag as tree canvas).
 */
export async function saveRecordedMemory(
  params: SaveRecordedMemoryParams,
): Promise<LegacyRecording> {
  if (params.persistViaApi) {
    return uploadCircleRecording({
      circleId: params.circleId,
      prompt: params.prompt,
      blob: params.blob,
      durationSeconds: params.durationSeconds,
      title: params.title,
      memoryAbout: params.memoryAbout,
    });
  }

  return uploadLegacyRecording({
    circleId: params.circleId,
    prompt: params.prompt,
    blob: params.blob,
    durationSeconds: params.durationSeconds,
    title: params.title,
    memoryAbout: params.memoryAbout,
  });
}
