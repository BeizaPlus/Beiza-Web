import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLayoutStudioBreakpoint } from "@/hooks/useLayoutStudioViewport";
import { useWelcomeSnapPath } from "@/hooks/useWelcomeSnapPath";
import {
  WELCOME_CENTER_ALWAYS_COLOR,
  WELCOME_CENTER_PATH_KEY,
  WELCOME_SIDE_CENTER_COLOR_STRIP,
} from "@/lib/layoutCanonical";

import { motion } from "framer-motion";

import { BookOpen, Feather, GraduationCap } from "lucide-react";

import { WelcomePathCard } from "@/components/welcome/WelcomePathCard";

import { WelcomeLangSwitcher } from "@/components/welcome/WelcomeLangSwitcher";
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

import {
  StudioAccordionPanels,
  StudioAccordionSection,
  StudioToggleRow,
} from "@/components/dev/StudioAccordionSection";
import { StudioCopyOffsetSliders } from "@/components/dev/StudioCopyOffsetSliders";
import { StudioSlider } from "@/components/dev/StudioSlider";

import { welcomeCopyForLocale } from "@/lib/locale/welcomeCopy";
import { useWelcomeLocaleSceneWheel } from "@/hooks/useWelcomeLocaleSceneWheel";
import { useStudioPanel } from "@/hooks/useStudioPanel";
import { siteBounds } from "@/lib/siteLayout";

import { getWelcomeCardImage } from "@/lib/locale/welcomeImages";

import { getWelcomeCardHref } from "@/lib/locale/welcomeRegionalRoutes";

import type { BeizaLocale, WelcomePathKey } from "@/lib/locale/types";

import {

  DEFAULT_STUDIO_BY_LOCALE,

  DEFAULT_STUDIO_GLOBAL,
  DEFAULT_LOCALE_RAIL_LAYOUT,
  DEFAULT_PHONE_LAYOUT,
  DEFAULT_TOOLBAR_LAYOUT,

  loadWelcomeStudioStore,

  parseWelcomeStudioJson,

  patchLocaleCard,

  patchStudioGlobal,

  resetWelcomeStudioStore,

  saveWelcomeStudioStore,

  studioStateForLocale,

  type LocaleRailLayout,
  type ToolbarControlsLayout,
  type WelcomePhoneLayout,

  type CardStudio,

  type StudioState,

  type WelcomeStudioStore,

} from "@/lib/welcomeStudio";

import { BeizaLogoLink } from "@/components/BeizaLogoLink";
import { WELCOME_HOME_RESET_EVENT } from "@/lib/welcomeHomeNav";
import { cn } from "@/lib/utils";




const PATH_KEYS: WelcomePathKey[] = ["education", "legacy", "farewell"];

const PATH_ICONS = {

  education: GraduationCap,

  legacy: BookOpen,

  farewell: Feather,

} as const;



