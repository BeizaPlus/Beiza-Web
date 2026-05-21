import { useEffect, useState, type ReactNode } from "react";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  hasDedicatedLayoutStudio,
  loadPageLayoutFrame,
  pageLayoutFrameStyle,
  type PageLayoutFrame,
} from "@/lib/pageLayoutStudio";
import { PageLayoutStudioPanel } from "@/components/dev/PageLayoutStudioPanel";
import { cn } from "@/lib/utils";

type Props = {
  pageId: string;
  children: ReactNode;
  className?: string;
  /** Optional inner wrapper for copy-lift (e.g. auth card body) */
  copyLiftTarget?: "children" | "none";
  /** Legacy column pages use rem max-width; full-bleed marketing pages set false */
  applyMaxWidth?: boolean;
};

export function PageLayoutStudioZone({
  pageId,
  children,
  className,
  copyLiftTarget = "none",
  applyMaxWidth = true,
}: Props) {
  const studioEnabled = isLayoutStudioEnabled();
  const showPanel = studioEnabled && !hasDedicatedLayoutStudio(pageId);
  const [frame, setFrame] = useState<PageLayoutFrame>(() => loadPageLayoutFrame(pageId));

  useEffect(() => {
    setFrame(loadPageLayoutFrame(pageId));
  }, [pageId]);

  const areaStyle = pageLayoutFrameStyle(frame, { applyMaxWidth });
  const copyLiftStyle =
    frame.copyLift > 0 && copyLiftTarget === "children"
      ? { transform: `translateY(-${frame.copyLift}px)` }
      : undefined;

  return (
    <>
      <div className={cn("mx-auto w-full", className)} style={areaStyle}>
        <div style={copyLiftStyle}>{children}</div>
      </div>
      {showPanel && <PageLayoutStudioPanel pageId={pageId} frame={frame} onChange={setFrame} />}
    </>
  );
}
