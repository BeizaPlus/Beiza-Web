import { useState } from "react";
import { FAQItem } from "@/components/framer/FAQItem";
import { cn } from "@/lib/utils";

export type FaqAccordionEntry = {
  id?: string;
  question: string;
  answer: string;
};

type Props = {
  items: readonly FaqAccordionEntry[];
  className?: string;
  variant?: "light" | "dark";
  /** false = Prince original (each row toggles independently). true = only one open. */
  exclusive?: boolean;
};

export function FaqAccordionGroup({
  items,
  className,
  variant = "light",
  exclusive = false,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("w-full", className)}>
      {items.map((item, index) => (
        <FAQItem
          key={item.id ?? item.question}
          question={item.question}
          answer={item.answer}
          variant={variant}
          {...(exclusive
            ? {
                isOpen: openIndex === index,
                onToggle: () =>
                  setOpenIndex((current) => (current === index ? null : index)),
              }
            : {})}
        />
      ))}
    </div>
  );
}
