import type { CSSProperties } from "react";
import type { HeritageHeroFrame } from "@/components/dev/heroLayoutStudioState";
import type { LayoutStudioBreakpoint } from "@/lib/layoutBreakpoints";
import { heritageHeroStudioCssVars } from "@/components/dev/heroLayoutStudioState";
import {
  clampCopyOffsetFields,
  copyOffsetStyle,
  migrateCopyOffsetFields,
} from "@/lib/copyLayoutOffset";
import { RECORD_HERO_STUDIO_DEFAULTS } from "@/lib/legacy/recordHeroFrame";
import { LAYOUT_CANONICAL } from "@/lib/layoutCanonical";

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
  /** Phone (≤639px) */
  offsetXPhone: number;
  offsetYPhone: number;
  copyLiftPhone: number;
  columnMaxWidthRemPhone: number;
  contentIndentRemPhone: number;
  emailMaxWidthRemPhone: number;
  subtitleMaxWidthRemPhone: number;
  /** Tablet (810–1199px) */
  offsetXTablet: number;
  offsetYTablet: number;
  copyLiftTablet: number;
  columnMaxWidthRemTablet: number;
  contentIndentRemTablet: number;
  emailMaxWidthRemTablet: number;
  subtitleMaxWidthRemTablet: number;
  /** @deprecated → offsetXPhone */
  offsetXMobile?: number;
  offsetYMobile?: number;
  copyLiftMobile?: number;
  columnMaxWidthRemMobile?: number;
  contentIndentRemMobile?: number;
  emailMaxWidthRemMobile?: number;
  subtitleMaxWidthRemMobile?: number;
};

export const RECORD_PAGE_PHONE_DEFAULTS = LAYOUT_CANONICAL.recordPage.phone;

export const RECORD_PAGE_TABLET_DEFAULTS = LAYOUT_CANONICAL.recordPage.tablet;

/** @deprecated use RECORD_PAGE_PHONE_DEFAULTS */
export const RECORD_PAGE_MOBILE_DEFAULTS = RECORD_PAGE_PHONE_DEFAULTS;

export const RECORD_PAGE_STUDIO_DEFAULTS: RecordPageStudioFrame = {
  ...RECORD_HERO_STUDIO_DEFAULTS,
  ...LAYOUT_CANONICAL.recordPage.desktop,
  ...RECORD_PAGE_TABLET_DEFAULTS,
  ...RECORD_PAGE_PHONE_DEFAULTS,
};

function phoneFieldsFromLegacy(parsed: Partial<RecordPageStudioFrame>) {
  return {
    offsetXPhone: parsed.offsetXPhone ?? parsed.offsetXMobile ?? RECORD_PAGE_PHONE_DEFAULTS.offsetXPhone,
    offsetYPhone: parsed.offsetYPhone ?? parsed.offsetYMobile ?? RECORD_PAGE_PHONE_DEFAULTS.offsetYPhone,
    copyLiftPhone: parsed.copyLiftPhone ?? parsed.copyLiftMobile ?? RECORD_PAGE_PHONE_DEFAULTS.copyLiftPhone,
    columnMaxWidthRemPhone:
      parsed.columnMaxWidthRemPhone ??
      parsed.columnMaxWidthRemMobile ??
      RECORD_PAGE_PHONE_DEFAULTS.columnMaxWidthRemPhone,
    contentIndentRemPhone:
      parsed.contentIndentRemPhone ??
      parsed.contentIndentRemMobile ??
      RECORD_PAGE_PHONE_DEFAULTS.contentIndentRemPhone,
    emailMaxWidthRemPhone:
      parsed.emailMaxWidthRemPhone ??
      parsed.emailMaxWidthRemMobile ??
      RECORD_PAGE_PHONE_DEFAULTS.emailMaxWidthRemPhone,
    subtitleMaxWidthRemPhone:
      parsed.subtitleMaxWidthRemPhone ??
      parsed.subtitleMaxWidthRemMobile ??
      RECORD_PAGE_PHONE_DEFAULTS.subtitleMaxWidthRemPhone,
  };
}

export function recordPageFrameForViewport(
  frame: RecordPageStudioFrame,
  breakpoint: LayoutStudioBreakpoint,
): RecordPageStudioFrame {
  if (breakpoint === "desktop") return frame;
  if (breakpoint === "tablet") {
    return {
      ...frame,
      offsetX: frame.offsetXTablet,
      offsetY: frame.offsetYTablet,
      copyLift: frame.copyLiftTablet,
      columnMaxWidthRem: frame.columnMaxWidthRemTablet,
      contentIndentRem: frame.contentIndentRemTablet,
      emailMaxWidthRem: frame.emailMaxWidthRemTablet,
      subtitleMaxWidthRem: frame.subtitleMaxWidthRemTablet,
    };
  }
  return {
    ...frame,
    offsetX: frame.offsetXPhone,
    offsetY: frame.offsetYPhone,
    copyLift: frame.copyLiftPhone,
    columnMaxWidthRem: frame.columnMaxWidthRemPhone,
    contentIndentRem: frame.contentIndentRemPhone,
    emailMaxWidthRem: frame.emailMaxWidthRemPhone,
    subtitleMaxWidthRem: frame.subtitleMaxWidthRemPhone,
  };
}

/** @deprecated use recordPageFrameForViewport(frame, 'phone') */
export function recordPageFrameForViewportLegacy(
  frame: RecordPageStudioFrame,
  mobile: boolean,
): RecordPageStudioFrame {
  return recordPageFrameForViewport(frame, mobile ? "phone" : "desktop");
}

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
    const parsed = JSON.parse(raw) as Partial<RecordPageStudioFrame>;
    return clampRecordStudioFrame({
      ...RECORD_PAGE_STUDIO_DEFAULTS,
      ...migrateCopyOffsetFields(parsed),
      offsetXTablet: parsed.offsetXTablet ?? RECORD_PAGE_TABLET_DEFAULTS.offsetXTablet,
      offsetYTablet: parsed.offsetYTablet ?? RECORD_PAGE_TABLET_DEFAULTS.offsetYTablet,
      copyLiftTablet: parsed.copyLiftTablet ?? RECORD_PAGE_TABLET_DEFAULTS.copyLiftTablet,
      columnMaxWidthRemTablet:
        parsed.columnMaxWidthRemTablet ?? RECORD_PAGE_TABLET_DEFAULTS.columnMaxWidthRemTablet,
      contentIndentRemTablet:
        parsed.contentIndentRemTablet ?? RECORD_PAGE_TABLET_DEFAULTS.contentIndentRemTablet,
      emailMaxWidthRemTablet:
        parsed.emailMaxWidthRemTablet ?? RECORD_PAGE_TABLET_DEFAULTS.emailMaxWidthRemTablet,
      subtitleMaxWidthRemTablet:
        parsed.subtitleMaxWidthRemTablet ?? RECORD_PAGE_TABLET_DEFAULTS.subtitleMaxWidthRemTablet,
      ...phoneFieldsFromLegacy(parsed),
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
  "min-[1200px]:pl-[var(--record-content-indent,var(--beiza-content-indent,1rem))] min-[1200px]:pr-[var(--record-content-indent,var(--beiza-content-indent,1rem))]";
