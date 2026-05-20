import { useEffect, useState } from "react";
import { WelcomePathCard } from "@/components/welcome/WelcomePathCard";
import {
  getStoredWelcomeTheme,
  storeWelcomeTheme,
  WelcomeThemeToggle,
  type WelcomeTheme,
} from "@/components/welcome/WelcomeThemeToggle";
import { legacyBody, legacyDisplay } from "@/lib/legacyLandingFonts";
import { cn } from "@/lib/utils";

const LEGACY_CARD_IMAGE = "/assets/welcome-legacy-card.png";

const PATHS = [
  {
    to: "/heritage",
    label: "Legacy",
    title: "Preserve a life story",
    subtitle:
      "Capture voices, build your family tree, and turn memories into a memoir that lasts forever.",
    meta: "Start here",
    backgroundImage: LEGACY_CARD_IMAGE,
    backgroundImageAlt: "Hands holding a My Life Story memoir book",
  },
  {
    to: "/farewell",
    label: "Farewell",
    title: "Plan a farewell",
    subtitle:
      "Memorial art, legacy vessels, and caskets crafted to honor a life with dignity and beauty.",
    meta: "Learn more",
    backgroundGradient: "linear-gradient(165deg, #1e2838 0%, #0c1018 55%, #050608 100%)",
  },
  {
    to: "/education",
    label: "Education",
    title: "Learn your symbols",
    subtitle:
      "Discover Adinkra symbols and the living wisdom your people carried across generations.",
    meta: "Explore",
    backgroundGradient: "linear-gradient(165deg, #3d3428 0%, #1a1612 55%, #0a0908 100%)",
  },
] as const;

export default function WelcomeGate() {
  const [theme, setTheme] = useState<WelcomeTheme>("dark");

  useEffect(() => {
    setTheme(getStoredWelcomeTheme());
  }, []);

  const handleThemeChange = (next: WelcomeTheme) => {
    setTheme(next);
    storeWelcomeTheme(next);
  };

  const isLight = theme === "light";

  return (
    <div
      className={cn(
        legacyBody,
        "welcome-gate-page flex min-h-screen flex-col transition-colors duration-300",
        isLight ? "bg-[#f7f6f3] text-[#1a1816]" : "bg-black text-white",
      )}
    >
      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <WelcomeThemeToggle theme={theme} onThemeChange={handleThemeChange} />
      </div>

      <header className="flex flex-col items-center px-6 pb-4 pt-16 text-center sm:pt-20">
        <h1
          className={cn(
            legacyDisplay,
            "text-[2.5rem] font-light tracking-[0.12em] sm:text-[2.75rem]",
            isLight ? "text-[#1a1816]" : "text-white",
          )}
        >
          BEIZA
        </h1>
        <p
          className={cn(
            legacyBody,
            "mt-3 text-[10px] font-light uppercase tracking-[0.32em]",
            isLight ? "text-[#1a1816]/55" : "text-white/60",
          )}
        >
          Stories of the people we love
        </p>
        <p
          className={cn(
            legacyDisplay,
            "mt-10 max-w-md text-lg italic font-light sm:text-xl",
            isLight ? "text-[#1a1816]/90" : "text-white/95",
          )}
        >
          Where would you like to begin?
        </p>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {PATHS.map((path) => (
            <WelcomePathCard key={path.to} {...path} />
          ))}
        </div>
      </main>
    </div>
  );
}
