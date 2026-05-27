import { Link, useLocation, useNavigate } from "react-router-dom";
import { MEDIA_ASSETS } from "@/lib/mediaAssets";
import { handleWelcomeHomeClick, WELCOME_HOME_PATH } from "@/lib/welcomeHomeNav";
import { cn } from "@/lib/utils";

type BeizaLogoLinkProps = {
  /** full = mascot + wordmark; wordmark = BEIZA mark only; mascot = head only */
  variant?: "full" | "wordmark" | "mascot";
  className?: string;
  mascotClassName?: string;
  wordmarkClassName?: string;
  /** Optional height (rem) for mascot / wordmark images (welcome gate studio scale). */
  logoHeightRem?: number;
  onClick?: () => void;
};

/** Beiza logo — always navigates to the welcome gate (`/welcome`). */
export function BeizaLogoLink({
  variant = "full",
  className,
  mascotClassName,
  wordmarkClassName,
  logoHeightRem,
  onClick,
}: BeizaLogoLinkProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const showMascot = variant === "full" || variant === "mascot";
  const showWordmark = variant === "full" || variant === "wordmark";
  const logoSizeStyle =
    logoHeightRem != null
      ? ({ height: `${logoHeightRem}rem`, width: "auto" } as const)
      : undefined;

  return (
    <Link
      to={WELCOME_HOME_PATH}
      onClick={(e) => {
        handleWelcomeHomeClick(e, navigate, onClick, location.pathname);
      }}
      className={cn(
        "relative z-[80] inline-flex cursor-pointer items-center gap-3 pointer-events-auto",
        className,
      )}
      aria-label="Beiza home"
    >
      {showMascot ? (
        <img
          src={MEDIA_ASSETS.brand.mascotHead.src}
          alt=""
          aria-hidden
          className={cn(
            "h-10 w-auto shrink-0",
            variant === "mascot" && !logoHeightRem && "h-9 w-9",
            mascotClassName,
          )}
          style={logoSizeStyle}
          draggable={false}
        />
      ) : null}
      {showWordmark ? (
        <img
          src="/Beiza_White.svg"
          alt="Beiza"
          className={cn(
            "h-6 w-auto shrink-0",
            variant === "wordmark" && !logoHeightRem && "h-5 w-auto",
            wordmarkClassName,
          )}
          style={logoSizeStyle}
          draggable={false}
        />
      ) : null}
    </Link>
  );
}
