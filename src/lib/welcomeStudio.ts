import type { BeizaLocale } from "@/lib/locale/types";
import welcomeGateCanonical from "@/data/welcome-gate-canonical.json";
import { migrateCopyOffsetFields } from "@/lib/copyLayoutOffset";
import { looksLikePxOffset, pxToVh } from "@/lib/layoutOffsetUnits";

export const STUDIO_KEY = "welcome-gate-studio";

export type CardStudio = { imageZoom: number; imageOffsetX: number; imageOffsetY: number };

export type LocaleCardStudio = {
  legacy: CardStudio;
  education: CardStudio;
  farewell: CardStudio;
};

/** Vertical language rail — dots, active label row, sun button */
export type LocaleRailLayout = {
  /** Inactive gray dot diameter (px) */
  dotSizePx: number;
  /** Active yellow dot diameter (px) — center stays on the vertical rail */
  activeDotSizePx: number;
  /** Space between inactive dot rows (px) */
  dotStackGapPx: number;
  /** Gap between flag/code block and yellow dot (px) */
  labelToDotGapPx: number;
  flagWidthPx: number;
  flagHeightPx: number;
  labelFontPx: number;
  sunSizePx: number;
  sunIconPx: number;
  /** Auto-advance interval when locale is not pinned (seconds) */
  autoRotateSec: number;
  /** Studio aid: show GH/EN/… beside gray dots (off in production handoff) */
  showInactiveCodes: boolean;
  /** Shift whole rail cluster left (+) or right (-) from right anchor (rem) */
  railNudgeXRem: number;
  /** Shift labels/flags left (+) or right (-) relative to dot axis (rem) */
  labelNudgeXRem: number;
  /** Shift dot column left (+) or right (-) — does not move the sun (rem) */
  axisNudgeXRem: number;
  /** Shift sun only — horizontal, positive = left (rem) */
  sunAxisNudgeXRem: number;
  /** Shift sun only — vertical separation from dots, positive = down (rem) */
  sunAxisNudgeYRem: number;
  /** Gap between inactive code and gray dot (px) */
  inactiveLabelGapPx: number;
};

/** Pin + theme stack beside the vertical language rail */
export type ToolbarControlsLayout = {
  /** Distance from viewport right edge (rem) */
  railRightRem: number;
  /** Vertical anchor for the rail cluster (% from top, 50 = centered) */
  railTopPct: number;
  /** @deprecated use localeRail.dotStackGapPx — kept for JSON paste compat */
  railDotsGapPx: number;
  /** Gap between dot column and sun button (px) */
  controlsGapPx: number;
  /** Nudge pin/theme block horizontally from rail (rem, positive = left) */
  controlsOffsetXRem: number;
  /** Extra space below the rail before pin/theme (px) */
  controlsOffsetYPx: number;
  /** Gap between pin and theme buttons (px) */
  controlsButtonGapPx: number;
};

/** Phone (≤809px) — horizontal swipe carousel (one card + peek). */
export type WelcomePhoneLayout = {
  /** Card width as % of viewport — ~82vw shows a peek of the next card */
  cardWidthVw: number;
  /** Side padding on the carousel row (rem) — creates edge peek */
  carouselInsetRem: number;
  /** Gap between cards (rem) */
  cardGapRem: number;
  /** Padding after last card — clears bottom locale rail (rem) */
  scrollPaddingEndRem: number;
  /** @deprecated stacked layout — use cardWidthVw */
  cardMaxWidthRem: number;
  /** @deprecated stacked layout — carousel uses 3:4 aspect */
  cardHeightVh: number;
  /** @deprecated use scrollPaddingEndRem */
  scrollPaddingBottomRem: number;
};

