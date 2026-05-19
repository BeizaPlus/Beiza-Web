import { cn } from "@/lib/utils";

type CountryFlagProps = {
  /** ISO 3166-1 alpha-2 (e.g. GH, NG, GB) */
  code: string;
  size?: number;
  className?: string;
  alt?: string;
};

/** Renders a country flag image (reliable on Windows; emoji flags often show as "GH", "NG"). */
export function CountryFlag({ code, size = 20, className, alt }: CountryFlagProps) {
  const iso = code.toLowerCase();
  const width = Math.max(16, size);
  const height = Math.round(width * 0.75);

  return (
    <img
      src={`https://flagcdn.com/w${width * 2}/${iso}.png`}
      srcSet={`https://flagcdn.com/w${width * 2}/${iso}.png 1x, https://flagcdn.com/w${width * 4}/${iso}.png 2x`}
      width={width}
      height={height}
      alt={alt ?? `${code} flag`}
      className={cn("inline-block shrink-0 rounded-sm object-cover shadow-sm", className)}
      loading="lazy"
      decoding="async"
    />
  );
}
