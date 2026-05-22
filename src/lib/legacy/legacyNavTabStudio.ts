import type { CSSProperties } from "react";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import {
  clampCopyOffsetFields,
  copyOffsetStyle,
  migrateCopyOffsetFields,
  type CopyOffsetFields,
} from "@/lib/copyLayoutOffset";

export const LEGACY_NAV_TAB_HREFS = [
  BEIZA_LINKS.legacy.app,
  BEIZA_LINKS.legacy.circle,
  BEIZA_LINKS.legacy.recordStation,
  BEIZA_LINKS.legacy.vault,
  BEIZA_LINKS.legacy.family,
] as const;

export type LegacyNavTabHref = (typeof LEGACY_NAV_TAB_HREFS)[number];

export type LegacyNavTabStudioFrame = Record<LegacyNavTabHref, CopyOffsetFields>;

const ZERO: CopyOffsetFields = { offsetX: 0, offsetY: 0, copyLift: 0 };

export const LEGACY_NAV_TAB_STUDIO_DEFAULTS: LegacyNavTabStudioFrame = {
  [BEIZA_LINKS.legacy.app]: { ...ZERO },
  [BEIZA_LINKS.legacy.circle]: { ...ZERO },
  [BEIZA_LINKS.legacy.recordStation]: { ...ZERO },
  [BEIZA_LINKS.legacy.vault]: { ...ZERO },
  [BEIZA_LINKS.legacy.family]: { ...ZERO },
};

const STORAGE_KEY = "beiza-legacy-nav-tab-studio";

function migrateTabFrame(raw: Record<string, unknown>): LegacyNavTabStudioFrame {
  const next = { ...LEGACY_NAV_TAB_STUDIO_DEFAULTS };
  for (const href of LEGACY_NAV_TAB_HREFS) {
    const partial = raw[href];
    if (partial && typeof partial === "object") {
      next[href] = clampCopyOffsetFields({
        ...next[href],
        ...migrateCopyOffsetFields(partial as Partial<CopyOffsetFields>),
      });
    }
  }
  return next;
}

export function loadLegacyNavTabStudioFrame(): LegacyNavTabStudioFrame {
  if (typeof window === "undefined") return { ...LEGACY_NAV_TAB_STUDIO_DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...LEGACY_NAV_TAB_STUDIO_DEFAULTS };
    return migrateTabFrame(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return { ...LEGACY_NAV_TAB_STUDIO_DEFAULTS };
  }
}

export function saveLegacyNavTabStudioFrame(frame: LegacyNavTabStudioFrame) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(frame));
}

export function legacyNavTabOffsetStyle(
  frame: LegacyNavTabStudioFrame,
  href: string,
): CSSProperties {
  const offsets = frame[href as LegacyNavTabHref];
  if (!offsets) return {};
  return copyOffsetStyle(offsets);
}

export const LEGACY_NAV_TAB_LABELS: Record<LegacyNavTabHref, string> = {
  [BEIZA_LINKS.legacy.app]: "Home",
  [BEIZA_LINKS.legacy.circle]: "Tree",
  [BEIZA_LINKS.legacy.recordStation]: "Record",
  [BEIZA_LINKS.legacy.vault]: "Vault",
  [BEIZA_LINKS.legacy.family]: "Invite",
};
