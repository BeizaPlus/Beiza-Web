import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Feather, GraduationCap } from "lucide-react";
import { WelcomePathCard } from "@/components/welcome/WelcomePathCard";
import { welcomePathIconHoverBgClass, welcomePathIconHoverFgClass } from "@/lib/welcomePathIconStyles";
import {
  getStoredWelcomeTheme,
  storeWelcomeTheme,
  WelcomeThemeToggle,
  type WelcomeTheme,
} from "@/components/welcome/WelcomeThemeToggle";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
import { StudioSlider } from "@/components/dev/StudioSlider";
import { BRAND_IMAGES } from "@/lib/brandImages";
import { cn } from "@/lib/utils";

const BEIZA_LOGO = "/Beiza_White.svg";
/** Same mascot head as legacy nav (`BeizaLogoLink`, `LegacyBeizaMascot`) */
const BEIZA_MASCOT = "/Beiza-head.png";
const LEGACY_CARD_IMAGE = BRAND_IMAGES.welcomeLegacyLifeStory;
/** Same hero as https://www.beizaplus.com/home */
const HOME_HERO_IMAGE = BRAND_IMAGES.homepageHero;
/** Same hero as https://www.beizaplus.com/farewell */
const FAREWELL_HERO_IMAGE = BRAND_IMAGES.heritageHero;

/* ── Studio persistence ── */
const STUDIO_KEY = "welcome-gate-studio";

type CardStudio = { imageZoom: number; imageOffsetX: number; imageOffsetY: number };
type StudioState = {
  legacy: CardStudio;
  education: CardStudio;
  farewell: CardStudio;
  /** Shared vertical position for all card icons (0–100%, top → bottom) */
  iconOffsetY: number;
  /** Lift bottom title/copy block upward (px) */
  copyLift: number;
  showIconCircleBg: boolean;
  logoScale: number;
  useMascot: boolean;
  /** Studio: cards are not links — safe for drag-to-pan */
  lockCardLinks: boolean;
};

const DEFAULT_STUDIO: StudioState = {
  legacy: {
    imageZoom: 1.73,
    imageOffsetX: 35.27901785714287,
    imageOffsetY: 23.1409632034632,
  },
  education: {
    imageZoom: 2.25,
    imageOffsetX: 24.955212734541828,
    imageOffsetY: 34.49371431708387,
  },
  farewell: {
    imageZoom: 1.87,
    imageOffsetX: 55.04626360004125,
    imageOffsetY: 26.061007957559674,
  },
  iconOffsetY: 92,
  copyLift: 38,
  showIconCircleBg: false,
  logoScale: 2.25,
  useMascot: true,
  lockCardLinks: true,
};

/** Old studio stored iconOffsetY as px (0–200); map to 0–100% */
function migrateIconOffsetY(value: number): number {
  if (value > 100) return Math.min(100, Math.round((value / 200) * 100));
  if (value < 0) return Math.max(0, Math.round(((value + 200) / 400) * 100));
  return value;
}

function normalizeCardStudio(
  card: (Partial<CardStudio> & { iconOffsetY?: number }) | undefined,
  fallback: CardStudio,
): CardStudio {
  const { iconOffsetY: _drop, ...rest } = card ?? {};
  return { ...fallback, ...rest };
}

