import type { CSSProperties, ReactNode } from "react";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import {
  useRecordLayoutStudio,
  type RecordLayoutStudioTarget,
} from "@/context/RecordLayoutStudioContext";
import { cn } from "@/lib/utils";

type Props = {
  target: RecordLayoutStudioTarget;
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

function isStudioChromeTarget(el: EventTarget | null) {
  return (
    el instanceof HTMLElement &&
    Boolean(el.closest("button, a, input, textarea, select, [role='slider'], audio, video"))
  );
}

/** Studio-only click target — highlights selection and opens the matching PANELS dock control. */
export function StudioSubsetZone({ target, label, children, className, style }: Props) {
  const studioOn = isLayoutStudioEnabled();
  const ctx = useRecordLayoutStudio();
  const selected = studioOn && ctx?.activeTarget === target;

  if (!studioOn) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const activate = () => ctx?.selectTarget(target);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Edit layout: ${label}`}
      className={cn(
        "relative cursor-pointer rounded-lg transition-shadow",
        selected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-black/40"
          : "ring-1 ring-white/20 hover:ring-primary/60",
        className,
      )}
      style={style}
      onClick={(e) => {
        if (isStudioChromeTarget(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        activate();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
    >
      {selected ? (
        <span className="pointer-events-none absolute -top-5 left-0 z-10 rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
          {label}
        </span>
      ) : null}
      {children}
    </div>
  );
}
