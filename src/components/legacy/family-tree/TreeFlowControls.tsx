import { useEffect, useState } from "react";
import { ControlButton, Controls, useReactFlow } from "@xyflow/react";
import { Maximize2, Minimize2, Moon, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { useTreeTheme } from "@/components/legacy/family-tree/TreeThemeProvider";
import type { LayoutDirection } from "@/lib/legacy/autoLayoutTree";

type Props = {
  onFullscreenChange?: (active: boolean) => void;
  onAutoLayout?: (direction: LayoutDirection) => void;
};

export function TreeFlowControls({ onFullscreenChange, onAutoLayout }: Props) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { isLight, toggleTheme } = useTreeTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      onFullscreenChange?.(active);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [onFullscreenChange]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <Controls
      showInteractive={false}
      position="bottom-left"
      className="family-tree-zoom-controls"
    >
      <ControlButton onClick={() => zoomIn()} aria-label="Zoom in">
        <ZoomIn className="h-5 w-5" />
      </ControlButton>
      <ControlButton onClick={() => zoomOut()} aria-label="Zoom out">
        <ZoomOut className="h-5 w-5" />
      </ControlButton>
      <ControlButton
        onClick={() => void fitView({ padding: 0.2, duration: 200 })}
        aria-label="Fit view"
        title="Fit tree in view"
      >
        <span className="text-[11px] font-medium leading-none">Fit</span>
      </ControlButton>

      {onAutoLayout ? (
        <>
          <ControlButton
            onClick={() => onAutoLayout("TB")}
            aria-label="Auto-layout vertical (top to bottom)"
            title="Vertical layout"
          >
            {/* Top-to-bottom rows icon */}
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
              <rect x="7" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="7" y="14" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 1.5"/>
            </svg>
          </ControlButton>
          <ControlButton
            onClick={() => onAutoLayout("LR")}
            aria-label="Auto-layout horizontal (left to right)"
            title="Horizontal layout"
          >
            {/* Left-to-right columns icon */}
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
              <rect x="2" y="7" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="14" y="7" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 1.5"/>
            </svg>
          </ControlButton>
        </>
      ) : null}

      <ControlButton
        onClick={() => void toggleFullscreen()}
        aria-label="Toggle fullscreen"
        title="Fullscreen"
      >
        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </ControlButton>

      <ControlButton
        onClick={toggleTheme}
        aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
        title={isLight ? "Dark mode" : "Light mode"}
        className="tree-theme-control-btn"
      >
        {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </ControlButton>
    </Controls>
  );
}
