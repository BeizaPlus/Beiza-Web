import type { ReactNode } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type StudioAccordionSectionProps = {
  value: string;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

/** Collapsible block for layout studio panels */
export function StudioAccordionSection({
  value,
  title,
  hint,
  children,
  className,
}: StudioAccordionSectionProps) {
  return (
    <AccordionItem value={value} className={cn("border-border", className)}>
      <AccordionTrigger
        className={cn(
          "py-2.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground",
          "hover:no-underline hover:text-foreground [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:opacity-60",
        )}
      >
        {title}
      </AccordionTrigger>
      <AccordionContent className="pb-3 pt-0">
        {hint ? (
          <p className="mb-2.5 text-[9px] leading-snug text-muted-foreground/90">{hint}</p>
        ) : null}
        <div className="space-y-2.5">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function StudioToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-[10px] text-muted-foreground">
      <span className="leading-snug">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary"
      />
    </label>
  );
}