function LocaleRailLayoutSliders({
  rail,
  onChange,
}: {
  rail: LocaleRailLayout;
  onChange: (partial: Partial<LocaleRailLayout>) => void;
}) {
  const patch = onChange;
  return (
    <>
      <StudioSlider
        compact
        label="Inactive dot (px)"
        value={rail.dotSizePx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.dotSizePx}
        min={6}
        max={32}
        step={1}
        onChange={(v) => patch({ dotSizePx: v })}
      />
      <StudioSlider
        compact
        label="Active yellow dot (px)"
        value={rail.activeDotSizePx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.activeDotSizePx}
        min={6}
        max={40}
        step={1}
        onChange={(v) => patch({ activeDotSizePx: v })}
      />
      <StudioSlider
        compact
        label="Dot stack gap (px)"
        value={rail.dotStackGapPx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.dotStackGapPx}
        min={0}
        max={40}
        step={1}
        onChange={(v) => patch({ dotStackGapPx: v })}
      />
      <StudioSlider
        compact
        label="Label → yellow dot (px)"
        value={rail.labelToDotGapPx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.labelToDotGapPx}
        min={0}
        max={32}
        step={1}
        onChange={(v) => patch({ labelToDotGapPx: v })}
      />
      <StudioSlider
        compact
        label="Flag width (px)"
        value={rail.flagWidthPx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.flagWidthPx}
        min={12}
        max={32}
        step={1}
        onChange={(v) => patch({ flagWidthPx: v })}
      />
      <StudioSlider
        compact
        label="Flag height (px)"
        value={rail.flagHeightPx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.flagHeightPx}
        min={8}
        max={24}
        step={1}
        onChange={(v) => patch({ flagHeightPx: v })}
      />
      <StudioSlider
        compact
        label="Active code font (px)"
        value={rail.labelFontPx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.labelFontPx}
        min={12}
        max={28}
        step={1}
        onChange={(v) => patch({ labelFontPx: v })}
      />
      <StudioSlider
        compact
        label="Sun button (px)"
        value={rail.sunSizePx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.sunSizePx}
        min={48}
        max={120}
        step={2}
        onChange={(v) => patch({ sunSizePx: v })}
      />
      <StudioSlider
        compact
        label="Sun icon (px)"
        value={rail.sunIconPx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.sunIconPx}
        min={16}
        max={56}
        step={1}
        onChange={(v) => patch({ sunIconPx: v })}
      />
      <StudioSlider
        compact
        label="Auto-rotate (sec)"
        value={rail.autoRotateSec}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.autoRotateSec}
        min={1}
        max={15}
        step={0.5}
        onChange={(v) => patch({ autoRotateSec: v })}
      />
      <StudioSlider
        compact
        label="Inactive code → dot (px)"
        value={rail.inactiveLabelGapPx}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.inactiveLabelGapPx}
        min={0}
        max={24}
        step={1}
        onChange={(v) => patch({ inactiveLabelGapPx: v })}
      />
      <StudioSlider
        compact
        label="Rail nudge ← left / right → (rem)"
        value={rail.railNudgeXRem}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.railNudgeXRem}
        min={-4}
        max={4}
        step={0.125}
        onChange={(v) => patch({ railNudgeXRem: v })}
      />
      <StudioSlider
        compact
        label="Labels nudge ← / → (rem)"
        value={rail.labelNudgeXRem}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.labelNudgeXRem}
        min={-4}
        max={4}
        step={0.125}
        onChange={(v) => patch({ labelNudgeXRem: v })}
      />
      <StudioSlider
        compact
        label="Dot axis nudge ← / → (rem)"
        value={rail.axisNudgeXRem}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.axisNudgeXRem}
        min={-4}
        max={4}
        step={0.125}
        onChange={(v) => patch({ axisNudgeXRem: v })}
      />
      <StudioSlider
        compact
        label="Sun axis ← / → (rem)"
        value={rail.sunAxisNudgeXRem}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.sunAxisNudgeXRem}
        min={-4}
        max={4}
        step={0.125}
        onChange={(v) => patch({ sunAxisNudgeXRem: v })}
      />
      <StudioSlider
        compact
        label="Sun axis ↓ separation (rem)"
        value={rail.sunAxisNudgeYRem}
        defaultValue={DEFAULT_LOCALE_RAIL_LAYOUT.sunAxisNudgeYRem}
        min={-2}
        max={6}
        step={0.125}
        onChange={(v) => patch({ sunAxisNudgeYRem: v })}
      />
      <StudioToggleRow
        label="Show codes on gray dots"
        checked={rail.showInactiveCodes}
        onChange={(v) => patch({ showInactiveCodes: v })}
      />
    </>
  );
}

