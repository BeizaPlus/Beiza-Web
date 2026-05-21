import type { BeizaLocale } from "@/lib/locale/types";

export const STUDIO_KEY = "welcome-gate-studio";

export type CardStudio = { imageZoom: number; imageOffsetX: number; imageOffsetY: number };

export type LocaleCardStudio = {
  legacy: CardStudio;
  education: CardStudio;
  farewell: CardStudio;
};

export type StudioGlobal = {
  iconOffsetY: number;
  copyLift: number;
  showIconCircleBg: boolean;
  logoScale: number;
  useMascot: boolean;
  lockCardLinks: boolean;
};

/** Per-locale card crops + shared global layout controls */
export type WelcomeStudioStore = {
  global: StudioGlobal;
  locales: Record<BeizaLocale, LocaleCardStudio>;
};

export type StudioState = LocaleCardStudio & StudioGlobal;

export const DEFAULT_STUDIO_GLOBAL: StudioGlobal = {
  iconOffsetY: 92,
  copyLift: 38,
  showIconCircleBg: false,
  logoScale: 2.25,
  useMascot: true,
  lockCardLinks: true,
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
      imageOffsetX: 58.4459550865801,
      imageOffsetY: 18.518849206349202,
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
      imageOffsetX: 18.707048160173173,
      imageOffsetY: 15.13681457431457,
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
      imageOffsetX: 35.27901785714287,
      imageOffsetY: 23.1409632034632,
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
      imageZoom: 1.73,
      imageOffsetX: 35.27901785714287,
      imageOffsetY: 23.1409632034632,
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

/** Old flat single-locale blob → assign to `en` only */
function migrateFlatStudio(raw: Record<string, unknown>): WelcomeStudioStore | null {
  if (!raw.legacy && !raw.education && !raw.farewell) return null;
  const legacyIcon = (raw.legacy as { iconOffsetY?: number } | undefined)?.iconOffsetY;
  const iconOffsetY = migrateIconOffsetY(
    (raw.iconOffsetY as number | undefined) ??
      legacyIcon ??
      DEFAULT_STUDIO_GLOBAL.iconOffsetY,
  );
  return {
    global: {
      ...DEFAULT_STUDIO_GLOBAL,
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
    },
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

export function loadWelcomeStudioStore(): WelcomeStudioStore {
  try {
    const raw = JSON.parse(localStorage.getItem(STUDIO_KEY) ?? "{}") as Record<string, unknown>;

    const flat = migrateFlatStudio(raw);
    if (flat) return flat;

    const globalRaw = raw.global as Partial<StudioGlobal> | undefined;
    const localesRaw = remapStudioLocaleKeys(
      raw.locales as Partial<Record<string, Partial<LocaleCardStudio>>> | undefined,
    );

    const legacyIcon = localesRaw?.["black-american"]?.legacy as { iconOffsetY?: number } | undefined;
    const iconOffsetY = migrateIconOffsetY(
      globalRaw?.iconOffsetY ?? legacyIcon?.iconOffsetY ?? DEFAULT_STUDIO_GLOBAL.iconOffsetY,
    );

    const locales = { ...DEFAULT_STUDIO_BY_LOCALE };
    (Object.keys(DEFAULT_STUDIO_BY_LOCALE) as BeizaLocale[]).forEach((locale) => {
      locales[locale] = normalizeLocaleCards(localesRaw?.[locale], DEFAULT_STUDIO_BY_LOCALE[locale]);
    });

    return {
      global: {
        ...DEFAULT_STUDIO_GLOBAL,
        ...globalRaw,
        iconOffsetY,
      },
      locales,
    };
  } catch {
    return DEFAULT_STUDIO_STORE;
  }
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
  return { ...store, global: { ...store.global, ...partial } };
}
