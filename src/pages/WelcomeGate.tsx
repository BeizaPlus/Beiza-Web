import { useEffect, useMemo, useRef, useState } from "react";

import { motion } from "framer-motion";

import { BookOpen, Feather, GraduationCap } from "lucide-react";

import { WelcomePathCard } from "@/components/welcome/WelcomePathCard";

import { WelcomeLocaleRail } from "@/components/welcome/WelcomeLocaleRail";

import { welcomePathIconHoverBgClass, welcomePathIconHoverFgClass } from "@/lib/welcomePathIconStyles";

import {

  getStoredWelcomeTheme,

  storeWelcomeTheme,

  type WelcomeTheme,

} from "@/components/welcome/WelcomeThemeToggle";

import { useLocaleContext } from "@/context/LocaleContext";

import { isLayoutStudioEnabled } from "@/lib/layoutStudio";

import { FloatingStudioShell } from "@/components/dev/FloatingStudioShell";

import { StudioTextEditButton } from "@/components/dev/StudioTextEditButton";

import { StudioSlider } from "@/components/dev/StudioSlider";

import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import { useWelcomeLocaleSceneWheel } from "@/hooks/useWelcomeLocaleSceneWheel";
import { siteBounds } from "@/lib/siteLayout";

import { getWelcomeCardImage } from "@/lib/locale/welcomeImages";

import { getWelcomeCardHref } from "@/lib/locale/welcomeRegionalRoutes";

import type { BeizaLocale, WelcomePathKey } from "@/lib/locale/types";

import {

  DEFAULT_STUDIO_BY_LOCALE,

  DEFAULT_STUDIO_GLOBAL,
  DEFAULT_TOOLBAR_LAYOUT,

  loadWelcomeStudioStore,

  parseWelcomeStudioJson,

  patchLocaleCard,

  patchStudioGlobal,

  resetWelcomeStudioStore,

  saveWelcomeStudioStore,

  studioStateForLocale,

  type ToolbarControlsLayout,

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



function ToolbarLayoutSliders({
  layout,
  onChange,
}: {
  layout: ToolbarControlsLayout;
  onChange: (partial: Partial<ToolbarControlsLayout>) => void;
}) {
  const patch = onChange;
  return (
    <>
      <StudioSlider
        compact
        label="Rail from right (rem)"
        value={layout.railRightRem}
        defaultValue={DEFAULT_TOOLBAR_LAYOUT.railRightRem}
        min={0}
        max={8}
        step={0.25}
        onChange={(v) => patch({ railRightRem: v })}
      />
      <StudioSlider
        compact
        label="Rail vertical anchor (%)"
        value={layout.railTopPct}
        defaultValue={DEFAULT_TOOLBAR_LAYOUT.railTopPct}
        min={20}
        max={80}
        step={1}
        onChange={(v) => patch({ railTopPct: v })}
      />
      <StudioSlider
        compact
        label="Rail ↔ dots gap (px)"
        value={layout.railDotsGapPx}
        defaultValue={DEFAULT_TOOLBAR_LAYOUT.railDotsGapPx}
        min={0}
        max={24}
        step={1}
        onChange={(v) => patch({ railDotsGapPx: v })}
      />
      <StudioSlider
        compact
        label="Rail → pin gap (px)"
        value={layout.controlsGapPx}
        defaultValue={DEFAULT_TOOLBAR_LAYOUT.controlsGapPx}
        min={0}
        max={32}
        step={1}
        onChange={(v) => patch({ controlsGapPx: v })}
      />
      <StudioSlider
        compact
        label="Pin block nudge left (rem)"
        value={layout.controlsOffsetXRem}
        defaultValue={DEFAULT_TOOLBAR_LAYOUT.controlsOffsetXRem}
        min={-2}
        max={4}
        step={0.25}
        onChange={(v) => patch({ controlsOffsetXRem: v })}
      />
      <StudioSlider
        compact
        label="Pin block below rail (px)"
        value={layout.controlsOffsetYPx}
        defaultValue={DEFAULT_TOOLBAR_LAYOUT.controlsOffsetYPx}
        min={-16}
        max={48}
        step={1}
        onChange={(v) => patch({ controlsOffsetYPx: v })}
      />
      <StudioSlider
        compact
        label="Pin ↔ theme gap (px)"
        value={layout.controlsButtonGapPx}
        defaultValue={DEFAULT_TOOLBAR_LAYOUT.controlsButtonGapPx}
        min={0}
        max={24}
        step={1}
        onChange={(v) => patch({ controlsButtonGapPx: v })}
      />
    </>
  );
}

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



  const exportJson = () => {
    navigator.clipboard.writeText(JSON.stringify(store, null, 2)).then(() => {
      alert("Full JSON copied — paste into welcomeStudio.ts or Import JSON here.");
    });
  };

  const importJson = () => {
    const text = window.prompt("Paste welcome-gate-studio JSON ({ global, locales } or flat card keys):");
    if (!text?.trim()) return;
    try {
      const next = parseWelcomeStudioJson(text.trim());
      onStoreChange(next);
      saveWelcomeStudioStore(next);
      alert("JSON applied and saved to this browser.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const resetJson = () => {
    if (!window.confirm("Reset welcome studio to code defaults? Clears welcome-gate-studio in this browser.")) {
      return;
    }
    const next = resetWelcomeStudioStore();
    onStoreChange(next);
    alert("Reset to defaults from welcomeStudio.ts");
  };



  const s = studio[card];



  return (

    <FloatingStudioShell panelId="welcome-gate" open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>

      <p className="mb-2 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">

        Region: {LOCALE_STUDIO_LABEL[locale]} · card crops saved per locale

      </p>



      <StudioTextEditButton />



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

        <label className="flex cursor-pointer items-center justify-between text-[10px] text-muted-foreground">
          Language rail background
          <input
            type="checkbox"
            checked={studio.showLocaleRailBg}
            onChange={(e) => patchGlobal({ showLocaleRailBg: e.target.checked })}
            className="accent-primary"
          />
        </label>

      </div>

      <div className="mb-4 space-y-3 border-b border-border pb-4">
        <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          Pin & theme controls (right rail)
        </p>
        <ToolbarLayoutSliders
          layout={studio.toolbar}
          onChange={(partial) => patchGlobal({ toolbar: partial })}
        />
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



      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={exportJson}
          className="w-full rounded-md border border-border py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Copy JSON (all regions)
        </button>
        <button
          type="button"
          onClick={importJson}
          className="w-full rounded-md border border-primary/40 py-1.5 text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10"
        >
          Import JSON
        </button>
        <button
          type="button"
          onClick={resetJson}
          className="w-full rounded-md border border-border py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Reset to code defaults
        </button>
      </div>

    </FloatingStudioShell>

  );

}



const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const heroVariants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};
const subtitleVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delay: 0.3, duration: 0.6 } },
};

