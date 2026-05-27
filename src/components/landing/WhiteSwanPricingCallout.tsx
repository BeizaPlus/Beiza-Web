import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CasketIcon } from "@/components/icons/CasketIcon";
import { WhiteSwanFilmEmbed } from "@/components/heritage/WhiteSwanFilmEmbed";
import { StudioEditableText } from "@/components/dev/StudioEditableText";
import { cn } from "@/lib/utils";

type WhiteSwanPricingCalloutProps = {
  title: string;
  body: string;
  editable?: boolean;
  onTitleChange?: (title: string) => void;
  onBodyChange?: (body: string) => void;
  defaultOpen?: boolean;
};

export function WhiteSwanPricingCallout({
  title,
  body,
  editable = false,
  onTitleChange,
  onBodyChange,
  defaultOpen = false,
}: WhiteSwanPricingCalloutProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 mt-4 overflow-hidden rounded-lg border border-border bg-secondary/40">
      <button
        type="button"
        className="flex w-full items-center gap-2.5 p-4 text-left transition hover:bg-white/[0.03]"
        aria-expanded={open}
        aria-controls="white-swan-pricing-panel"
        id="white-swan-pricing-trigger"
        onClick={() => setOpen((value) => !value)}
      >
        <CasketIcon size={24} className="shrink-0 text-primary" />
        {editable ? (
          <StudioEditableText
            enabled
            value={title}
            onChange={(next) => onTitleChange?.(next)}
            className="min-w-0 flex-1 text-[13px] font-medium text-white"
          />
        ) : (
          <span className="min-w-0 flex-1 text-[13px] font-medium text-white">{title}</span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      <div
        id="white-swan-pricing-panel"
        role="region"
        aria-labelledby="white-swan-pricing-trigger"
        hidden={!open}
        className={cn(!open && "hidden")}
      >
        <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
          <WhiteSwanFilmEmbed className="aspect-[16/10] rounded-lg" />
          {editable ? (
            <StudioEditableText
              enabled
              as="p"
              multiline
              value={body}
              onChange={(next) => onBodyChange?.(next)}
              className="text-xs leading-relaxed text-muted-foreground"
            />
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
          )}
        </div>
      </div>
    </div>
  );
}
