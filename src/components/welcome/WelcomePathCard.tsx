import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type WelcomePathCardProps = {
  to: string;
  label: string;
  title: string;
  subtitle: string;
  meta: string;
  icon: LucideIcon;
  iconCircleClass: string;
  iconClass?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  backgroundGradient?: string;
  featured?: boolean;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  iconOffsetY?: number;
};

const PHOTO_OVERLAY =
  "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.95) 100%)";

export function WelcomePathCard({
  to,
  label,
  title,
  subtitle,
  meta,
  icon: Icon,
  iconCircleClass,
  iconClass = "h-5 w-5",
  backgroundImage,
  backgroundImageAlt = "",
  backgroundGradient,
  featured = false,
  imageZoom = 1,
  imageOffsetX = 50,
  imageOffsetY = 50,
  iconOffsetY = 0,
}: WelcomePathCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "font-sans group relative aspect-[2/3] w-full min-h-[320px] overflow-hidden rounded-[10px] border border-transparent",
        "transition duration-300 hover:border-white sm:min-h-[380px] lg:min-h-[420px]",
        featured &&
          "z-10 border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.45),0_0_28px_hsl(var(--primary)/0.22)]",
      )}
    >
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt={backgroundImageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            objectPosition: `${imageOffsetX}% ${imageOffsetY}%`,
            transform: `scale(${imageZoom})`,
            transformOrigin: `${imageOffsetX}% ${imageOffsetY}%`,
          }}
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

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 pt-20 text-left sm:px-5 sm:pb-6">
        <span
          className={cn(
            "mb-3 flex h-10 w-10 items-center justify-center rounded-full",
            featured ? "bg-primary text-primary-foreground" : iconCircleClass,
          )}
          style={{ transform: `translateY(${-iconOffsetY}px)` }}
        >
          <Icon className={iconClass} aria-hidden />
        </span>
        <h2 className="font-sans text-[1.35rem] font-semibold leading-tight text-white sm:text-[1.5rem] lg:text-[1.65rem]">
          {title}
        </h2>
        <p className="mt-2 min-w-0 w-full text-[13px] font-normal leading-snug text-white/90 sm:text-sm">{subtitle}</p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-white/65">{meta}</p>
      </div>
    </Link>
  );
}
