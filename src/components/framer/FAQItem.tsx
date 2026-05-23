import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FAQItemProps {
  question: string;
  answer: string;
  /** When set, parent controls open state (e.g. one-at-a-time group). Omit for Prince-style independent rows. */
  isOpen?: boolean;
  onToggle?: () => void;
  variant?: "light" | "dark";
}

/** Prince/original FAQ row — plus/minus in gray square, light gray dividers. */
export const FAQItem = ({
  question,
  answer,
  isOpen: isOpenProp,
  onToggle,
  variant = "light",
}: FAQItemProps) => {
  const dark = variant === "dark";
  const [openInternal, setOpenInternal] = useState(false);
  const controlled = onToggle != null;
  const isOpen = controlled ? Boolean(isOpenProp) : openInternal;

  const toggle = () => {
    if (onToggle) onToggle();
    else setOpenInternal((prev) => !prev);
  };

  return (
    <div
      className={cn(
        "relative w-full cursor-pointer border-b py-6 transition-colors",
        dark ? "border-white/15 bg-transparent" : "border-[#e1e1e1] bg-white",
      )}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <h3
            className={cn(
              "text-left text-xl font-medium leading-[1.4em] tracking-[-0.02em]",
              dark ? "text-white" : "text-black",
            )}
          >
            {question}
          </h3>
        </div>

        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
            dark ? "bg-white/10" : "bg-[#f2f2f2]",
          )}
        >
          <div className="relative h-[21px] w-[21px]">
            <div
              className={cn(
                "absolute transition-opacity duration-200",
                dark ? "bg-white" : "bg-black",
              )}
              style={{
                left: "50%",
                top: "50%",
                width: "11px",
                height: "2px",
                transform: "translate(-50%, -50%)",
              }}
            />
            <div
              className={cn(
                "absolute transition-opacity duration-200",
                dark ? "bg-white" : "bg-black",
              )}
              style={{
                left: "50%",
                top: "50%",
                width: "2px",
                height: "11px",
                transform: "translate(-50%, -50%)",
                opacity: isOpen ? 0 : 1,
              }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p
              className={cn(
                "mt-4 text-left text-sm leading-[1.5em]",
                dark ? "text-white/70" : "text-neutral-600",
              )}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
