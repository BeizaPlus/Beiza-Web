import { FaqAccordionGroup, type FaqAccordionEntry } from "@/components/framer/FaqAccordionGroup";
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };

type Props = {
  id?: string;
  title?: string;
  items: readonly FaqItem[];
  className?: string;
  variant?: "light" | "dark";
};

/** Site-wide FAQ block — linear accordion with plus/minus icons (no staircase / chevron variants). */
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

  if (items.length === 0) return null;

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-16",
        dark ? "bg-black text-white" : "bg-white text-black",
        className,
      )}
    >
      <div className="mx-auto max-w-5xl px-[var(--beiza-site-padding-x,1.25rem)] sm:px-6">
        <p
          className={cn(
            "mb-8 font-manrope text-xs uppercase tracking-[0.2em]",
            dark ? "text-white/50" : "text-[#666666]",
          )}
        >
          {title}
        </p>
        <FaqAccordionGroup items={accordionItems} variant={variant} />
      </div>
    </section>
  );
}
