import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTreeTheme } from "@/components/legacy/family-tree/TreeThemeProvider";
import { Moon, Sun } from "lucide-react";

const HEADER_H = 52;

export type TreeAppShellProps = {
  circleName: string;
  memberCount: number;
  memoryCount: number;
  /** Who the tree organizes around — from resolveTreeLeader */
  treeLeaderName?: string;
  treeLeaderReason?: string;
  treeLeaderIsPinned?: boolean;
  onFocusTreeLeader?: () => void;
  backHref: string;
  circleId: string;
  showInviteBar?: boolean;
  onCopyAccessCode?: () => void;
  children: ReactNode;
  /** When true, canvas receives fullscreen height (header hidden). */
  fullscreen?: boolean;
  onFullscreenChange?: (next: boolean) => void;
};

export function TreeAppShell({
  circleName,
  memberCount,
  memoryCount,
  treeLeaderName,
  treeLeaderReason,
  treeLeaderIsPinned,
  onFocusTreeLeader,
  backHref,
  circleId,
  showInviteBar,
  onCopyAccessCode,
  children,
  fullscreen = false,
  onFullscreenChange,
}: TreeAppShellProps) {
  const { isLight, toggleTheme } = useTreeTheme();
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    const onFsChange = () => {
      const active = Boolean(document.fullscreenElement);
      onFullscreenChange?.(active);
      if (!active) setHeaderVisible(true);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [onFullscreenChange]);

  useEffect(() => {
    if (fullscreen) setHeaderVisible(false);
  }, [fullscreen]);

  const showBar = !fullscreen || headerVisible;

  return (
    <div
      className={cn(
        "tree-shell fixed inset-0 z-[60] flex flex-col",
        isLight ? "tree-theme-light" : "tree-theme-dark",
      )}
      onMouseMove={(e) => {
        if (fullscreen && e.clientY < 56) setHeaderVisible(true);
      }}
    >
      <header
        className={cn(
          "tree-shell-header fixed top-0 z-50 flex w-full items-center justify-between border-b px-6 transition-transform duration-200 backdrop-blur-[12px]",
          showBar ? "translate-y-0" : "-translate-y-full",
        )}
        style={{ height: HEADER_H, paddingLeft: 24, paddingRight: 24 }}
      >
        <Link
          to={backHref}
          className="tree-shell-back min-w-0 shrink font-manrope text-[13px] font-normal transition-colors"
        >
          ← {circleName}
        </Link>

        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-center sm:block">
          <p className="tree-shell-title font-manrope text-sm font-medium">{circleName}</p>
          <p className="tree-shell-meta font-manrope text-[11px] font-normal">
            {memberCount} members · {memoryCount} memories
          </p>
          {treeLeaderName ? (
            <button
              type="button"
              onClick={onFocusTreeLeader}
              className="mt-0.5 inline-flex items-center gap-1 font-manrope text-[10px] text-[#E6A817] hover:underline disabled:cursor-default disabled:no-underline"
              disabled={!onFocusTreeLeader}
              title={treeLeaderReason ?? "Family leader"}
            >
              <span aria-hidden>{treeLeaderIsPinned ? "★" : "◎"}</span>
              Leader: {treeLeaderName}
              {treeLeaderReason && !treeLeaderIsPinned ? (
                <span className="tree-shell-meta"> · {treeLeaderReason}</span>
              ) : null}
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="tree-shell-theme-btn flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {showInviteBar && onCopyAccessCode ? (
            <button
              type="button"
              onClick={onCopyAccessCode}
              className="tree-shell-invite rounded-full border px-3.5 py-1.5 font-manrope text-xs transition-colors"
            >
              Invite family · copy code
            </button>
          ) : null}
          <Link
            to={`/circle/${circleId}/record`}
            className="rounded-full bg-[#E6A817] px-3.5 py-1.5 font-manrope text-xs font-medium text-[#0a0a0a] transition hover:bg-[#E6A817]/90"
          >
            + Add memory →
          </Link>
        </div>
      </header>

      <main
        className="relative min-h-0 flex-1"
        style={{
          marginTop: fullscreen ? 0 : HEADER_H,
          height: fullscreen ? "100vh" : `calc(100vh - ${HEADER_H}px)`,
          width: "100vw",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export const TREE_HEADER_HEIGHT = HEADER_H;
