/**
 * Single source of truth — edit JSON under `src/data/`, not scattered TS constants.
 * - `beiza-layout-canonical.json` — record, nav, site padding, heritage, UI rules
 * - `welcome-gate-canonical.json` — welcome gate crops + rail/toolbar
 */
import layoutCore from "@/data/beiza-layout-canonical.json";
import welcomeGate from "@/data/welcome-gate-canonical.json";
import type { WelcomePathKey } from "@/lib/locale/types";

export const LAYOUT_CANONICAL = {
  ...layoutCore,
  welcomeGate,
};

export const WELCOME_CENTER_PATH_KEY = LAYOUT_CANONICAL.welcomeGateUi
  .centerPathKey as WelcomePathKey;

export const WELCOME_CENTER_ALWAYS_COLOR =
  LAYOUT_CANONICAL.welcomeGateUi.centerCardAlwaysFullColor;

export const WELCOME_SIDE_CENTER_COLOR_STRIP =
  LAYOUT_CANONICAL.welcomeGateUi.sideCardsCenterColorStrip;
