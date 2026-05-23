import { useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { FaqAccordionEntry } from "@/components/framer/FaqAccordionGroup";
import { cn } from "@/lib/utils";

type Props = {
  items: readonly FaqAccordionEntry[];
  /** Uppercase eyebrow — defaults to `FAQs` (renders as spaced caps via tracking). */
  title?: string;
  className?: string;
  style?: CSSProperties;
};

const FAQ_MOTION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

/**
 * Mobile FAQ (≤809px) — black surface, chevron rows, bordered question when open.
 * Matches `FaqStaircaseSection` dark tokens; answer sits below the bordered trigger.
 */
export function FaqDarkMobileSection({
  items,
  title = "FAQs",
  className,
  style,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <div className={cn("bg-black py-16", className)} style={style}>
      <div className="mx-auto max-w-2xl px-[var(--beiza-site-padding-x,1.25rem)]">
        <p className="mb-6 font-manrope text-xs uppercase tracking-[0.2em] text-white/50">
          {title}
        </p>
        <div>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id ?? item.question}
                className="border-b border-white/15 last:border-b-0"
              >
                <div
                  className={cn(
                    isOpen && "rounded-lg border border-white/15",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenIndex((current) => (current === index ? null : index))
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium text-white hover:no-underline",
                      isOpen && "px-4",
                    )}
                  >
                    <span className="flex-1">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={FAQ_MOTION}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 pt-0 text-sm leading-relaxed text-white/70">
                        {item.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
