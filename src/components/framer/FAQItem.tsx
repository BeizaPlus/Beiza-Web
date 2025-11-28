import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
  question: string;
  answer: string;
}

export const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative w-full cursor-pointer border-b border-[#e1e1e1] bg-white py-6 transition-colors"
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-6">
        {/* Question */}
        <div className="flex-1">
          <h3 className="text-left text-xl font-medium leading-[1.4em] tracking-[-0.02em] text-black">
            {question}
          </h3>
        </div>

        {/* Icon Container */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#f2f2f2]">
          <div className="relative h-[21px] w-[21px]">
            {/* Horizontal line (always visible, forms minus when open) */}
            <div
              className="absolute bg-black transition-opacity duration-200"
              style={{
                left: "50%",
                top: "50%",
                width: "11px",
                height: "2px",
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* Vertical line (hides when open to show minus, forms plus when closed) */}
            <div
              className="absolute bg-black transition-opacity duration-200"
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

      {/* Answer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-left text-sm leading-[1.5em] text-neutral-600">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

