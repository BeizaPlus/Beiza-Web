import { useState } from "react";
import { MEDIA_ASSETS } from "@/lib/mediaAssets";
import { cn } from "@/lib/utils";

function BeizaMascotFallback({ className }: { className?: string }) {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-primary", className)}
      aria-hidden
    >
      <rect x="2" y="2" width="32" height="32" rx="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M23 11.5c-2.8-1.6-6.4-1.2-8.5 1.1-2.4 2.6-2.1 6.6.6 8.8 2.2 1.8 5.4 2 7.9.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="11" r="1.5" fill="currentColor" />
    </svg>
  );
}

type LegacyBeizaMascotProps = {
  className?: string;
};

/** Beiza mascot — always visible; SVG fallback if image fails. */
export function LegacyBeizaMascot({ className }: LegacyBeizaMascotProps) {
  const [useFallback, setUseFallback] = useState(false);

  if (useFallback) {
    return <BeizaMascotFallback className={className} />;
  }

  return (
    <img
      src={MEDIA_ASSETS.brand.mascotHead.src}
      alt="Beiza"
      width={36}
      height={36}
      className={cn("h-9 w-9 shrink-0 object-contain opacity-100", className)}
      onError={() => setUseFallback(true)}
    />
  );
}
