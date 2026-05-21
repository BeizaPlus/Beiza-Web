import type { CSSProperties } from "react";
import type { HeritageHeroFrame } from "@/components/dev/heroLayoutStudioState";
import { heritageHeroStudioCssVars } from "@/components/dev/heroLayoutStudioState";
import {
  clampCopyOffsetFields,
  copyOffsetStyle,
  migrateCopyOffsetFields,
} from "@/lib/copyLayoutOffset";
import { RECORD_HERO_STUDIO_DEFAULTS } from "@/lib/legacy/recordHeroFrame";

/** Full record station layout — copy column, email, hero (localhost / ?studio=1) */
export type RecordPageStudioFrame = HeritageHeroFrame & {
  /** Copy column shift — vw (viewport width %) */
  offsetX: number;
  /** Copy column shift — vh (viewport height %) */
  offsetY: number;
  /** Lift copy block — vh */
  copyLift: number;
  /** Main copy column max width (rem) */
  columnMaxWidthRem: number;
  /** Inner indent inside site boundary (rem) — cyan guide equivalent */
  contentIndentRem: number;
  /** Email field max width (rem) */
  emailMaxWidthRem: number;
  /** Subtitle paragraph max width (rem) */
  subtitleMaxWidthRem: number;
};

export const RECORD_PAGE_STUDIO_DEFAULTS: RecordPageStudioFrame = {
  ...RECORD_HERO_STUDIO_DEFAULTS,
  offsetX: 12.5,
  offsetY: 0,
  copyLift: 0,
  columnMaxWidthRem: 32,
  contentIndentRem: 0,
  emailMaxWidthRem: 28.25,
  subtitleMaxWidthRem: 24.75,
};

const STORAGE_KEY = "beiza-record-page-studio";

function clampRecordStudioFrame(frame: RecordPageStudioFrame): RecordPageStudioFrame {
  return {
    ...clampCopyOffsetFields(frame),
    posX: Math.min(100, Math.max(0, frame.posX)),
    posY: Math.min(100, Math.max(0, frame.posY)),
    scale: Math.min(140, Math.max(80, frame.scale)),
    overlayStrength: Math.min(85, Math.max(35, frame.overlayStrength)),
  };
}

export function loadRecordPageStudioFrame(): RecordPageStudioFrame {
  if (typeof window === "undefined") return { ...RECORD_PAGE_STUDIO_DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...RECORD_PAGE_STUDIO_DEFAULTS };
    return clampRecordStudioFrame({
      ...RECORD_PAGE_STUDIO_DEFAULTS,
      ...migrateCopyOffsetFields(JSON.parse(raw) as Partial<RecordPageStudioFrame>),
    });
  } catch {
    return { ...RECORD_PAGE_STUDIO_DEFAULTS };
  }
}

export function saveRecordPageStudioFrame(frame: RecordPageStudioFrame) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(frame));
}

export function recordPageStudioToJson(frame: RecordPageStudioFrame) {
  return JSON.stringify(
    {
      savedAt: new Date().toISOString(),
      label: "Beiza record page · paste into RECORD_PAGE_STUDIO_DEFAULTS",
      RECORD_PAGE_STUDIO_DEFAULTS: frame,
      recordPage: frame,
    },
    null,
    2,
  );
}

export function recordPageShellCssVars(frame: RecordPageStudioFrame): CSSProperties {
  return {
    ...heritageHeroStudioCssVars(frame),
    "--record-content-indent": `${frame.contentIndentRem}rem`,
    "--record-column-max": `${frame.columnMaxWidthRem}rem`,
    "--record-email-max": `${frame.emailMaxWidthRem}rem`,
    "--record-subtitle-max": `${frame.subtitleMaxWidthRem}rem`,
  } as CSSProperties;
}

export function recordColumnLayoutStyle(
  frame: Pick<RecordPageStudioFrame, "offsetX" | "offsetY" | "copyLift" | "columnMaxWidthRem">,
): CSSProperties {
  return {
    maxWidth: `${frame.columnMaxWidthRem}rem`,
    ...copyOffsetStyle(frame),
  };
}

export const recordContentIndentX =
  "pl-[var(--record-content-indent,var(--beiza-content-indent,1rem))] pr-[var(--record-content-indent,var(--beiza-content-indent,1rem))]";
