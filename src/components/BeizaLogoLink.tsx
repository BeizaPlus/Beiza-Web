import { useNavigate } from "react-router-dom";
import { MEDIA_ASSETS } from "@/lib/mediaAssets";
import { handleWelcomeHomeClick, WELCOME_HOME_PATH } from "@/lib/welcomeHomeNav";
import { cn } from "@/lib/utils";

type BeizaLogoLinkProps = {
  /** full = mascot + wordmark; wordmark = BEIZA mark only; mascot = head only */
  variant?: "full" | "wordmark" | "mascot";
  className?: string;
  mascotClassName?: string;
  wordmarkClassName?: string;
  onClick?: () => void;
};

/** Beiza logo — always navigates to the welcome gate (`/welcome`). */
export function BeizaLogoLink({
  variant = "full",
  className,
  mascotClassName,
  wordmarkClassName,
  onClick,
}: BeizaLogoLinkProps) {
  const navigate = useNavigate();
  const showMascot = variant === "full" || variant === "mascot";
  const showWordmark = variant === "full" || variant === "wordmark";

  return (
    <a
      href={WELCOME_HOME_PATH}
      onClick={(e) => {
        handleWelcomeHomeClick(e, navigate, onClick);
      }}
      className={cn(
        "relative z-[70] inline-flex cursor-pointer items-center gap-3 pointer-events-auto",
        className,
      )}
      aria-label="Beiza home"
    >
      {showMascot ? (
        <img
          src={MEDIA_ASSETS.brand.mascotHead.src}
          alt=""
          aria-hidden
          className={cn("h-10 w-auto shrink-0", variant === "mascot" && "h-9 w-9", mascotClassName)}
          draggable={false}
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
          draggable={false}
        />
      ) : null}
    </a>
  );
}
