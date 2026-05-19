import { useEffect, useState } from "react";
import { ControlButton, Controls, useReactFlow } from "@xyflow/react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";

type Props = {
  onFullscreenChange?: (active: boolean) => void;
};

export function TreeFlowControls({ onFullscreenChange }: Props) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
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
      style={{
        background: "#111111",
        border: "0.5px solid #1e1e1e",
        borderRadius: 10,
        padding: 6,
        margin: 16,
        height: "30vh",
        minHeight: 200,
        maxHeight: 360,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <ControlButton onClick={() => zoomIn()} aria-label="Zoom in" className="!min-h-[44px] !flex-1">
        <ZoomIn className="h-6 w-6" />
      </ControlButton>
      <ControlButton onClick={() => zoomOut()} aria-label="Zoom out" className="!min-h-[44px] !flex-1">
        <ZoomOut className="h-6 w-6" />
      </ControlButton>
      <ControlButton
        onClick={() => void fitView({ padding: 0.2, duration: 200 })}
        aria-label="Fit view"
        className="!min-h-[44px] !flex-1"
      >
        <span className="text-sm font-medium">Fit</span>
      </ControlButton>
      <ControlButton
        onClick={() => void toggleFullscreen()}
        aria-label="Toggle fullscreen"
        className="!min-h-[44px] !flex-1"
      >
        {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
      </ControlButton>
    </Controls>
  );
}
