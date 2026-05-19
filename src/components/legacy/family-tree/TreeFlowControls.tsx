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
      style={{
        background: "#111111",
        border: "0.5px solid #1e1e1e",
        borderRadius: 8,
        padding: 4,
        margin: 16,
      }}
    >
      <ControlButton onClick={() => zoomIn()} aria-label="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </ControlButton>
      <ControlButton onClick={() => zoomOut()} aria-label="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </ControlButton>
      <ControlButton
        onClick={() => void fitView({ padding: 0.2, duration: 200 })}
        aria-label="Fit view"
      >
        <span className="text-[10px] font-medium">Fit</span>
      </ControlButton>
      <ControlButton onClick={() => void toggleFullscreen()} aria-label="Toggle fullscreen">
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </ControlButton>
    </Controls>
  );
}
