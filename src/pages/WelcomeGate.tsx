import { ChevronDown, BookOpen, Feather, GraduationCap } from "lucide-react";
import { WelcomePathCard } from "@/components/welcome/WelcomePathCard";
import { legacyBody, legacyDisplay } from "@/lib/legacyLandingFonts";
import { cn } from "@/lib/utils";

/** Book photo only — not the full /heritage page screenshot */
const LEGACY_CARD_IMAGE = "/assets/welcome-legacy-card.png";

const PATHS = [
  {
    to: "/heritage",
    label: "Legacy",
    title: "Preserve a life story",
    description:
      "Capture voices, build your family tree, and turn memories into a memoir that lasts forever.",
    cta: "Start here →",
    icon: BookOpen,
    iconCircleClass: "bg-[#d4ebe0]/95 text-[#1a4d3a]",
    backgroundImage: LEGACY_CARD_IMAGE,
    backgroundImageAlt: "Hands holding a My Life Story memoir book",
  },
  {
    to: "/farewell",
    label: "Farewell",
    title: "Plan a farewell",
    description:
      "Memorial art, legacy vessels, and caskets crafted to honor a life with dignity and beauty.",
    cta: "Learn more →",
    icon: Feather,
    iconCircleClass: "bg-[#d6e8f5] text-[#1e4a6b]",
  },
  {
    to: "/education",
    label: "Education",
    title: "Learn your symbols",
    description:
      "Discover the Adinkra symbols and the living wisdom your people carried across generations.",
    cta: "Explore →",
    icon: GraduationCap,
    iconCircleClass: "bg-[#e8dfd0] text-[#5c4a32]",
  },
] as const;

export default function WelcomeGate() {
  return (
    <div className={cn("flex min-h-screen flex-col bg-[#0a0a0a] text-white", legacyBody)}>
      <header className="flex flex-col items-center px-6 pt-14 text-center sm:pt-16">
        <h1
          className={cn(
            legacyDisplay,
            "text-4xl font-light tracking-[0.14em] text-white sm:text-[2.75rem]",
          )}
        >
          BEIZA
        </h1>
        <p className="mt-3 text-[10px] font-light uppercase tracking-[0.32em] text-white/65">
          Stories of the people we love
        </p>
        <div className="mt-8 h-px w-full max-w-md bg-white/10" aria-hidden />
        <p className={cn(legacyDisplay, "mt-8 text-lg italic font-light text-white/95 sm:text-xl")}>
          Where would you like to begin?
        </p>
      </header>

      <main
        id="paths"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-10 sm:px-6 lg:px-10"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
          {PATHS.map((path) => (
            <WelcomePathCard key={path.to} {...path} />
          ))}
        </div>
      </main>

      <div className="flex justify-center pb-10 pt-2">
        <a
          href="#paths"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/50 transition hover:border-white/40 hover:text-white/80"
          aria-label="Scroll to paths"
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}
