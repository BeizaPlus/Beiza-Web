import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { legacyBody, legacyDisplay } from "@/lib/legacyLandingFonts";

export type WelcomePathCardProps = {
  to: string;
  label: string;
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  iconCircleClass: string;
  iconClass?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
};

const CARD_SHELL =
  "group relative flex min-h-[24rem] flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] transition duration-300 hover:border-white/20 sm:min-h-[28rem] lg:min-h-[30rem]";

const SOLID_CARD_BG = "bg-[#161616]";

const PHOTO_OVERLAY =
  "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.88) 72%, rgba(0,0,0,0.96) 100%)";

export function WelcomePathCard({
  to,
  label,
  title,
  description,
  cta,
  icon: Icon,
  iconCircleClass,
  iconClass = "h-5 w-5",
  backgroundImage,
  backgroundImageAlt = "",
}: WelcomePathCardProps) {
  const hasPhoto = Boolean(backgroundImage?.trim());

  if (hasPhoto) {
    return (
      <Link to={to} className={CARD_SHELL}>
        <img
          src={backgroundImage}
          alt={backgroundImageAlt}
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
          loading="eager"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: PHOTO_OVERLAY }}
          aria-hidden
        />

        <div className={cn("relative z-10 flex h-full flex-col px-6 py-8 sm:px-8", legacyBody)}>
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full shadow-lg",
              iconCircleClass,
            )}
          >
            <Icon className={iconClass} aria-hidden />
          </span>

          <div className="mt-auto pt-16 text-center">
            <p className="text-[10px] font-light uppercase tracking-[0.28em] text-white/90">
              {label}
            </p>
            <h2
              className={cn(
                legacyDisplay,
                "mt-3 text-[1.65rem] font-light leading-snug text-white sm:text-[1.75rem]",
              )}
            >
              {title}
            </h2>
            <p className="mx-auto mt-3 max-w-[15rem] text-[13px] font-light leading-relaxed text-white/85">
              {description}
            </p>
            <p
              className={cn(
                legacyDisplay,
                "mt-8 text-sm italic text-white underline decoration-white/40 underline-offset-4 transition group-hover:decoration-white",
              )}
            >
              {cta}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={to} className={cn(CARD_SHELL, SOLID_CARD_BG)}>
      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col items-center px-6 py-10 text-center sm:px-8 sm:py-12",
          legacyBody,
        )}
      >
        <span
          className={cn("mb-6 flex h-12 w-12 items-center justify-center rounded-full", iconCircleClass)}
        >
          <Icon className={iconClass} aria-hidden />
        </span>

        <p className="text-[10px] font-light uppercase tracking-[0.28em] text-white/90">{label}</p>

        <h2
          className={cn(
            legacyDisplay,
            "mt-4 text-2xl font-light leading-snug text-white sm:text-[1.65rem]",
          )}
        >
          {title}
        </h2>

        <p className="mt-4 max-w-[16rem] text-sm font-light leading-relaxed text-white/75 sm:max-w-[18rem]">
          {description}
        </p>

        <p
          className={cn(
            legacyDisplay,
            "mt-auto pt-10 text-sm italic text-white underline decoration-white/40 underline-offset-4 transition group-hover:decoration-white",
          )}
        >
          {cta}
        </p>
      </div>
    </Link>
  );
}
