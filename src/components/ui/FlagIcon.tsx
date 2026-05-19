import type { ReactNode } from "react";

type FlagIconProps = {
  country: string;
  size?: number;
  className?: string;
};

export function FlagIcon({ country, size = 20, className }: FlagIconProps) {
  const flags: Record<string, ReactNode> = {
    GH: (
      <svg
        width={size}
        height={size * 0.667}
        viewBox="0 0 30 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Ghana flag"
        className={className}
      >
        <rect width="30" height="6.67" y="0" fill="#006B3F" />
        <rect width="30" height="6.67" y="6.67" fill="#FCD116" />
        <rect width="30" height="6.67" y="13.33" fill="#CE1126" />
        <polygon points="15,7.5 16.5,12 12,9 18,9 13.5,12" fill="#000000" />
      </svg>
    ),

    ES: (
      <svg
        width={size}
        height={size * 0.667}
        viewBox="0 0 30 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Spain flag"
        className={className}
      >
        <rect width="30" height="20" fill="#c60b1e" />
        <rect width="30" height="10" y="5" fill="#ffc400" />
      </svg>
    ),

    FR: (
      <svg
        width={size}
        height={size * 0.667}
        viewBox="0 0 30 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="France flag"
        className={className}
      >
        <rect width="10" height="20" x="0" fill="#002395" />
        <rect width="10" height="20" x="10" fill="#ffffff" />
        <rect width="10" height="20" x="20" fill="#ED2939" />
      </svg>
    ),

    GLOBAL: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Global"
        className={className}
      >
        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <ellipse cx="10" cy="10" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <line x1="1" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.2" />
        <line x1="10" y1="1" x2="10" y2="19" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  };

  return flags[country.toUpperCase()] ?? null;
}
