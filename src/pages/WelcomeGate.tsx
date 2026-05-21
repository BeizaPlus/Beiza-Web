import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Feather, GraduationCap } from "lucide-react";
import { WelcomePathCard } from "@/components/welcome/WelcomePathCard";
import { WelcomeGateToolbar } from "@/components/welcome/WelcomeGateToolbar";
import { welcomePathIconHoverBgClass, welcomePathIconHoverFgClass } from "@/lib/welcomePathIconStyles";
import {
  getStoredWelcomeTheme,
  storeWelcomeTheme,
  type WelcomeTheme,
} from "@/components/welcome/WelcomeThemeToggle";
import { useLocaleContext } from "@/context/LocaleContext";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";
import { StudioSlider } from "@/components/dev/StudioSlider";
import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import { getWelcomeCardImage } from "@/lib/locale/welcomeImages";
import { getWelcomeCardHref } from "@/lib/locale/welcomeRegionalRoutes";
import type { BeizaLocale, WelcomePathKey } from "@/lib/locale/types";
import {
  DEFAULT_STUDIO_BY_LOCALE,
  DEFAULT_STUDIO_GLOBAL,
  loadWelcomeStudioStore,
  patchLocaleCard,
  patchStudioGlobal,
  saveWelcomeStudioStore,
  studioStateForLocale,
  type CardStudio,
  type StudioState,
  type WelcomeStudioStore,
} from "@/lib/welcomeStudio";
import { cn } from "@/lib/utils";

const BEIZA_LOGO = "/Beiza_White.svg";
const BEIZA_MASCOT = "/Beiza-head.png";

const PATH_KEYS: WelcomePathKey[] = ["education", "legacy", "farewell"];
const PATH_ICONS = {
  education: GraduationCap,
  legacy: BookOpen,
  farewell: Feather,
} as const;

const LOCALE_STUDIO_LABEL: Record<BeizaLocale, string> = {
  "black-american": "US",
  indian: "IN",
  latina: "LA",
  chinese: "CN",
  brazilian: "BR",
  africa: "AF",
  fr: "FR",
};

function WelcomeStudioPanel({
  store,
  locale,
  studio,
  onStoreChange,
}: {
  store: WelcomeStudioStore;
  locale: BeizaLocale;
  studio: StudioState;
  onStoreChange: (s: WelcomeStudioStore) => void;
}) {
  const [open, setOpen] = useState(true);
  const [card, setCard] = useState<WelcomePathKey>("legacy");
  const [editText, setEditText] = useState(false);
  const localeDefaults = DEFAULT_STUDIO_BY_LOCALE[locale];

  const persist = (next: WelcomeStudioStore) => {
    onStoreChange(next);
    saveWelcomeStudioStore(next);
  };

  const patchCard = (partial: Partial<CardStudio>) => {
    persist(patchLocaleCard(store, locale, card, partial));
  };

  const patchGlobal = (partial: Parameters<typeof patchStudioGlobal>[1]) => {
    persist(patchStudioGlobal(store, partial));
  };

  const toggleEditText = () => {
    const next = !editText;
    setEditText(next);
    document.designMode = next ? "on" : "off";
  };

  const exportJson = () => {
    navigator.clipboard.writeText(JSON.stringify(store, null, 2)).then(() => {
      alert("Full regional JSON copied — paste into welcomeStudio.ts defaults before commit.");
    });
  };

  const s = studio[card];

  return (
    <FloatingStudioShell panelId="welcome-gate" open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
      <p className="mb-2 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        Region: {LOCALE_STUDIO_LABEL[locale]} · card crops saved per locale
      </p>

      <button
        onClick={toggleEditText}
        className={cn(
          "mb-3 w-full rounded-md py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors",
          editText
            ? "bg-primary text-primary-foreground"
            : "border border-border text-muted-foreground hover:text-foreground",
        )}
      >
        {editText ? "✎ Click any text to edit" : "Edit text"}
      </button>

      <div className="mb-4 space-y-3 border-b border-border pb-4">
        <StudioSlider
          compact
          label="Logo scale"
          value={studio.logoScale}
          defaultValue={DEFAULT_STUDIO_GLOBAL.logoScale}
          min={0.5}
          max={3}
          step={0.05}
          onChange={(v) => patchGlobal({ logoScale: v })}
        />
        <StudioSlider
          compact
          label="All icons top → bottom (%)"
          value={studio.iconOffsetY}
          defaultValue={DEFAULT_STUDIO_GLOBAL.iconOffsetY}
          min={0}
          max={100}
          step={1}
          onChange={(v) => patchGlobal({ iconOffsetY: v })}
        />
        <StudioSlider
          compact
          label="Lift copy ↑ (px)"
          value={studio.copyLift}
          defaultValue={DEFAULT_STUDIO_GLOBAL.copyLift}
          min={0}
          max={80}
          step={1}
          onChange={(v) => patchGlobal({ copyLift: v })}
        />
        <label className="flex cursor-pointer items-center justify-between text-[10px] text-muted-foreground">
          Icon circle background
          <input
            type="checkbox"
            checked={studio.showIconCircleBg}
            onChange={(e) => patchGlobal({ showIconCircleBg: e.target.checked })}
            className="accent-primary"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between text-[10px] text-muted-foreground">
          Use mascot head
          <input
            type="checkbox"
            checked={studio.useMascot}
            onChange={(e) => patchGlobal({ useMascot: e.target.checked })}
            className="accent-primary"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between text-[10px] text-muted-foreground">
          Lock cards (no navigation)
          <input
            type="checkbox"
            checked={studio.lockCardLinks}
            onChange={(e) => patchGlobal({ lockCardLinks: e.target.checked })}
            className="accent-primary"
          />
        </label>
      </div>

      <div className="mb-3 flex gap-1 rounded-lg bg-secondary p-1 text-[10px] font-medium uppercase">
        {PATH_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setCard(k)}
            className={cn(
              "flex-1 rounded-md py-1.5 transition-colors",
              card === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {k === "education" ? "Edu" : k === "legacy" ? "Legacy" : "Farewell"}
          </button>
        ))}
      </div>

      <p className="mb-2 text-[9px] leading-snug text-muted-foreground">
        Only the center Legacy photo changes per character (US/IN/LA/CN/BR). Tune Legacy per character, then Copy JSON.
      </p>

      <div className="space-y-3">
        <StudioSlider
          compact
          label="Zoom"
          value={s.imageZoom}
          defaultValue={localeDefaults[card].imageZoom}
          min={1}
          max={2.5}
          step={0.01}
          onChange={(v) => patchCard({ imageZoom: v })}
        />
        <StudioSlider
          compact
          label="← Left / Right →"
          value={s.imageOffsetX}
          defaultValue={localeDefaults[card].imageOffsetX}
          min={0}
          max={100}
          step={1}
          onChange={(v) => patchCard({ imageOffsetX: v })}
        />
        <StudioSlider
          compact
          label="↑ Top / Bottom ↓"
          value={s.imageOffsetY}
          defaultValue={localeDefaults[card].imageOffsetY}
          min={0}
          max={100}
          step={1}
          onChange={(v) => patchCard({ imageOffsetY: v })}
        />
      </div>

      <button
        onClick={exportJson}
        className="mt-4 w-full rounded-md border border-border py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        Copy JSON (all regions)
      </button>
    </FloatingStudioShell>
  );
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
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

