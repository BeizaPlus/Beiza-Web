import { useStudioTextEditOptional } from "@/context/StudioTextEditContext";
import { cn } from "@/lib/utils";

/** Inline “Edit text” toggle for layout studio panels (welcome, page layout, etc.) */
export function StudioTextEditButton({ className }: { className?: string }) {
  const ctx = useStudioTextEditOptional();
  if (!ctx?.studioEnabled) return null;

  const { active, toggle } = ctx;

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "mb-3 w-full rounded-md py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {active ? "✎ Click any text to edit" : "Edit text on page"}
    </button>
  );
}
