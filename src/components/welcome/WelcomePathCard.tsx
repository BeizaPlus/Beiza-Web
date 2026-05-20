import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { legacyBody, legacyDisplay } from "@/lib/legacyLandingFonts";

export type WelcomePathCardProps = {
  to: string;
  label: string;
  title: string;
  subtitle: string;
  meta: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  /** CSS gradient when no image (Farewell / Education until hero art ships). */
  backgroundGradient?: string;
};

const PHOTO_OVERLAY =
  "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.95) 100%)";

export function WelcomePathCard({
  to,
  label,
  title,
  subtitle,
  meta,
  backgroundImage,
  backgroundImageAlt = "",
  backgroundGradient,
}: WelcomePathCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        legacyBody,
        "group relative aspect-[2/3] w-full min-h-[320px] overflow-hidden rounded-[10px] border border-transparent",
        "transition duration-300 hover:border-white sm:min-h-[380px] lg:min-h-[420px]",
      )}
    >
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt={backgroundImageAlt}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: backgroundGradient ?? "linear-gradient(160deg, #2a2622 0%, #121010 100%)" }}
          aria-hidden
        />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: PHOTO_OVERLAY }}
        aria-hidden
      />

      <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-black">
        {label}
      </span>

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 pt-20 text-left sm:px-5 sm:pb-6">
        <h2
          className={cn(
            legacyDisplay,
            "text-[1.35rem] font-medium leading-tight text-white sm:text-[1.5rem] lg:text-[1.65rem]",
          )}
        >
          {title}
        </h2>
        <p className="mt-2 text-[13px] font-light leading-snug text-white/90 sm:text-sm">
          <span className="text-white/70">— </span>
          {subtitle}
        </p>
        <p className="mt-3 text-[11px] font-light uppercase tracking-[0.12em] text-white/65">{meta}</p>
      </div>
    </Link>
  );
}