export type StudioGlobal = {
  iconOffsetY: number;
  /** Copy shift vw / vh on welcome cards */
  copyOffsetX: number;
  copyOffsetY: number;
  copyLift: number;
  showIconCircleBg: boolean;
  logoScale: number;
  useMascot: boolean;
  lockCardLinks: boolean;
  /** Dark pill track behind the vertical language column */
  showLocaleRailBg: boolean;
  localeRail: LocaleRailLayout;
  toolbar: ToolbarControlsLayout;
  phone: WelcomePhoneLayout;
};

/** Per-locale card crops + shared global layout controls */
export type WelcomeStudioStore = {
  global: StudioGlobal;
  locales: Record<BeizaLocale, LocaleCardStudio>;
};

export type StudioState = LocaleCardStudio & StudioGlobal;

export const DEFAULT_LOCALE_RAIL_LAYOUT: LocaleRailLayout = {
  dotSizePx: 18,
  activeDotSizePx: 20,
  dotStackGapPx: 16,
  labelToDotGapPx: 12,
  flagWidthPx: 22,
  flagHeightPx: 16,
  labelFontPx: 16,
  sunSizePx: 78,
  sunIconPx: 32,
  autoRotateSec: 5,
  showInactiveCodes: false,
  railNudgeXRem: 0,
  labelNudgeXRem: 0,
  axisNudgeXRem: 0,
  sunAxisNudgeXRem: 0,
  sunAxisNudgeYRem: 0,
  inactiveLabelGapPx: 8,
};

export const DEFAULT_TOOLBAR_LAYOUT: ToolbarControlsLayout = {
  railRightRem: 1.75,
  railTopPct: 50,
  railDotsGapPx: 6,
  controlsGapPx: 0,
  controlsOffsetXRem: 0,
  controlsOffsetYPx: 0,
  controlsButtonGapPx: 6,
};

export const DEFAULT_PHONE_LAYOUT: WelcomePhoneLayout = {
  cardWidthVw: 82,
  carouselInsetRem: 1.5,
  cardGapRem: 0.75,
  scrollPaddingEndRem: 1.5,
  cardMaxWidthRem: 20,
  cardHeightVh: 0,
  scrollPaddingBottomRem: 6,
};

/** From `src/data/welcome-gate-canonical.json` — edit JSON, not this file. */
export const DEFAULT_STUDIO_GLOBAL = welcomeGateCanonical.global as StudioGlobal;

export const DEFAULT_STUDIO_BY_LOCALE = welcomeGateCanonical.locales as Record<
  BeizaLocale,
  LocaleCardStudio
>;

export const DEFAULT_STUDIO_STORE: WelcomeStudioStore = {
  global: DEFAULT_STUDIO_GLOBAL,
  locales: DEFAULT_STUDIO_BY_LOCALE,
};

function migrateIconOffsetY(value: number): number {
  if (value > 100) return Math.min(100, Math.round((value / 200) * 100));
  if (value < 0) return Math.max(0, Math.round(((value + 200) / 400) * 100));
  return value;
}

function normalizeCard(
  card: (Partial<CardStudio> & { iconOffsetY?: number }) | undefined,
  fallback: CardStudio,
): CardStudio {
  const { iconOffsetY: _drop, ...rest } = card ?? {};
  return { ...fallback, ...rest };
}

function normalizeLocaleCards(
  raw: Partial<LocaleCardStudio> | undefined,
  fallback: LocaleCardStudio,
): LocaleCardStudio {
  return {
    legacy: normalizeCard(raw?.legacy, fallback.legacy),
    education: normalizeCard(raw?.education, fallback.education),
    farewell: normalizeCard(raw?.farewell, fallback.farewell),
  };
}

function normalizeToolbarLayout(raw: Partial<ToolbarControlsLayout> | undefined): ToolbarControlsLayout {
  return { ...DEFAULT_TOOLBAR_LAYOUT, ...raw };
}

