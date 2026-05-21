import { useEffect } from "react";

/** Locks document scroll on /legacy/record — exactly one viewport, no page scroll. */
export function RecordViewportLock() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("record-route");
    const bodyOverflow = document.body.style.overflow;
    const bodyHeight = document.body.style.height;
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";

    return () => {
      html.classList.remove("record-route");
      document.body.style.overflow = bodyOverflow;
      document.body.style.height = bodyHeight;
    };
  }, []);

  return null;
}
