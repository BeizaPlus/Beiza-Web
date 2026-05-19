import { cn } from "@/lib/utils";

type CasketIconProps = {
  size?: number;
  /** @deprecated Prefer `className="text-primary"` on the svg */
  color?: string;
  className?: string;
};

export function CasketIcon({ size = 28, color, className }: CasketIconProps) {
  const stroke = color ?? "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn(!color && "text-primary", className)}
    >
      <path
        d="M9 3 L19 3 L23 8 L23 22 L19 25 L9 25 L5 22 L5 8 Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="5"
        y1="11"
        x2="23"
        y2="11"
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity="0.5"
      />
      <line x1="14" y1="5" x2="14" y2="9" stroke={stroke} strokeWidth="1.2" />
      <line x1="12" y1="7" x2="16" y2="7" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}
