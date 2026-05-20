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
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
import { cn } from "@/lib/utils";

const BEIZA_LOGO = "/Beiza_White.svg";
const BEIZA_MASCOT = "/Beiza_Mascot.svg";
const LEGACY_CARD_IMAGE = "/assets/welcome-legacy-card.png";

/* ── Studio persistence ── */
const STUDIO_KEY = "welcome-gate-studio";

type CardStudio = { imageZoom: number; imageOffsetX: number; imageOffsetY: number; iconOffsetY: number };
type StudioState = {
  legacy: CardStudio;
  education: CardStudio;
  farewell: CardStudio;
  logoScale: number;
  useMascot: boolean;
};

const DEFAULT_STUDIO: StudioState = {
  legacy:    { imageZoom: 1.36, imageOffsetX: 58, imageOffsetY: 100, iconOffsetY: 200 },
  education: { imageZoom: 1,    imageOffsetX: 50, imageOffsetY: 50,  iconOffsetY: 0   },
  farewell:  { imageZoom: 1,    imageOffsetX: 50, imageOffsetY: 50,  iconOffsetY: 0   },
  logoScale: 2.05,
  useMascot: false,
};

function loadStudio(): StudioState {
  try { return { ...DEFAULT_STUDIO, ...JSON.parse(localStorage.getItem(STUDIO_KEY) ?? "{}") }; }
  catch { return DEFAULT_STUDIO; }
}
function saveStudio(s: StudioState) { localStorage.setItem(STUDIO_KEY, JSON.stringify(s)); }

