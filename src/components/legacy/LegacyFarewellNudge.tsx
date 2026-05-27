import { Link } from "react-router-dom";
import { FAREWELL_REVEAL_NUDGE, FAREWELL_REVEAL_PATH } from "@/lib/productPhilosophy";
import { cn } from "@/lib/utils";

type LegacyFarewellNudgeProps = {
  className?: string;
};

/**
 * Single quiet line at the bottom of Legacy record/vault surfaces.
 * Education (`/home`) must never render this — see docs/product/PHILOSOPHY-UX-BRIEF.md
 */
export function LegacyFarewellNudge({ className }: LegacyFarewellNudgeProps) {
  return (
    <p className={cn("text-center text-[13px] leading-relaxed text-white/45", className)}>
      <Link
        to={FAREWELL_REVEAL_PATH}
        className="text-white/55 underline-offset-4 transition hover:text-[#E6A817] hover:underline"
      >
        {FAREWELL_REVEAL_NUDGE}
      </Link>
    </p>
  );
}
