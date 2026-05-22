import type { CSSProperties } from "react";
import {
  clampCopyOffsetFields,
  copyOffsetStyle,
  migrateCopyOffsetFields,
  type CopyOffsetFields,
} from "@/lib/copyLayoutOffset";
import { LAYOUT_CANONICAL } from "@/lib/layoutCanonical";

/** Per-page content area positioning — localStorage, dev / ?studio=1 */

export type PageLayoutFrame = CopyOffsetFields & {
  /** Main column max width, rem */
  maxWidthRem: number;
};

export const PAGE_LAYOUT_DEFAULTS: PageLayoutFrame = {
  offsetX: 0,
  offsetY: 0,
  copyLift: 0,
  maxWidthRem: 32,
};

/** Per-route starting positions (reset targets for double-click sliders) */
/** Shared sign-in shell position while logged out (all legacy tabs) */
export const LEGACY_AUTH_PAGE_STUDIO_ID = "legacy-auth";

export const PAGE_LAYOUT_PAGE_DEFAULTS: Record<string, PageLayoutFrame> = {
  [LEGACY_AUTH_PAGE_STUDIO_ID]: (() => {
    const { pageId: _id, ...frame } = LAYOUT_CANONICAL.legacyRecordStation;
    return frame;
  })(),
  "legacy-home": { ...PAGE_LAYOUT_DEFAULTS },
  "legacy-record": { ...PAGE_LAYOUT_DEFAULTS },
  "legacy-vault": { ...PAGE_LAYOUT_DEFAULTS },
  "legacy-family": { ...PAGE_LAYOUT_DEFAULTS },
};

export function pageLayoutDefaultsFor(pageId: string): PageLayoutFrame {
  return { ...PAGE_LAYOUT_DEFAULTS, ...PAGE_LAYOUT_PAGE_DEFAULTS[pageId] };
}

const STORAGE_PREFIX = "beiza-page-layout-studio:";

export function pageLayoutStorageKey(pageId: string) {
  return `${STORAGE_PREFIX}${pageId}`;
}

export function loadPageLayoutFrame(pageId: string): PageLayoutFrame {
  const defaults = pageLayoutDefaultsFor(pageId);
  if (typeof window === "undefined") return { ...defaults };
  try {
    const raw = localStorage.getItem(pageLayoutStorageKey(pageId));
    if (!raw) return { ...defaults };
    return clampCopyOffsetFields({
      ...defaults,
      ...migrateCopyOffsetFields(JSON.parse(raw) as Partial<PageLayoutFrame>),
    });
  } catch {
    return { ...defaults };
  }
}

export function savePageLayoutFrame(pageId: string, frame: PageLayoutFrame) {
  localStorage.setItem(pageLayoutStorageKey(pageId), JSON.stringify(frame));
}

function responsiveColumnMaxWidth(rem: number): string {
  return `min(${rem}rem, calc(100vw - 2 * var(--beiza-site-padding-x, 1.25rem)))`;
}

/** Legacy sign-in shell — vw/vh offsets; vertical shift uses padding-top (stable on mobile). */
export function legacyAuthPageLayoutStyle(frame: PageLayoutFrame): CSSProperties {
  const transformParts: string[] = [];
  if (frame.offsetX !== 0) {
    transformParts.push(`translateX(${frame.offsetX}vw)`);
  }
  if (frame.copyLift && frame.copyLift > 0) {
    transformParts.push(`translateY(-${frame.copyLift}vh)`);
  }
  return {
    width: "100%",
    maxWidth: responsiveColumnMaxWidth(frame.maxWidthRem),
    marginLeft: "auto",
    marginRight: "auto",
    paddingTop: frame.offsetY !== 0 ? `${frame.offsetY}vh` : undefined,
    transform: transformParts.length > 0 ? transformParts.join(" ") : undefined,
  };
}

export function pageLayoutFrameStyle(
  frame: PageLayoutFrame,
  options?: { applyMaxWidth?: boolean; pageId?: string },
): CSSProperties {
  if (options?.pageId === LEGACY_AUTH_PAGE_STUDIO_ID) {
    return legacyAuthPageLayoutStyle(frame);
  }
  return {
    ...(options?.applyMaxWidth !== false
      ? { maxWidth: responsiveColumnMaxWidth(frame.maxWidthRem) }
      : {}),
    ...copyOffsetStyle(frame),
  };
}

/** Legacy shell — one studio preset per sub-route */
export function resolveLegacyPageStudioId(pathname: string): string {
  if (pathname === "/legacy" || pathname === "/legacy/") return "legacy-home";
  if (pathname.startsWith("/legacy/record")) return "legacy-record";
  if (pathname.startsWith("/legacy/circle")) return "legacy-circle";
  if (pathname.startsWith("/legacy/vault")) return "legacy-vault";
  if (pathname.startsWith("/legacy/family")) return "legacy-family";
  return "legacy-other";
}

/** Human label for studio panel header */
export function pageLayoutStudioLabel(pageId: string): string {
  const labels: Record<string, string> = {
    "legacy-auth": "Legacy · Sign in",
    "legacy-home": "Legacy · Home",
    "legacy-record": "Legacy · Record",
    "legacy-circle": "Legacy · Tree",
    "legacy-vault": "Legacy · Vault",
    "legacy-family": "Legacy · Invite",
    "legacy-other": "Legacy",
    welcome: "Welcome gate",
    home: "Home landing",
    education: "Education",
    farewell: "Farewell",
    contact: "Contact",
    pricing: "Pricing",
  };
  return labels[pageId] ?? pageId.replace(/-/g, " ");
}

/** Routes that already ship a dedicated layout studio — hide generic panel */
export function hasDedicatedLayoutStudio(pageId: string): boolean {
  return (
    pageId === "welcome" ||
    pageId === "home" ||
    pageId === "events" ||
    pageId === "heritage" ||
    pageId === "farewell" ||
    pageId === "legacy-record"
  );
}

/** Map pathname → studio page id (generic pages) */
export function resolvePageStudioId(pathname: string): string {
  if (pathname === "/" || pathname === "/welcome") return "welcome";
  if (pathname === "/home") return "home";
  if (pathname.startsWith("/legacy")) return resolveLegacyPageStudioId(pathname);
  if (pathname === "/education" || pathname.startsWith("/education/")) return "education";
  if (pathname === "/farewell" || pathname === "/white-swan") return "farewell";
  if (pathname === "/heritage") return "heritage";
  if (pathname === "/events") return "events";
  if (pathname === "/contact") return "contact";
  if (pathname === "/pricing") return "pricing";
  const slug = pathname.replace(/^\//, "").replace(/\//g, "-") || "root";
  return slug;
}
