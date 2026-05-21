import { Link } from "react-router-dom";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { cn } from "@/lib/utils";

type BeizaLogoLinkProps = {
  /** full = mascot + wordmark; wordmark = BEIZA mark only; mascot = head only */
  variant?: "full" | "wordmark" | "mascot";
  className?: string;
  mascotClassName?: string;
  wordmarkClassName?: string;
  onClick?: () => void;
};

/** Beiza logo — always navigates to the marketing landing page (`/`). */
export function BeizaLogoLink({
  variant = "full",
  className,
  mascotClassName,
  wordmarkClassName,
  onClick,
}: BeizaLogoLinkProps) {
  const showMascot = variant === "full" || variant === "mascot";
  const showWordmark = variant === "full" || variant === "wordmark";

  return (
    <Link
      to={BEIZA_LINKS.welcome.gate}
      onClick={onClick}
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Beiza home"
    >
      {showMascot ? (
        <img
          src="/Beiza-head.png"
          alt=""
          aria-hidden
          className={cn("h-10 w-auto shrink-0", variant === "mascot" && "h-9 w-9", mascotClassName)}
        />
      ) : null}
      {showWordmark ? (
        <img
          src="/Beiza_White.svg"
          alt="Beiza"
          className={cn(
            "h-6 w-auto shrink-0",
            variant === "wordmark" && "h-5 w-auto",
            wordmarkClassName,
          )}
        />
      ) : null}
    </Link>
  );
}
