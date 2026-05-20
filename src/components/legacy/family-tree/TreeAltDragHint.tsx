import { useEffect, useState } from "react";

const STORAGE_KEY = "beiza_alt_drag_hint_seen";

export function TreeAltDragHint() {
  const [visible, setVisible] = useState(false);
  const [altHeld, setAltHeld] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setAltHeld(false);
        setVisible(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!altHeld) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    setVisible(true);
    localStorage.setItem(STORAGE_KEY, "1");
    const t = window.setTimeout(() => setVisible(false), 4000);
    return () => window.clearTimeout(t);
  }, [altHeld]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-lg border border-[#E6A817]/30 bg-[#141008] px-4 py-2 shadow-lg">
      <p className="font-manrope text-xs text-[#E6A817]">Alt + drag to duplicate</p>
    </div>
  );
}
