import type { BeizaLocale } from "@/lib/locale/types";
import { cn } from "@/lib/utils";

const REGION_LABEL: Record<Exclude<BeizaLocale, "black-american">, string> = {
  fr: "Expérience française",
  africa: "Africa experience",
  indian: "India experience",
  latina: "Latina experience",
  chinese: "Chinese experience",
  brazilian: "Brazil experience",
};

type RegionalLocaleBannerProps = {
  locale: BeizaLocale;
  className?: string;
};

/** Stub banner until full regional content ships. */
export function RegionalLocaleBanner({ locale, className }: RegionalLocaleBannerProps) {
  if (locale === "black-american") return null;

  return (
    <div
      className={cn(
        "border-b border-primary/25 bg-primary/10 px-4 py-2 text-center font-sans text-xs text-primary",
        className,
      )}
      role="status"
    >
      {REGION_LABEL[locale]} · regional content expands in the next pass
    </div>
  );
}
