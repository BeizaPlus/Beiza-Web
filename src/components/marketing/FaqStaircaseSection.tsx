import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaqDarkMobileSection } from "@/components/marketing/FaqDarkMobileSection";
import { cn } from "@/lib/utils";
import type { FaqAccordionEntry } from "@/components/framer/FaqAccordionGroup";

type FaqItem = { q: string; a: string };

type Props = {
  id?: string;
  title?: string;
  items: readonly FaqItem[];
  className?: string;
  variant?: "light" | "dark";
};

export function FaqStaircaseSection({
  id = "faqs",
  title = "FAQs",
  items,
  className,
  variant = "light",
}: Props) {
  const dark = variant === "dark";
  const accordionItems: FaqAccordionEntry[] = items.map((item, i) => ({
    id: `${id}-${i}`,
    question: item.q,
    answer: item.a,
  }));

  return (
    <div id={id} className={cn("scroll-mt-24", className)}>
      <FaqDarkMobileSection
        title={title}
        items={accordionItems}
        className="min-[810px]:hidden"
      />

      <section className={cn("py-16 max-[809px]:hidden", dark ? "bg-black" : undefined)}>
        <div className="mx-auto max-w-2xl px-[var(--beiza-site-padding-x,1.25rem)]">
          <p
            className={cn(
              "mb-6 font-manrope text-xs uppercase tracking-[0.2em]",
              dark ? "text-white/50" : "text-[#666666]",
            )}
          >
            {title}
          </p>
          <Accordion type="single" collapsible className="space-y-1">
            {items.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className={cn(
                  "border-0 border-b",
                  dark ? "border-white/15" : "border-[#e8e2d8]",
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "py-4 text-left text-base font-medium hover:no-underline",
                    dark ? "text-white" : "text-[#2c2824]",
                  )}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent
                  className={cn(
                    "pb-4 text-sm leading-relaxed",
                    dark ? "text-white/70" : "text-[#666666]",
                  )}
                >
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
