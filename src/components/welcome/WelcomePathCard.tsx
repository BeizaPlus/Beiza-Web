import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  "group relative flex min-h-[22rem] flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.06] transition duration-300 hover:border-white/15 sm:min-h-[26rem] lg:min-h-[28rem]";

const SOLID_CARD_BG = "bg-[#141414]";

/** Bottom-heavy overlay so copy reads on photo backgrounds. */
const PHOTO_OVERLAY =
  "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.2) 68%, rgba(0,0,0,0.08) 100%)";

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

  return (
    <Link to={to} className={cn(CARD_SHELL, !hasPhoto && SOLID_CARD_BG)}>
      {hasPhoto ? (
        <>
          <img
            src={backgroundImage}
            alt={backgroundImageAlt}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: PHOTO_OVERLAY }}
            aria-hidden
          />
        </>
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col items-center px-6 py-10 text-center sm:px-8 sm:py-12">
        <span
          className={cn(
            "mb-6 flex h-12 w-12 items-center justify-center rounded-full",
            iconCircleClass,
          )}
        >
          <Icon className={iconClass} aria-hidden />
        </span>

        <p className="font-manrope text-[10px] font-medium uppercase tracking-[0.28em] text-white/90">
          {label}
        </p>

        <h2 className="welcome-gate-serif mt-4 text-2xl font-medium leading-snug text-white sm:text-[1.65rem]">
          {title}
        </h2>

        <p className="mt-4 max-w-[16rem] font-manrope text-sm leading-relaxed text-white/80 sm:max-w-[18rem]">
          {description}
        </p>

        <p className="welcome-gate-serif mt-auto pt-10 text-sm italic text-white underline decoration-white/50 underline-offset-4 transition group-hover:decoration-white">
          {cta}
        </p>
      </div>
    </Link>
  );
}
