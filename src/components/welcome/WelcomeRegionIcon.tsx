import type { BeizaCharacterLocale } from "@/lib/locale/types";
import { cn } from "@/lib/utils";

type WelcomeRegionIconProps = {
  region: BeizaCharacterLocale;
  size?: number;
  className?: string;
};

/** Cultural region marks — not country flags or ISO codes */
const REGION_ICONS: Record<BeizaCharacterLocale, (size: number) => JSX.Element> = {
  "black-american": (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="7.5" r="3.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7.5 18c.8-2.8 2.7-4.5 4.5-4.5s3.7 1.7 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9 6.2c1.2-.9 2.5-1.1 3-.6.8.7-.2 2.1.5 2.8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  indian: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <circle
          key={deg}
          cx={12 + 5.5 * Math.cos((deg * Math.PI) / 180)}
          cy={12 + 5.5 * Math.sin((deg * Math.PI) / 180)}
          r="1.1"
          fill="currentColor"
        />
      ))}
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  latina: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <path
          key={deg}
          d={`M12 12 L12 ${4.5}`}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
      <path
        d="M8 16.5c2 1.2 6 1.2 8 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  chinese: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="6" y="6" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8.5 8.5c2.5 0 3.5 1.5 3.5 3.5M15.5 15.5c-2.5 0-3.5-1.5-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  ),
  brazilian: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 19c-4-3.5-7-7-7-10a7 7 0 0 1 14 0c0 3-3 6.5-7 10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v5M10 11h4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const REGION_LABELS: Record<BeizaCharacterLocale, string> = {
  "black-american": "Black American",
  indian: "Indian",
  latina: "Latina",
  chinese: "Chinese",
  brazilian: "Brazilian",
};

export function getWelcomeRegionLabel(region: BeizaCharacterLocale) {
  return REGION_LABELS[region];
}

export function WelcomeRegionIcon({ region, size = 18, className }: WelcomeRegionIconProps) {
  const Icon = REGION_ICONS[region];
  return <span className={cn("inline-flex shrink-0", className)}>{Icon(size)}</span>;
}
