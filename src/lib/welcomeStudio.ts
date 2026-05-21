import type { BeizaLocale } from "@/lib/locale/types";
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
  /** Shift dot column + sun vertical axis left (+) or right (-) (rem) */
  axisNudgeXRem: number;
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
};

/** Per-locale card crops + shared global layout controls */
export type WelcomeStudioStore = {
  global: StudioGlobal;
  locales: Record<BeizaLocale, LocaleCardStudio>;
};

export type StudioState = LocaleCardStudio & StudioGlobal;

export const DEFAULT_LOCALE_RAIL_LAYOUT: LocaleRailLayout = {
  dotSizePx: 12,
  activeDotSizePx: 16,
  dotStackGapPx: 6,
  labelToDotGapPx: 12,
  flagWidthPx: 17,
  flagHeightPx: 13,
  labelFontPx: 14,
  sunSizePx: 62,
  sunIconPx: 28,
  autoRotateSec: 5,
  showInactiveCodes: false,
  railNudgeXRem: 0,
  labelNudgeXRem: 0,
  axisNudgeXRem: 0,
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

export const DEFAULT_STUDIO_GLOBAL: StudioGlobal = {
  iconOffsetY: 6,
  copyOffsetX: 0,
  copyOffsetY: 0,
  copyLift: 3,
  showIconCircleBg: false,
  logoScale: 2.25,
  useMascot: true,
  lockCardLinks: false,
  showLocaleRailBg: false,
  localeRail: DEFAULT_LOCALE_RAIL_LAYOUT,
  toolbar: DEFAULT_TOOLBAR_LAYOUT,
};

/** Production defaults — tuned per character (welcome gate center card) */
export const DEFAULT_STUDIO_BY_LOCALE: Record<BeizaLocale, LocaleCardStudio> = {
  "black-american": {
    legacy: {
      imageZoom: 1.71,
      imageOffsetX: 54.89481872294373,
      imageOffsetY: 42.30582611832611,
    },
    education: {
      imageZoom: 2.25,
      imageOffsetX: 24.955212734541828,
      imageOffsetY: 34.49371431708387,
    },
    farewell: {
      imageZoom: 1.71,
      imageOffsetX: 54.882992962632684,
      imageOffsetY: 26.061007957559674,
    },
  },
  indian: {
    legacy: {
      imageZoom: 1.73,
      imageOffsetX: 36.462729978354986,
      imageOffsetY: 27.424873737373733,
    },
    education: {
      imageZoom: 2.06,
      imageOffsetX: 24.873737605896885,
      imageOffsetY: 38.30517801062303,
    },
    farewell: {
      imageZoom: 1.71,
      imageOffsetX: 54.882992962632684,
      imageOffsetY: 26.061007957559674,
    },
  },
  latina: {
    legacy: {
      imageZoom: 1.73,
      imageOffsetX: 56.92403950216452,
      imageOffsetY: 15.587752525252526,
    },
    education: {
      imageZoom: 2.25,
      imageOffsetX: 24.500667279996367,
      imageOffsetY: 31.23613855950811,
    },
    farewell: {
      imageZoom: 1.71,
      imageOffsetX: 52.17736525700498,
      imageOffsetY: 31.021325417877133,
    },
  },
  chinese: {
    legacy: {
      imageZoom: 1.73,
      imageOffsetX: 65.88643127705629,
      imageOffsetY: 29.11589105339105,
    },
    education: {
      imageZoom: 2.25,
      imageOffsetX: 24.7279400072691,
      imageOffsetY: 32.29674462011417,
    },
    farewell: {
      imageZoom: 1.71,
      imageOffsetX: 54.882992962632684,
      imageOffsetY: 26.061007957559674,
    },
  },
  brazilian: {
    legacy: {
      imageZoom: 1.73,
      imageOffsetX: 38.49195075757577,
      imageOffsetY: 12.31845238095238,
    },
    education: {
      imageZoom: 2.25,
      imageOffsetX: 24.955212734541828,
      imageOffsetY: 34.49371431708387,
    },
    farewell: {
      imageZoom: 1.71,
      imageOffsetX: 54.882992962632684,
      imageOffsetY: 26.061007957559674,
    },
  },
  africa: {
    legacy: {
      imageZoom: 1.73,
      imageOffsetX: 74.17241612554112,
      imageOffsetY: 21.337211399711396,
    },
    education: {
      imageZoom: 2.25,
      imageOffsetX: 24.955212734541828,
      imageOffsetY: 34.49371431708387,
    },
    farewell: {
      imageZoom: 1.71,
      imageOffsetX: 54.882992962632684,
      imageOffsetY: 26.061007957559674,
    },
  },
  fr: {
    legacy: {
      imageZoom: 2.11,
      imageOffsetX: 51.309862012987026,
      imageOffsetY: 40.028589466089464,
    },
    education: {
      imageZoom: 2.25,
      imageOffsetX: 24.955212734541828,
      imageOffsetY: 34.49371431708387,
    },
    farewell: {
      imageZoom: 1.71,
      imageOffsetX: 56.23580681544654,
      imageOffsetY: 22.566238837790554,
    },
  },
};

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
  const { toolbar: toolbarRaw, localeRail: localeRailRaw, ...rest } = raw ?? {};
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
  const { toolbar: toolbarPartial, localeRail: localeRailPartial, ...rest } = partial;
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
    },
  };
}