export default function WelcomeGate() {
  const { locale, ready } = useLocaleContext();
  const [theme, setTheme] = useState<WelcomeTheme>("dark");
  const [store, setStore] = useState<WelcomeStudioStore>(() => loadWelcomeStudioStore());
  const studioEnabled = isLayoutStudioEnabled();

  useEffect(() => {
    setTheme(getStoredWelcomeTheme());
    setStore(loadWelcomeStudioStore());
  }, []);

  const studio = useMemo(() => studioStateForLocale(store, locale), [store, locale]);
  const copy = welcomeCopyForLocale(locale);

  const paths = useMemo(
    () =>
      PATH_KEYS.map((key) => {
        const img = getWelcomeCardImage(locale, key);
        const text = copy.paths[key];
        return {
          key,
          to: getWelcomeCardHref(locale, key),
          label: text.label,
          title: text.title,
          subtitle: text.subtitle,
          meta: text.meta,
          icon: PATH_ICONS[key],
          iconHoverFgClass: welcomePathIconHoverFgClass[key],
          iconHoverBgClass: welcomePathIconHoverBgClass[key],
          backgroundImage: img.src,
          backgroundImageAlt: img.alt,
        };
      }),
    [locale, copy],
  );

  const isLight = theme === "light";
  const logoHeightRem = 2.5 * studio.logoScale;

  if (!ready) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-colors duration-300",
        isLight ? "bg-[#f7f6f3] text-[#1a1816]" : "bg-black text-white",
      )}
    >
      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <WelcomeGateToolbar
          isLight={isLight}
          theme={theme}
          regionToggleHint={copy.regionToggleHint}
          regionToggleSubhint={copy.regionToggleSubhint}
          onThemeChange={(next) => {
            setTheme(next);
            storeWelcomeTheme(next);
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto flex w-full flex-1 flex-col px-6 py-10">
        <motion.header
          className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: {} }}
        >
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
            <p
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.32em]",
                isLight ? "text-[#1a1816]/55" : "text-white/60",
              )}
            >
              {copy.tagline}
            </p>
          </motion.div>
          <motion.p
            variants={subtitleVariants}
            className={cn(
              "mx-auto mt-6 max-w-2xl text-lg italic font-normal leading-relaxed sm:text-xl",
              isLight ? "text-[#1a1816]/90" : "text-white/95",
            )}
          >
            {copy.subheading}
          </motion.p>
        </motion.header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <motion.div
            className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {paths.map((path) => {
              const s = studio[path.key];
              const patchCardImage = (partial: Partial<CardStudio>, persist = true) => {
                const nextStore = patchLocaleCard(store, locale, path.key, partial);
                setStore(nextStore);
                if (persist) saveWelcomeStudioStore(nextStore);
              };
              return (
                <motion.div key={`${locale}-${path.key}`} variants={cardVariants} className="flex h-full min-w-0 w-full">
                  <WelcomePathCard
                    to={path.to}
                    label={path.label}
                    title={path.title}
                    subtitle={path.subtitle}
                    meta={path.meta}
                    icon={path.icon}
                    iconHoverFgClass={path.iconHoverFgClass}
                    iconHoverBgClass={path.iconHoverBgClass}
                    backgroundImage={path.backgroundImage}
                    backgroundImageAlt={path.backgroundImageAlt}
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

      {studioEnabled && (
        <WelcomeStudioPanel store={store} locale={locale} studio={studio} onStoreChange={setStore} />
      )}
    </div>
  );
}
