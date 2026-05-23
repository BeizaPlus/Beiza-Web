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
};

/** Home FAQ list — one item open at a time; uses `FAQItem` visuals and motion. */
export function FaqAccordionGroup({ items, className }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("w-full", className)}>
      {items.map((item, index) => (
        <FAQItem
          key={item.id ?? item.question}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
        />
      ))}
    </div>
  );
}
