import { Link, useLocation } from "react-router-dom";
import { isLegacyStudioPreview } from "@/lib/layoutStudio";

const LINKS = [
  { label: "Sign-in shell", search: "recordShell=signin" },
  { label: "Station · prepare", search: "recordShell=station&recordPhase=prepare" },
  { label: "Station · upload", search: "recordShell=station&recordPhase=upload" },
  { label: "Station · seal", search: "recordShell=station&recordPhase=seal" },
] as const;

/** Fixed hint bar when layout studio is on (no email required). */
export function StudioModeBanner() {
  const location = useLocation();
  if (!isLegacyStudioPreview()) return null;

  const studioParams = () => {
    const params = new URLSearchParams(location.search);
    params.set("studio", "1");
    return params;
  };

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-[var(--site-header-h,5.5rem)] z-[55] flex justify-center px-2">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-primary/40 bg-black/90 px-3 py-1.5 font-manrope text-[10px] text-white/90 shadow-lg backdrop-blur-sm">
        <span className="font-semibold uppercase tracking-wide text-primary">Studio</span>
        <span className="text-white/50">·</span>
        <span>No sign-in</span>
        {LINKS.map((item) => {
          const params = studioParams();
          for (const part of item.search.split("&")) {
            const [key, value] = part.split("=");
            if (key) params.set(key, value ?? "");
          }
          return (
            <Link
              key={item.search}
              to={{ pathname: location.pathname, search: `?${params.toString()}` }}
              className="rounded-full bg-white/10 px-2 py-0.5 text-white hover:bg-primary/30 hover:text-primary"
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
