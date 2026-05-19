import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type LegacyRecordPromptProps = {
  prompt: string;
  className?: string;
};

const MAX_FONT_PX = 26;
const MIN_FONT_PX = 18;
const LINE_HEIGHT = 1.45;

/** Seamless prompt: no border, max 2 lines, shrinks to fit — no ellipsis. */
export function LegacyRecordPrompt({ prompt, className }: LegacyRecordPromptProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const maxHeight = MAX_FONT_PX * LINE_HEIGHT * 2;
    el.style.lineHeight = String(LINE_HEIGHT);
    el.style.maxHeight = `${maxHeight}px`;
    el.style.overflow = "hidden";

    let size = MAX_FONT_PX;
    el.style.fontSize = `${size}px`;

    while (el.scrollHeight > maxHeight + 1 && size > MIN_FONT_PX) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  }, [prompt]);

  return (
    <p
      ref={ref}
      className={cn(
        "mx-auto w-full max-w-md border-0 bg-transparent p-0 text-center font-heading font-medium text-foreground",
        "text-[clamp(1.125rem,4.5vw,1.625rem)] leading-[1.45]",
        className,
      )}
    >
      {prompt}
    </p>
  );
}
