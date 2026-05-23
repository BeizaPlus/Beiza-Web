import type { CSSProperties } from "react";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { FaqAccordionGroup, type FaqAccordionEntry } from "@/components/framer/FaqAccordionGroup";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  items: readonly FaqAccordionEntry[];
  eyebrow?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
};

/** `/home` FAQ block — white surface, centered header, pill +/- items (mobile + desktop). */
export function HomeFaqSection({
  id,
  items,
  eyebrow = "FAQ",
  title = "Everything you need to know",
  className,
  style,
}: Props) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 bg-white py-24 text-black", className)}
      style={style}
    >
      <div className="mx-auto max-w-5xl px-[var(--beiza-site-padding-x,1.25rem)] sm:px-6">
        <SectionHeader eyebrow={eyebrow} title={title} align="center" variant="light" />
        {items.length > 0 ? (
          <div className="mt-12">
            <FaqAccordionGroup items={items} variant="light" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