/* ── Slider ── */
function Slider({ label, value, min, max, step = 0.01, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span><span>{Number(value).toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary" />
    </div>
  );
}

/* ── Studio panel ── */
function WelcomeStudioPanel({ studio, onChange }: { studio: StudioState; onChange: (s: StudioState) => void }) {
  const [open, setOpen] = useState(true);
  const [card, setCard] = useState<"education" | "legacy" | "farewell">("legacy");
  const [editText, setEditText] = useState(false);

  const patchCard = (partial: Partial<CardStudio>) => {
    const next = { ...studio, [card]: { ...studio[card], ...partial } };
    onChange(next); saveStudio(next);
  };
  const patchGlobal = (partial: Partial<StudioState>) => {
    const next = { ...studio, ...partial };
    onChange(next); saveStudio(next);
  };

  const toggleEditText = () => {
    const next = !editText;
    setEditText(next);
    document.designMode = next ? "on" : "off";
  };

  const exportJson = () => {
    const json = JSON.stringify(studio, null, 2);
    navigator.clipboard.writeText(json).then(() => alert("JSON copied to clipboard!"));
  };

  const s = studio[card];

  return (
    <FloatingStudioShell panelId="welcome-gate" open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
      {/* Edit text toggle */}
      <button onClick={toggleEditText}
        className={cn("mb-3 w-full rounded-md py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors",
          editText ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground")}>
        {editText ? "✎ Click any text to edit" : "Edit text"}
      </button>

      {/* Global: logo */}
      <div className="mb-4 space-y-3 border-b border-border pb-4">
        <Slider label="Logo scale" value={studio.logoScale} min={0.5} max={3} step={0.05} onChange={v => patchGlobal({ logoScale: v })} />
        <label className="flex cursor-pointer items-center justify-between text-[10px] text-muted-foreground">
          Use mascot head
          <input type="checkbox" checked={studio.useMascot} onChange={e => patchGlobal({ useMascot: e.target.checked })} className="accent-primary" />
        </label>
      </div>

      {/* Card selector */}
      <div className="mb-3 flex gap-1 rounded-lg bg-secondary p-1 text-[10px] font-medium uppercase">
        {(["education", "legacy", "farewell"] as const).map(k => (
          <button key={k} onClick={() => setCard(k)}
            className={cn("flex-1 rounded-md py-1.5 transition-colors",
              card === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {k === "education" ? "Edu" : k === "legacy" ? "Legacy" : "Farewell"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <Slider label="Zoom" value={s.imageZoom} min={1} max={2.5} step={0.01} onChange={v => patchCard({ imageZoom: v })} />
        <Slider label="← Left / Right →" value={s.imageOffsetX} min={0} max={100} step={1} onChange={v => patchCard({ imageOffsetX: v })} />
        <Slider label="↑ Top / Bottom ↓" value={s.imageOffsetY} min={0} max={100} step={1} onChange={v => patchCard({ imageOffsetY: v })} />
        <Slider label="Icon ↑ up / down ↓" value={s.iconOffsetY} min={-200} max={200} step={1} onChange={v => patchCard({ iconOffsetY: v })} />
      </div>

      <button onClick={exportJson}
        className="mt-4 w-full rounded-md border border-border py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
        Copy JSON
      </button>
    </FloatingStudioShell>
  );
}

/* ── Animations ── */
const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const cardVariants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };
const heroVariants = { hidden: { opacity: 0, y: -12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } } };
const subtitleVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.3, duration: 0.6 } } };

const PATHS = [
  {
    to: "/home",
    label: "Education",
    title: "Learn your culture",
    subtitle: "Discover Adinkra symbols and the living wisdom your people carried across generations.",
    meta: "Explore",
    icon: GraduationCap,
    iconCircleClass: welcomePathIconCircleClass.education,
    backgroundGradient: "linear-gradient(165deg, #3d3428 0%, #1a1612 55%, #0a0908 100%)",
  },
  {
    to: "/legacy/record",
    label: "Legacy",
    title: "Preserve a life story",
    subtitle: "Capture voices, build your family tree, and turn memories into a memoir that lasts forever.",
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
    subtitle: "Memorial art, legacy vessels, and caskets crafted to honor a life with dignity and beauty.",
    meta: "Learn more",
    icon: Feather,
    iconCircleClass: welcomePathIconCircleClass.farewell,
    backgroundGradient: "linear-gradient(165deg, #1e2838 0%, #0c1018 55%, #050608 100%)",
  },
] as const;

export default function WelcomeGate() {
  const [theme, setTheme] = useState<WelcomeTheme>("dark");
  const [studio, setStudio] = useState<StudioState>(DEFAULT_STUDIO);
  const studioEnabled = isLayoutStudioEnabled();

  useEffect(() => {
    setTheme(getStoredWelcomeTheme());
    if (studioEnabled) setStudio(loadStudio());
  }, [studioEnabled]);

  const isLight = theme === "light";
  const logoSrc = studio.useMascot ? BEIZA_MASCOT : BEIZA_LOGO;

  return (
    <div className={cn("flex min-h-screen flex-col transition-colors duration-300",
      isLight ? "bg-[#f7f6f3] text-[#1a1816]" : "bg-black text-white")}>
      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <WelcomeThemeToggle theme={theme} onThemeChange={(next) => { setTheme(next); storeWelcomeTheme(next); }} />
      </div>

      <div className="container relative z-10 mx-auto flex w-full flex-1 flex-col px-6 py-10">
        <motion.header className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
          initial="hidden" animate="show" variants={{ hidden: {}, show: {} }}>
          <motion.div variants={heroVariants} className="flex flex-col items-center">
            <img
              src={logoSrc}
              alt="Beiza"
              className={cn("mx-auto mb-2 w-auto", isLight && "invert")}
              style={{ height: `${2.5 * studio.logoScale}rem` }}
            />
            <p className={cn("text-[10px] font-medium uppercase tracking-[0.32em]",
              isLight ? "text-[#1a1816]/55" : "text-white/60")}>
              Stories of the people we love
            </p>
          </motion.div>
          <motion.p variants={subtitleVariants}
            className={cn("mx-auto mt-6 max-w-2xl text-lg italic font-normal leading-relaxed sm:text-xl",
              isLight ? "text-[#1a1816]/90" : "text-white/95")}>
            Where would you like to begin?
          </motion.p>
        </motion.header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <motion.div
            className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3"
            variants={containerVariants} initial="hidden" animate="show">
            {PATHS.map((path) => {
              const cardKey = path.label.toLowerCase() as "education" | "legacy" | "farewell";
              const s = studio[cardKey] ?? DEFAULT_STUDIO.legacy;
              return (
                <motion.div key={path.to} variants={cardVariants} className="flex h-full min-w-0 w-full">
                  <WelcomePathCard {...path}
                    imageZoom={s.imageZoom}
                    imageOffsetX={s.imageOffsetX}
                    imageOffsetY={s.imageOffsetY}
                    iconOffsetY={s.iconOffsetY}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </main>
      </div>

      {studioEnabled && <WelcomeStudioPanel studio={studio} onChange={setStudio} />}
    </div>
  );
}
