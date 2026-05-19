import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const HEADER_H = 52;

export type TreeAppShellProps = {
  circleName: string;
  memberCount: number;
  memoryCount: number;
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
  backHref,
  circleId,
  showInviteBar,
  onCopyAccessCode,
  children,
  fullscreen = false,
  onFullscreenChange,
}: TreeAppShellProps) {
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
      className="tree-shell fixed inset-0 z-[60] flex flex-col bg-[#080808] text-white"
      onMouseMove={(e) => {
        if (fullscreen && e.clientY < 56) setHeaderVisible(true);
      }}
    >
      <header
        className={cn(
          "fixed top-0 z-50 flex w-full items-center justify-between border-b border-[#1a1a1a] px-6 transition-transform duration-200",
          "bg-[rgba(10,10,10,0.92)] backdrop-blur-[12px]",
          showBar ? "translate-y-0" : "-translate-y-full",
        )}
        style={{ height: HEADER_H, paddingLeft: 24, paddingRight: 24 }}
      >
        <Link
          to={backHref}
          className="min-w-0 shrink font-manrope text-[13px] font-normal text-[#888888] transition-colors hover:text-white"
        >
          ← {circleName}
        </Link>

        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-center sm:block">
          <p className="font-manrope text-sm font-medium text-white">{circleName}</p>
          <p className="font-manrope text-[11px] font-normal text-[#555555]">
            {memberCount} members · {memoryCount} memories
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showInviteBar && onCopyAccessCode ? (
            <button
              type="button"
              onClick={onCopyAccessCode}
              className="rounded-full border border-[#2a2a2a] px-3.5 py-1.5 font-manrope text-xs text-[#666666] transition-colors hover:border-[#444444] hover:text-[#888888]"
            >
              Invite family · copy code
            </button>
          ) : null}
          <Link
            to={`/record?circle=${circleId}`}
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
