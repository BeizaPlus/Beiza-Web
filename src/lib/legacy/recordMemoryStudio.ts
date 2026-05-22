import type { CSSProperties } from "react";
import {
  clampCopyOffsetFields,
  copyOffsetStyle,
  migrateCopyOffsetFields,
  type CopyOffsetFields,
} from "@/lib/copyLayoutOffset";

export type RecordMemorySubsetId = "playback" | "upload" | "seal" | "cta";

export type RecordMemoryStudioFrame = {
  /** Safe padding inside the recording station (vw) — keeps HUD off viewport sides */
  stationInsetVw: number;
  /** Safe padding from bottom (vh) */
  stationInsetBottomVh: number;
  subsets: Record<RecordMemorySubsetId, CopyOffsetFields>;
};

const ZERO_OFFSET: CopyOffsetFields = { offsetX: 0, offsetY: 0, copyLift: 0 };

export const RECORD_MEMORY_STUDIO_DEFAULTS: RecordMemoryStudioFrame = {
  stationInsetVw: 2,
  stationInsetBottomVh: 4,
  subsets: {
    playback: { ...ZERO_OFFSET },
    upload: { ...ZERO_OFFSET },
    seal: { ...ZERO_OFFSET },
    cta: { ...ZERO_OFFSET },
  },
};

const STORAGE_KEY = "beiza-record-memory-studio";

export function loadRecordMemoryStudioFrame(): RecordMemoryStudioFrame {
  if (typeof window === "undefined") return { ...RECORD_MEMORY_STUDIO_DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...RECORD_MEMORY_STUDIO_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<RecordMemoryStudioFrame>;
    const subsets = { ...RECORD_MEMORY_STUDIO_DEFAULTS.subsets };
    if (parsed.subsets && typeof parsed.subsets === "object") {
      for (const key of Object.keys(subsets) as RecordMemorySubsetId[]) {
        const partial = parsed.subsets[key];
        if (partial) {
          subsets[key] = clampCopyOffsetFields({
            ...subsets[key],
            ...migrateCopyOffsetFields(partial),
          });
        }
      }
    }
    const legacyInsetRem =
      typeof parsed.stationInsetRem === "number" ? parsed.stationInsetRem : undefined;
    const legacyBottomRem =
      typeof parsed.stationInsetBottomRem === "number" ? parsed.stationInsetBottomRem : undefined;

    return {
      ...RECORD_MEMORY_STUDIO_DEFAULTS,
      stationInsetVw:
        typeof parsed.stationInsetVw === "number"
          ? parsed.stationInsetVw
          : legacyInsetRem != null
            ? legacyInsetRem * 2
            : RECORD_MEMORY_STUDIO_DEFAULTS.stationInsetVw,
      stationInsetBottomVh:
        typeof parsed.stationInsetBottomVh === "number"
          ? parsed.stationInsetBottomVh
          : legacyBottomRem != null
            ? legacyBottomRem * 3
            : RECORD_MEMORY_STUDIO_DEFAULTS.stationInsetBottomVh,
      subsets,
    };
  } catch {
    return { ...RECORD_MEMORY_STUDIO_DEFAULTS };
  }
}

export function saveRecordMemoryStudioFrame(frame: RecordMemoryStudioFrame) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(frame));
}

export function recordMemorySubsetStyle(
  frame: RecordMemoryStudioFrame,
  id: RecordMemorySubsetId,
): CSSProperties {
  return copyOffsetStyle(frame.subsets[id]);
}

export function recordMemoryStationInsetStyle(frame: RecordMemoryStudioFrame): CSSProperties {
  return {
    ["--record-hud-inset-x" as string]: `${frame.stationInsetVw}vw`,
    ["--record-hud-inset-bottom" as string]: `${frame.stationInsetBottomVh}vh`,
  } as CSSProperties;
}

export function recordMemoryStudioToJson(frame: RecordMemoryStudioFrame) {
  return JSON.stringify(
    {
      savedAt: new Date().toISOString(),
      label: "Beiza record memory HUD · paste into RECORD_MEMORY_STUDIO_DEFAULTS",
      RECORD_MEMORY_STUDIO_DEFAULTS: frame,
    },
    null,
    2,
  );
}

export const RECORD_MEMORY_SUBSET_LABELS: Record<RecordMemorySubsetId, string> = {
  playback: "Playback bar",
  upload: "Seal form (title + who)",
  seal: "Memory preserved",
  cta: "Mic & prompt (hero)",
};
