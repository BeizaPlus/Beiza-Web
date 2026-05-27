import { MEDIA_ASSETS } from "@/lib/mediaAssets";
import { cn } from "@/lib/utils";

type BeizaEducationBrandMarkProps = {
  className?: string;
  /** `full` = mascot + wordmark + EDUCATION; `wordmark` = text only; `mascot` = head only */
  variant?: "full" | "wordmark" | "mascot";
  compact?: boolean;
};

/** Top-left mark for education cards — matches BEIZA EDUCATION guide mockup. */
export function BeizaEducationBrandMark({
  className,
  variant = "full",
  compact = false,
}: BeizaEducationBrandMarkProps) {
  const showMascot = variant === "full" || variant === "mascot";
  const showWordmark = variant === "full" || variant === "wordmark";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showMascot ? (
        <img
          src={MEDIA_ASSETS.brand.mascotHead.src}
          alt=""
          className={cn(
            "shrink-0 object-contain",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
          draggable={false}
          aria-hidden
        />
      ) : null}
      {showWordmark ? (
        <div className="min-w-0 leading-none">
          <img
            src="/Beiza_White.svg"
            alt="Beiza"
            className={cn("w-auto shrink-0", compact ? "h-3.5" : "h-4")}
            draggable={false}
          />
          {variant === "full" ? (
            <p
              className={cn(
                "mt-1 font-manrope font-medium uppercase text-white/45",
                compact ? "text-[7px] tracking-[0.22em]" : "text-[8px] tracking-[0.28em]",
              )}
            >
              Education
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