function loadStudio(): StudioState {
  try {
    const raw = JSON.parse(localStorage.getItem(STUDIO_KEY) ?? "{}") as Partial<StudioState> & {
      legacy?: Partial<CardStudio> & { iconOffsetY?: number };
      education?: Partial<CardStudio> & { iconOffsetY?: number };
      farewell?: Partial<CardStudio> & { iconOffsetY?: number };
    };
    const legacyIcon = raw.legacy?.iconOffsetY;
    const iconOffsetY = migrateIconOffsetY(
      raw.iconOffsetY ?? legacyIcon ?? raw.education?.iconOffsetY ?? raw.farewell?.iconOffsetY ?? DEFAULT_STUDIO.iconOffsetY,
    );
    return {
      ...DEFAULT_STUDIO,
      ...raw,
      iconOffsetY,
      copyLift: typeof raw.copyLift === "number" ? raw.copyLift : DEFAULT_STUDIO.copyLift,
      showIconCircleBg: raw.showIconCircleBg ?? DEFAULT_STUDIO.showIconCircleBg,
      lockCardLinks: raw.lockCardLinks ?? DEFAULT_STUDIO.lockCardLinks,
      legacy: normalizeCardStudio(raw.legacy, DEFAULT_STUDIO.legacy),
      education: normalizeCardStudio(raw.education, DEFAULT_STUDIO.education),
      farewell: normalizeCardStudio(raw.farewell, DEFAULT_STUDIO.farewell),
    };
  } catch {
    return DEFAULT_STUDIO;
  }
}
function saveStudio(s: StudioState) { localStorage.setItem(STUDIO_KEY, JSON.stringify(s)); }

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

      {/* Global: logo + all icons */}
      <div className="mb-4 space-y-3 border-b border-border pb-4">
        <StudioSlider compact label="Logo scale" value={studio.logoScale} defaultValue={DEFAULT_STUDIO.logoScale}
          min={0.5} max={3} step={0.05} onChange={v => patchGlobal({ logoScale: v })} />
        <StudioSlider compact label="All icons top → bottom (%)" value={studio.iconOffsetY} defaultValue={DEFAULT_STUDIO.iconOffsetY}
          min={0} max={100} step={1} onChange={v => patchGlobal({ iconOffsetY: v })} />
        <StudioSlider compact label="Lift copy ↑ (px)" value={studio.copyLift} defaultValue={DEFAULT_STUDIO.copyLift}
          min={0} max={80} step={1} onChange={v => patchGlobal({ copyLift: v })} />
        <label className="flex cursor-pointer items-center justify-between text-[10px] text-muted-foreground">
          Icon circle background
          <input type="checkbox" checked={studio.showIconCircleBg}
            onChange={e => patchGlobal({ showIconCircleBg: e.target.checked })} className="accent-primary" />
        </label>
        <label className="flex cursor-pointer items-center justify-between text-[10px] text-muted-foreground">
          Use mascot head
          <input type="checkbox" checked={studio.useMascot} onChange={e => patchGlobal({ useMascot: e.target.checked })} className="accent-primary" />
        </label>
        <label className="flex cursor-pointer items-center justify-between text-[10px] text-muted-foreground">
          Lock cards (no navigation)
          <input type="checkbox" checked={studio.lockCardLinks}
            onChange={e => patchGlobal({ lockCardLinks: e.target.checked })} className="accent-primary" />
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

      <p className="mb-2 text-[9px] leading-snug text-muted-foreground">
        Drag any card photo to pan (sliders stay in sync). Lock cards stops navigation only.
      </p>

      <div className="space-y-3">
        <StudioSlider compact label="Zoom" value={s.imageZoom} defaultValue={DEFAULT_STUDIO[card].imageZoom}
          min={1} max={2.5} step={0.01} onChange={v => patchCard({ imageZoom: v })} />
        <StudioSlider compact label="← Left / Right →" value={s.imageOffsetX} defaultValue={DEFAULT_STUDIO[card].imageOffsetX}
          min={0} max={100} step={1} onChange={v => patchCard({ imageOffsetX: v })} />
        <StudioSlider compact label="↑ Top / Bottom ↓" value={s.imageOffsetY} defaultValue={DEFAULT_STUDIO[card].imageOffsetY}
          min={0} max={100} step={1} onChange={v => patchCard({ imageOffsetY: v })} />
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
    to: "/education",
    label: "Education",
    title: "Learn your culture",
    subtitle: "Discover Adinkra symbols and the living wisdom your people carried across generations.",
    meta: "Explore",
    icon: GraduationCap,
    iconHoverFgClass: welcomePathIconHoverFgClass.education,
    iconHoverBgClass: welcomePathIconHoverBgClass.education,
    backgroundImage: HOME_HERO_IMAGE,
    backgroundImageAlt: "Hands holding Adinkra symbol blocks",
  },
  {
    to: "/legacy/record",
    label: "Legacy",
    title: "Preserve a life story",
    subtitle: "Capture voices, build your family tree, and turn memories into a memoir that lasts forever.",
    meta: "Start here",
    icon: BookOpen,
    iconHoverFgClass: welcomePathIconHoverFgClass.legacy,
    iconHoverBgClass: welcomePathIconHoverBgClass.legacy,
    backgroundImage: LEGACY_CARD_IMAGE,
    backgroundImageAlt: "Hands holding a My Life Story memoir book",
  },
  {
    to: "/farewell",
    label: "Farewell",
    title: "Craft a memorial",
    subtitle: "Memorial art, legacy vessels, and caskets crafted to honor a life with dignity and beauty.",
    meta: "Learn more",
    icon: Feather,
    iconHoverFgClass: welcomePathIconHoverFgClass.farewell,
    iconHoverBgClass: welcomePathIconHoverBgClass.farewell,
    backgroundImage: FAREWELL_HERO_IMAGE,
    backgroundImageAlt: "Elder in red kente before Gye Nyame carving",
  },
] as const;

export default function WelcomeGate() {
  const [theme, setTheme] = useState<WelcomeTheme>("dark");
  const [studio, setStudio] = useState<StudioState>(DEFAULT_STUDIO);
  const studioEnabled = isLayoutStudioEnabled();

  useEffect(() => {
    setTheme(getStoredWelcomeTheme());
    setStudio(loadStudio());
  }, []);

  const isLight = theme === "light";
  const logoHeightRem = 2.5 * studio.logoScale;

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
            {studio.useMascot ? (
              <img
                src={BEIZA_MASCOT}
                alt=""
                aria-hidden
                className="mx-auto mb-2 object-contain"
                style={{ height: `${logoHeightRem}rem`, width: `${logoHeightRem}rem` }}
              />
            ) : (
              <img
                src={BEIZA_LOGO}
                alt="Beiza"
                className={cn("mx-auto mb-2 w-auto", isLight && "invert")}
                style={{ height: `${logoHeightRem}rem` }}
              />
            )}
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
              const patchCardImage = (partial: Partial<CardStudio>, persist = true) => {
                const next = { ...studio, [cardKey]: { ...studio[cardKey], ...partial } };
                setStudio(next);
                if (persist) saveStudio(next);
              };
              return (
                <motion.div key={path.to} variants={cardVariants} className="flex h-full min-w-0 w-full">
                  <WelcomePathCard {...path}
                    imageZoom={s.imageZoom}
                    imageOffsetX={s.imageOffsetX}
                    imageOffsetY={s.imageOffsetY}
                    iconOffsetY={studio.iconOffsetY}
                    copyLift={studio.copyLift}
                    showIconCircleBg={studio.showIconCircleBg}
                    disableNavigation={studioEnabled && studio.lockCardLinks}
                    studioImageDrag={studioEnabled}
                    onImagePositionLive={
                      studioEnabled
                        ? ({ imageOffsetX, imageOffsetY }) =>
                            patchCardImage({ imageOffsetX, imageOffsetY }, false)
                        : undefined
                    }
                    onImagePositionCommit={
                      studioEnabled
                        ? ({ imageOffsetX, imageOffsetY }) => patchCardImage({ imageOffsetX, imageOffsetY })
                        : undefined
                    }
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
