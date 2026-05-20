import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Feather, GraduationCap } from "lucide-react";
import { WelcomePathCard } from "@/components/welcome/WelcomePathCard";
import { welcomePathIconCircleClass } from "@/lib/welcomePathIconStyles";
import {
  getStoredWelcomeTheme,
  storeWelcomeTheme,
  WelcomeThemeToggle,
  type WelcomeTheme,
} from "@/components/welcome/WelcomeThemeToggle";
import { cn } from "@/lib/utils";

const BEIZA_LOGO = "/Beiza_White.svg";
const LEGACY_CARD_IMAGE = "/assets/welcome-legacy-card.png";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const heroVariants = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const subtitleVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delay: 0.3, duration: 0.6 } },
};

/** Left → center (featured) → right */
const PATHS = [
  {
    to: "/home",
    label: "Education",
    title: "Learn your culture",
    subtitle:
      "Discover Adinkra symbols and the living wisdom your people carried across generations.",
    meta: "Explore",
    icon: GraduationCap,
    iconCircleClass: welcomePathIconCircleClass.education,
    backgroundGradient: "linear-gradient(165deg, #3d3428 0%, #1a1612 55%, #0a0908 100%)",
  },
  {
    to: "/legacy/record",
    label: "Legacy",
    title: "Preserve a life story",
    subtitle:
      "Capture voices, build your family tree, and turn memories into a memoir that lasts forever.",
    meta: "Start here",
    icon: BookOpen,
    iconCircleClass: welcomePathIconCircleClass.legacy,
    backgroundImage: LEGACY_CARD_IMAGE,
    backgroundImageAlt: "Hands holding a My Life Story memoir book",
    featured: true,
  },
  {
    to: "/farewell",
    label: "Farewell",
    title: "Craft a memorial",
    subtitle:
      "Memorial art, legacy vessels, and caskets crafted to honor a life with dignity and beauty.",
    meta: "Learn more",
    icon: Feather,
    iconCircleClass: welcomePathIconCircleClass.farewell,
    backgroundGradient: "linear-gradient(165deg, #1e2838 0%, #0c1018 55%, #050608 100%)",
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
        "flex min-h-screen flex-col transition-colors duration-300",
        isLight ? "bg-[#f7f6f3] text-[#1a1816]" : "bg-black text-white",
      )}
    >
      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <WelcomeThemeToggle theme={theme} onThemeChange={handleThemeChange} />
      </div>

      <div className="container relative z-10 mx-auto flex w-full flex-1 flex-col px-6 py-20">
      <motion.header
        className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: {} }}
      >
        <motion.div variants={heroVariants} className="flex flex-col items-center">
          <img
            src={BEIZA_LOGO}
            alt="Beiza"
            className={cn("mx-auto mb-2 h-10 w-auto", isLight && "invert")}
          />
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-[0.32em]",
              isLight ? "text-[#1a1816]/55" : "text-white/60",
            )}
          >
            Stories of the people we love
          </p>
        </motion.div>
        <motion.p
          variants={subtitleVariants}
          className={cn(
            "mx-auto mt-10 max-w-2xl text-lg italic font-normal leading-relaxed sm:text-xl",
            isLight ? "text-[#1a1816]/90" : "text-white/95",
          )}
        >
          Where would you like to begin?
        </motion.p>
      </motion.header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-24 lg:py-32">
        <motion.div
          className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {PATHS.map((path) => (
            <motion.div key={path.to} variants={cardVariants} className="flex h-full min-w-0 w-full">
              <WelcomePathCard {...path} />
            </motion.div>
          ))}
        </motion.div>
      </main>
      </div>
    </div>
  );
}
