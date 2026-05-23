/** Shared floating position for layout-studio panels (one at a time on a second display). */
export const STUDIO_PANEL_SHARED_POS_KEY = "beiza-studio-panel-shared-pos";

const PANEL_W = 352;
const PANEL_MIN_TOP = 48;

/** PANELS dock + Layout studio toggle — bottom-right of the current viewport (easy to spot). */
export function studioControlsDockPosition(): { x: number; y: number } {
  if (typeof window === "undefined") {
    return { x: 16, y: 16 };
  }
  const margin = 16;
  const dockWidth = 300;
  const dockHeight = 220;
  return {
    x: Math.max(margin, window.innerWidth - dockWidth - margin),
    y: Math.max(margin, window.innerHeight - dockHeight - margin),
  };
}

/** Prefer the monitor to the right of the primary display (typical dual-monitor setup). */
export function studioPanelDefaultPosition(_panelId?: string): { x: number; y: number } {
  if (typeof window === "undefined") {
    return { x: 24, y: PANEL_MIN_TOP };
  }

  const primaryLeft = window.screen.availLeft ?? 0;
  const primaryWidth = window.screen.availWidth ?? window.screen.width ?? 1200;
  const windowOnSecondary = window.screenLeft >= primaryLeft + primaryWidth * 0.45;

  let baseX = windowOnSecondary
    ? window.screenLeft + 24
    : primaryLeft + primaryWidth + 24;

  const virtualRight =
    (window.screen.availLeft ?? 0) + (window.screen.availWidth ?? window.screen.width ?? 1200);
  if (baseX + PANEL_W > virtualRight - 8) {
    baseX = Math.max(8, window.screenLeft + window.innerWidth - PANEL_W - 24);
  }

  return {
    x: Math.max(8, baseX),
    y: PANEL_MIN_TOP + 24,
  };
}

export function loadStudioPanelSharedPosition(): { x: number; y: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STUDIO_PANEL_SHARED_POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { x?: number; y?: number };
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveStudioPanelSharedPosition(pos: { x: number; y: number }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STUDIO_PANEL_SHARED_POS_KEY, JSON.stringify(pos));
  } catch {
    /* ignore */
  }
}

export function clampStudioPanelPosition(x: number, y: number): { x: number; y: number } {
  if (typeof window === "undefined") return { x, y };
  const screenRight =
    (window.screen.availLeft ?? 0) + (window.screen.availWidth ?? window.innerWidth);
  const maxY = Math.max(PANEL_MIN_TOP, window.screen.availHeight - 120);
  return {
    x: Math.max(8, Math.min(screenRight - PANEL_W - 8, x)),
    y: Math.max(PANEL_MIN_TOP, Math.min(maxY, y)),
  };
}