function normalizePhoneLayout(raw: Partial<WelcomePhoneLayout> | undefined): WelcomePhoneLayout {
  const merged = { ...DEFAULT_PHONE_LAYOUT, ...raw };
  if (raw?.scrollPaddingBottomRem != null && raw.scrollPaddingEndRem === undefined) {
    merged.scrollPaddingEndRem = raw.scrollPaddingBottomRem;
  }
  return merged;
}

function normalizeLocaleRailLayout(
  raw: Partial<LocaleRailLayout> | undefined,
  toolbar?: Partial<ToolbarControlsLayout>,
): LocaleRailLayout {
  const base = { ...DEFAULT_LOCALE_RAIL_LAYOUT, ...raw };
  if (typeof toolbar?.railDotsGapPx === "number" && raw?.dotStackGapPx === undefined) {
    base.dotStackGapPx = toolbar.railDotsGapPx;
  }
  if (raw?.activeDotSizePx === undefined) {
    base.activeDotSizePx = Math.max(base.dotSizePx + 4, Math.round(base.dotSizePx * 1.33));
  }
  return base;
}

function normalizeGlobal(raw: Partial<StudioGlobal> | undefined): StudioGlobal {
  const { toolbar: toolbarRaw, localeRail: localeRailRaw, phone: phoneRaw, ...rest } = raw ?? {};
  const toolbar = normalizeToolbarLayout(toolbarRaw);
  const migrated = migrateCopyOffsetFields({
    offsetX: rest.copyOffsetX,
    offsetY: rest.copyOffsetY,
    copyLift: rest.copyLift,
  });
  const copyLift =
    typeof migrated.copyLift === "number"
      ? migrated.copyLift
      : typeof rest.copyLift === "number" && looksLikePxOffset(rest.copyLift)
        ? pxToVh(rest.copyLift)
        : DEFAULT_STUDIO_GLOBAL.copyLift;
  return {
    ...DEFAULT_STUDIO_GLOBAL,
    ...rest,
    copyOffsetX: rest.copyOffsetX ?? migrated.offsetX ?? 0,
    copyOffsetY: rest.copyOffsetY ?? migrated.offsetY ?? 0,
    copyLift,
    toolbar,
    localeRail: normalizeLocaleRailLayout(localeRailRaw, toolbarRaw),
    phone: normalizePhoneLayout(phoneRaw),
  };
}

function normalizeFullStore(raw: Record<string, unknown>): WelcomeStudioStore {
  const globalRaw = raw.global as Partial<StudioGlobal> | undefined;
  const localesRaw = remapStudioLocaleKeys(
    raw.locales as Partial<Record<string, Partial<LocaleCardStudio>>> | undefined,
  );

  const locales = { ...DEFAULT_STUDIO_BY_LOCALE };
  (Object.keys(DEFAULT_STUDIO_BY_LOCALE) as BeizaLocale[]).forEach((locale) => {
    locales[locale] = normalizeLocaleCards(localesRaw?.[locale], DEFAULT_STUDIO_BY_LOCALE[locale]);
  });

  return {
    global: normalizeGlobal(globalRaw),
    locales,
  };
}

