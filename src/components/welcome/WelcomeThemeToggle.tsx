import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "beiza-welcome-theme";

export type WelcomeTheme = "dark" | "light";

export function getStoredWelcomeTheme(): WelcomeTheme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

export function storeWelcomeTheme(theme: WelcomeTheme) {
  localStorage.setItem(STORAGE_KEY, theme);
}

type WelcomeThemeToggleProps = {
  theme: WelcomeTheme;
  onThemeChange: (theme: WelcomeTheme) => void;
};

export function WelcomeThemeToggle({ theme, onThemeChange }: WelcomeThemeToggleProps) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => onThemeChange(isLight ? "dark" : "light")}
      className={cn(
        "font-sans flex h-10 w-10 items-center justify-center rounded-full border transition",
        isLight
          ? "border-black/15 bg-white text-black hover:bg-black/5"
          : "border-white/25 bg-white/5 text-white hover:bg-white/10",
      )}
      aria-label={isLight ? "Switch to black background" : "Switch to white background"}
      title={isLight ? "Black background" : "White background"}
    >
      {isLight ? <Moon className="h-4 w-4" strokeWidth={1.5} /> : <Sun className="h-4 w-4" strokeWidth={1.5} />}
    </button>
  );
}
