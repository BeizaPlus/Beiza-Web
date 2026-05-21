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
        {/* Red top, Gold middle, Green bottom */}
        <rect width="30" height="6.67" y="0"     fill="#CE1126" />
        <rect width="30" height="6.67" y="6.67"  fill="#FCD116" />
        <rect width="30" height="6.67" y="13.33" fill="#006B3F" />
        {/* Black 5-pointed star centred in the gold band */}
        <polygon
          points="15,7 15.71,9.03 17.85,9.07 16.14,10.37 16.76,12.43 15,11.2 13.24,12.43 13.86,10.37 12.15,9.07 14.29,9.03"
          fill="#000000"
        />
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

    EN: (
      <svg
        width={size}
        height={size * 0.667}
        viewBox="0 0 30 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="United States flag"
        className={className}
      >
        <rect width="30" height="20" fill="#B22234" />
        {[0, 2, 4, 6, 8, 10, 12].map((y) => (
          <rect key={y} width="30" height="1.54" y={y * 1.54} fill="#fff" />
        ))}
        <rect width="12" height="10.8" fill="#3C3B6E" />
      </svg>
    ),

    CN: (
      <svg
        width={size}
        height={size * 0.667}
        viewBox="0 0 30 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="China flag"
        className={className}
      >
        <rect width="30" height="20" fill="#DE2910" />
        <polygon
          points="8,4 9.2,7.4 12.8,7.4 9.8,9.5 11,13 8,10.8 5,13 6.2,9.5 3.2,7.4 6.8,7.4"
          fill="#FFDE00"
        />
        {[
          [14, 2],
          [16, 4],
          [16, 7],
          [14, 9],
        ].map(([cx, cy], i) => (
          <polygon
            key={i}
            points={`${cx},${cy} ${cx + 0.6},${cy + 1.1} ${cx + 1.4},${cy + 1.1} ${cx + 0.8},${cy + 1.7} ${cx + 1},${cy + 2.6} ${cx},${cy + 2.1} ${cx - 1},${cy + 2.6} ${cx - 0.8},${cy + 1.7} ${cx - 1.4},${cy + 1.1} ${cx - 0.6},${cy + 1.1}`}
            fill="#FFDE00"
          />
        ))}
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