/** Old flat single-locale blob → assign to `black-american` only */
function migrateFlatStudio(raw: Record<string, unknown>): WelcomeStudioStore | null {
  if (raw.global && raw.locales) return null;
  if (!raw.legacy && !raw.education && !raw.farewell) return null;
  const legacyIcon = (raw.legacy as { iconOffsetY?: number } | undefined)?.iconOffsetY;
  const iconOffsetY = migrateIconOffsetY(
    (raw.iconOffsetY as number | undefined) ??
      legacyIcon ??
      DEFAULT_STUDIO_GLOBAL.iconOffsetY,
  );
  return {
    global: normalizeGlobal({
      iconOffsetY,
      copyLift: typeof raw.copyLift === "number" ? raw.copyLift : DEFAULT_STUDIO_GLOBAL.copyLift,
      showIconCircleBg:
        typeof raw.showIconCircleBg === "boolean"
          ? raw.showIconCircleBg
          : DEFAULT_STUDIO_GLOBAL.showIconCircleBg,
      logoScale: typeof raw.logoScale === "number" ? raw.logoScale : DEFAULT_STUDIO_GLOBAL.logoScale,
      useMascot: typeof raw.useMascot === "boolean" ? raw.useMascot : DEFAULT_STUDIO_GLOBAL.useMascot,
      lockCardLinks:
        typeof raw.lockCardLinks === "boolean" ? raw.lockCardLinks : DEFAULT_STUDIO_GLOBAL.lockCardLinks,
      toolbar: raw.toolbar as Partial<ToolbarControlsLayout> | undefined,
    }),
    locales: {
      ...DEFAULT_STUDIO_BY_LOCALE,
      "black-american": normalizeLocaleCards(
        {
          legacy: raw.legacy as Partial<CardStudio>,
          education: raw.education as Partial<CardStudio>,
          farewell: raw.farewell as Partial<CardStudio>,
        },
        DEFAULT_STUDIO_BY_LOCALE["black-american"],
      ),
    },
  };
}

function remapStudioLocaleKeys(
  raw: Partial<Record<string, Partial<LocaleCardStudio>>> | undefined,
): Partial<Record<BeizaLocale, Partial<LocaleCardStudio>>> | undefined {
  if (!raw) return undefined;
  const out = { ...raw } as Partial<Record<BeizaLocale, Partial<LocaleCardStudio>>>;
  if (raw.en && !out["black-american"]) out["black-american"] = raw.en;
  if (raw.india && !out.indian) out.indian = raw.india;
  return out;
}

export function parseWelcomeStudioJson(text: string): WelcomeStudioStore {
  const raw = JSON.parse(text) as Record<string, unknown>;
  if (raw.global && raw.locales) return normalizeFullStore(raw);
  const flat = migrateFlatStudio(raw);
  if (flat) return flat;
  throw new Error("JSON must include { global, locales } or legacy/education/farewell card keys.");
}

export function loadWelcomeStudioStore(): WelcomeStudioStore {
  try {
    const stored = localStorage.getItem(STUDIO_KEY);
    if (!stored) return DEFAULT_STUDIO_STORE;
    return parseWelcomeStudioJson(stored);
  } catch {
    return DEFAULT_STUDIO_STORE;
  }
}

export function resetWelcomeStudioStore(): WelcomeStudioStore {
  localStorage.removeItem(STUDIO_KEY);
  return DEFAULT_STUDIO_STORE;
}

export function saveWelcomeStudioStore(store: WelcomeStudioStore) {
  localStorage.setItem(STUDIO_KEY, JSON.stringify(store));
}

export function studioStateForLocale(store: WelcomeStudioStore, locale: BeizaLocale): StudioState {
  return { ...store.global, ...store.locales[locale] };
}

export function patchLocaleCard(
  store: WelcomeStudioStore,
  locale: BeizaLocale,
  card: keyof LocaleCardStudio,
  partial: Partial<CardStudio>,
): WelcomeStudioStore {
  return {
    ...store,
    locales: {
      ...store.locales,
      [locale]: {
        ...store.locales[locale],
        [card]: { ...store.locales[locale][card], ...partial },
      },
    },
  };
}

export function patchStudioGlobal(
  store: WelcomeStudioStore,
  partial: Partial<StudioGlobal>,
): WelcomeStudioStore {
  const { toolbar: toolbarPartial, localeRail: localeRailPartial, phone: phonePartial, ...rest } =
    partial;
  return {
    ...store,
    global: {
      ...store.global,
      ...rest,
      toolbar: toolbarPartial
        ? { ...store.global.toolbar, ...toolbarPartial }
        : store.global.toolbar,
      localeRail: localeRailPartial
        ? { ...store.global.localeRail, ...localeRailPartial }
        : store.global.localeRail,
      phone: phonePartial ? { ...store.global.phone, ...phonePartial } : store.global.phone,
    },
  };
}
