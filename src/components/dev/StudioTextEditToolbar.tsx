import { useLayoutStudio } from "@/context/LayoutStudioContext";
import { useStudioTextEdit } from "@/context/StudioTextEditContext";
import { cn } from "@/lib/utils";

/**
 * Global “Edit text” control — works on every page while layout studio is on.
 * Toggle once, then click any headline, label, or paragraph on the page.
 */
export function StudioTextEditToolbar() {
  const { enabled: layoutStudioOn, masterOpen } = useLayoutStudio();
  const { studioEnabled, active, toggle } = useStudioTextEdit();

  if (!studioEnabled || !layoutStudioOn || !masterOpen) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-20 left-4 z-[70] flex flex-col items-start gap-1 sm:left-6"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "pointer-events-auto rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest shadow-lg transition",
          active
            ? "bg-[#f5c518] text-black ring-2 ring-[#f5c518]/50"
            : "border border-white/20 bg-black/85 text-white hover:bg-black",
        )}
      >
        {active ? "✎ Editing — click text" : "Edit text on page"}
      </button>
      {active ? (
        <p className="pointer-events-none max-w-[220px] rounded-md bg-black/80 px-2 py-1 text-[10px] leading-snug text-white/70">
          Click any copy to change it. Copy from the page when done, then paste into your source
          files.
        </p>
      ) : null}
    </div>
  );
}