export default function WelcomeGate() {
  const welcomeRootRef = useRef<HTMLDivElement>(null);
  const { locale, ready } = useLocaleContext();
  const [theme, setTheme] = useState<WelcomeTheme>("dark");
  const [store, setStore] = useState<WelcomeStudioStore>(() => loadWelcomeStudioStore());
  const studioEnabled = isLayoutStudioEnabled();

  useWelcomeLocaleSceneWheel(welcomeRootRef, ready);

  useEffect(() => {
    setTheme(getStoredWelcomeTheme());
    setStore(loadWelcomeStudioStore());
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("welcome-route");
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      html.classList.remove("welcome-route");
      document.body.style.overflow = bodyOverflow;
    };
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
  const logoHeightRem = 2 * studio.logoScale;

  if (!ready) {
    return <div className="h-[100dvh] bg-black" />;
  }

  return (
    <div
      ref={welcomeRootRef}
      className={cn(
        "flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden transition-colors duration-300",
        isLight ? "bg-[#f7f6f3] text-[#1a1816]" : "bg-black text-white",
      )}
    >
      <WelcomeLocaleRail
        isLight={isLight}
        theme={theme}
        layout={studio.toolbar}
        showLocaleRailBg={studio.showLocaleRailBg}
        onThemeChange={(next) => {
          setTheme(next);
          storeWelcomeTheme(next);
        }}
      />

      <div className={cn("relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col siteBounds pb-6 pt-2")}>
        <motion.div
          key={locale}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
        <motion.header
          className="mx-auto flex w-full max-w-4xl shrink-0 flex-col items-center px-4 text-center"
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
              "mx-auto mt-4 max-w-2xl font-serif text-lg font-normal italic leading-relaxed sm:mt-6 sm:text-xl",
              isLight ? "text-[#1a1816]/90" : "text-white/95",
            )}
          >
            {copy.subheading}
          </motion.p>
        </motion.header>

        <main className="mx-auto flex min-h-0 w-full flex-1 flex-col justify-center px-4 py-6 sm:py-8">
          <motion.div
            className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-6 sm:grid-cols-3"
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
                <motion.div
                  key={`${locale}-${path.key}`}
                  data-welcome-path={path.key}
                  variants={cardVariants}
                  className="flex h-full min-h-0 min-w-0"
                >
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
                        ? ({ imageOffsetX, imageOffsetY }) =>
                            patchCardImage({ imageOffsetX, imageOffsetY })
                        : undefined
                    }
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </main>
        </motion.div>
      </div>

      {studioEnabled && (
        <WelcomeStudioPanel store={store} locale={locale} studio={studio} onStoreChange={setStore} />
      )}
    </div>
  );
}