function PhoneLayoutSliders({
  phone,
  onChange,
}: {
  phone: WelcomePhoneLayout;
  onChange: (partial: Partial<WelcomePhoneLayout>) => void;
}) {
  const patch = onChange;
  return (
    <>
      <StudioSlider
        compact
        label="Card width (% viewport)"
        value={phone.cardWidthVw}
        defaultValue={DEFAULT_PHONE_LAYOUT.cardWidthVw}
        min={72}
        max={92}
        step={1}
        displayValue={`${phone.cardWidthVw}vw`}
        onChange={(v) => patch({ cardWidthVw: v })}
      />
      <StudioSlider
        compact
        label="Side peek padding (rem)"
        value={phone.carouselInsetRem}
        defaultValue={DEFAULT_PHONE_LAYOUT.carouselInsetRem}
        min={0}
        max={3}
        step={0.125}
        displayValue={`${phone.carouselInsetRem}rem`}
        onChange={(v) => patch({ carouselInsetRem: v })}
      />
      <StudioSlider
        compact
        label="Gap between cards (rem)"
        value={phone.cardGapRem}
        defaultValue={DEFAULT_PHONE_LAYOUT.cardGapRem}
        min={0}
        max={2.5}
        step={0.125}
        onChange={(v) => patch({ cardGapRem: v })}
      />
      <StudioSlider
        compact
        label="Scroll padding after last card (rem)"
        value={phone.scrollPaddingEndRem}
        defaultValue={DEFAULT_PHONE_LAYOUT.scrollPaddingEndRem}
        min={0}
        max={6}
        step={0.125}
        onChange={(v) => patch({ scrollPaddingEndRem: v })}
      />
    </>
  );
}

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
        label="From right edge (rem)"
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
        label="Dots → sun gap (px)"
        value={layout.controlsGapPx}
        defaultValue={DEFAULT_TOOLBAR_LAYOUT.controlsGapPx}
        min={0}
        max={96}
        step={2}
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

  const studioPanel = useStudioPanel("welcome-gate");

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

    <FloatingStudioShell
      panelId="welcome-gate"
      open={studioPanel.open}
      onOpen={studioPanel.onOpen}
      onClose={studioPanel.onClose}
      openButtonLabel="Welcome studio"
    >

      <p className="mb-3 text-[9px] text-muted-foreground">
        Region <span className="font-medium text-foreground">{LOCALE_STUDIO_LABEL[locale]}</span>
        {" · "}
        per-locale card crops
      </p>

      <StudioTextEditButton />

      <StudioAccordionPanels defaultValue="layout" className="mb-3">
        <StudioAccordionSection value="layout" title="Page layout">
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
          <StudioCopyOffsetSliders
            frame={{
              offsetX: studio.copyOffsetX,
              offsetY: studio.copyOffsetY,
              copyLift: studio.copyLift,
            }}
            defaults={{
              offsetX: DEFAULT_STUDIO_GLOBAL.copyOffsetX,
              offsetY: DEFAULT_STUDIO_GLOBAL.copyOffsetY,
              copyLift: DEFAULT_STUDIO_GLOBAL.copyLift,
            }}
            onPatch={(partial) =>
              patchGlobal({
                ...(partial.offsetX !== undefined ? { copyOffsetX: partial.offsetX } : {}),
                ...(partial.offsetY !== undefined ? { copyOffsetY: partial.offsetY } : {}),
                ...(partial.copyLift !== undefined ? { copyLift: partial.copyLift } : {}),
              })
            }
          />
          <StudioToggleRow
            label="Icon circle background"
            checked={studio.showIconCircleBg}
            onChange={(v) => patchGlobal({ showIconCircleBg: v })}
          />
          <StudioToggleRow
            label="Use mascot head"
            checked={studio.useMascot}
            onChange={(v) => patchGlobal({ useMascot: v })}
          />
          <StudioToggleRow
            label="Lock cards (no navigation)"
            checked={studio.lockCardLinks}
            onChange={(v) => patchGlobal({ lockCardLinks: v })}
          />
        </StudioAccordionSection>

        <StudioAccordionSection
          value="phone"
          title="Mobile carousel (≤809px)"
          hint="Horizontal swipe — one card with peek. Width ~82vw; 3:4 portrait aspect is locked in CSS."
        >
          <PhoneLayoutSliders
            phone={studio.phone}
            onChange={(partial) => patchGlobal({ phone: partial })}
          />
        </StudioAccordionSection>

        <StudioAccordionSection
          value="rail"
          title="Language rail"
          hint="Wheel or click steps GH → EN → ES → FR → CN. Active row shows flag + code; gray dots are the other regions."
        >
          <StudioToggleRow
            label="Rail background pill"
            checked={studio.showLocaleRailBg}
            onChange={(v) => patchGlobal({ showLocaleRailBg: v })}
          />
          <LocaleRailLayoutSliders
            rail={studio.localeRail}
            onChange={(partial) => {
              const patch: Parameters<typeof patchStudioGlobal>[1] = { localeRail: partial };
              if (partial.dotStackGapPx !== undefined) {
                patch.toolbar = { railDotsGapPx: partial.dotStackGapPx };
              }
              patchGlobal(patch);
            }}
          />
        </StudioAccordionSection>

        <StudioAccordionSection
          value="rail-pos"
          title="Rail position"
          hint="From right edge + nudge sliders align labels and dots with the sun centerline. Positive nudge = move left."
        >
          <ToolbarLayoutSliders
            layout={studio.toolbar}
            onChange={(partial) => patchGlobal({ toolbar: partial })}
          />
        </StudioAccordionSection>

        <StudioAccordionSection
          value="cards"
          title={`Card crops · ${LOCALE_STUDIO_LABEL[locale]}`}
          hint="Center Legacy photo changes per character. Tune per region, then copy JSON."
        >
          <div className="flex gap-1 rounded-lg bg-secondary p-1 text-[10px] font-medium uppercase">
            {PATH_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setCard(k)}
                className={cn(
                  "flex-1 rounded-md py-1.5 transition-colors",
                  card === k
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {k === "education" ? "Edu" : k === "legacy" ? "Legacy" : "Farewell"}
              </button>
            ))}
          </div>
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
        </StudioAccordionSection>

        <StudioAccordionSection value="data" title="Import & export">
          <div className="flex flex-col gap-2">
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
        </StudioAccordionSection>
      </StudioAccordionPanels>

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
  const cardsScrollRef = useRef<HTMLDivElement>(null);
  const layoutBreakpoint = useLayoutStudioBreakpoint();
  const snappedPath = useWelcomeSnapPath(cardsScrollRef, PATH_KEYS);
  const { locale, ready } = useLocaleContext();
  const [theme, setTheme] = useState<WelcomeTheme>("dark");
  const [store, setStore] = useState<WelcomeStudioStore>(() => loadWelcomeStudioStore());
  const studioEnabled = isLayoutStudioEnabled();

  const isPhone = layoutBreakpoint === "phone";
  useWelcomeLocaleSceneWheel(welcomeRootRef, ready && !isPhone);

  useEffect(() => {
    const onHomeReset = () => {
      cardsScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    };
    window.addEventListener(WELCOME_HOME_RESET_EVENT, onHomeReset);
    return () => window.removeEventListener(WELCOME_HOME_RESET_EVENT, onHomeReset);
  }, []);

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
        rail={studio.localeRail}
        showLocaleRailBg={studio.showLocaleRailBg}
        onThemeChange={(next) => {
          setTheme(next);
          storeWelcomeTheme(next);
        }}
      />

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col siteBounds pb-4 pt-2",
          "max-[809px]:px-3 min-[810px]:pb-6",
        )}
      >
        <motion.div
          key={locale}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
        <motion.header
          className="mx-auto flex w-full max-w-4xl shrink-0 flex-col items-center px-2 text-center max-[809px]:pt-1 min-[810px]:px-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: {} }}
        >
          <motion.div variants={heroVariants} className="flex flex-col items-center">
            <BeizaLogoLink
              variant={studio.useMascot ? "full" : "wordmark"}
              logoHeightRem={logoHeightRem}
              className="relative z-[10] mx-auto mb-2"
              mascotClassName="object-contain"
              wordmarkClassName={cn("object-contain", isLight && "invert")}
            />
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
              "mx-auto mt-3 max-w-2xl px-1 font-serif text-base font-normal italic leading-relaxed sm:mt-6 sm:text-lg md:text-xl",
              isLight ? "text-[#1a1816]/90" : "text-white/95",
            )}
          >
            {copy.subheading}
          </motion.p>
          {isPhone ? (
            <motion.div variants={subtitleVariants}>
              <WelcomeLangSwitcher isLight={isLight} rail={studio.localeRail} />
            </motion.div>
          ) : null}
        </motion.header>

        <main
          className={cn(
            "mx-auto flex min-h-0 w-full flex-1 flex-col",
            "max-sm:min-h-0 max-sm:overflow-hidden max-sm:pt-2",
            "sm:justify-center sm:overflow-visible sm:px-4 sm:py-8",
          )}
        >
          <motion.div
            ref={cardsScrollRef}
            className={cn(
              "w-full min-h-0 flex-1",
              "welcome-cards-row",
              "min-[810px]:grid min-[810px]:grid-cols-3 min-[810px]:gap-6 min-[810px]:overflow-visible",
            )}
            style={
              isPhone
                ? ({
                    ["--welcome-card-width" as string]: `${studio.phone.cardWidthVw}vw`,
                    gap: `${studio.phone.cardGapRem}rem`,
                    paddingLeft: `${studio.phone.carouselInsetRem}rem`,
                    paddingRight: `${studio.phone.scrollPaddingEndRem}rem`,
                  } as CSSProperties)
                : undefined
            }
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {paths.map((path) => {
              const isCenterCard =
                layoutBreakpoint === "phone"
                  ? path.key === snappedPath
                  : path.key === WELCOME_CENTER_PATH_KEY;
              const imageFullColor = WELCOME_CENTER_ALWAYS_COLOR && isCenterCard;
              const centerColorStrip =
                WELCOME_SIDE_CENTER_COLOR_STRIP && !imageFullColor && !!path.backgroundImage;
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
                  className={cn(
                    "welcome-card-slot flex min-h-0 min-w-0",
                    "min-[810px]:h-full min-[810px]:max-[1199px]:min-h-[280px]",
                  )}
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
                    copyOffsetX={studio.copyOffsetX}
                    copyOffsetY={studio.copyOffsetY}
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
                    imageFullColor={imageFullColor}
                    centerColorStrip={centerColorStrip}
                    layout={isPhone ? "carousel" : "grid"}
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


