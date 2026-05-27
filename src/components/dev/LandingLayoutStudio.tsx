import { useEffect, useState } from "react";
import { useStudioPanel } from "@/hooks/useStudioPanel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_STUDIO_STATE,
  downloadStudioJson,
  loadStudioState,
  saveStudioState,
  studioStateToJson,
  type LandingLayoutStudioState,
  type StudioFocus,
} from "./landingLayoutStudioState";
import {
  loadHeroStudioFrame,
  saveHeroStudioFrame,
  type HeritageHeroFrame,
} from "./heroLayoutStudioState";
import { HeritageHeroStudioControls } from "./HeritageHeroStudioControls";
import { FloatingStudioShell } from "./FloatingStudioShell";
import { StudioAccordionSection } from "@/components/dev/StudioAccordionSection";
import { StudioTextEditButton } from "@/components/dev/StudioTextEditButton";
import { StudioCopyOffsetSliders } from "@/components/dev/StudioCopyOffsetSliders";
import { StudioSlider } from "./StudioSlider";
import { Accordion } from "@/components/ui/accordion";

type Props = {
  state: LandingLayoutStudioState;
  onChange: (next: LandingLayoutStudioState) => void;
};

export function LandingLayoutStudioPanel({ state, onChange }: Props) {
  const studioPanel = useStudioPanel("landing");
  const [heritageFrame, setHeritageFrame] = useState<HeritageHeroFrame>(() =>
    loadHeroStudioFrame("heritage"),
  );

  const patch = (partial: Partial<LandingLayoutStudioState>) => {
    const next = { ...state, ...partial };
    onChange(next);
    saveStudioState(next);
  };

  const patchHero = (hero: Partial<LandingLayoutStudioState["hero"]>) =>
    patch({ hero: { ...state.hero, ...hero } });

  const patchLocaleRail = (localeRail: Partial<LandingLayoutStudioState["localeRail"]>) =>
    patch({ localeRail: { ...state.localeRail, ...localeRail } });

  const patchOfferings = (offerings: Partial<LandingLayoutStudioState["offerings"]>) =>
    patch({ offerings: { ...state.offerings, ...offerings } });

  const patchFaq = (faq: Partial<LandingLayoutStudioState["faq"]>) =>
    patch({ faq: { ...state.faq, ...faq } });

  const patchPricing = (pricing: Partial<LandingLayoutStudioState["pricing"]>) =>
    patch({ pricing: { ...state.pricing, ...pricing } });

  const patchOutro = (outro: Partial<LandingLayoutStudioState["outro"]>) =>
    patch({ outro: { ...state.outro, ...outro } });

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string>(state.focus);

  const exportJson = async () => {
    const text = studioStateToJson(state);
    try {
      await navigator.clipboard.writeText(text);
      setSaveStatus("Copied");
    } catch {
      setSaveStatus("Copy failed");
    }
    window.setTimeout(() => setSaveStatus(null), 2000);
  };

  const saveJsonFile = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadStudioJson(state, `landing-layout-${stamp}.json`);
    setSaveStatus("Saved file");
    window.setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <FloatingStudioShell
      panelId="landing"
      open={studioPanel.open}
      onOpen={studioPanel.onOpen}
      onClose={studioPanel.onClose}
      openButtonLabel="Landing studio"
    >
      <StudioTextEditButton />
      <p className="mb-3 text-[9px] leading-snug text-muted-foreground">
        One section at a time — expands the matching block on the page.
      </p>

      <Accordion
        type="single"
        collapsible
        value={openSection}
        onValueChange={(value) => {
          if (!value) return;
          setOpenSection(value);
          patch({ focus: value as StudioFocus });
        }}
        className="w-full"
      >
        <StudioAccordionSection value="hero" title="1. Hero">
        <div className="space-y-3">
          <p className="text-[11px] text-muted-foreground">
            Pan the portrait (X/Y). Zoom out to see more of the frame; zoom in to tighten on the
            subject.
          </p>
          <StudioSlider
            label="Background X"
            value={state.hero.posX}
            defaultValue={DEFAULT_STUDIO_STATE.hero.posX}
            min={0}
            max={100}
            onChange={(posX) => patchHero({ posX })}
          />
          <StudioSlider
            label="Background Y"
            value={state.hero.posY}
            defaultValue={DEFAULT_STUDIO_STATE.hero.posY}
            min={0}
            max={100}
            onChange={(posY) => patchHero({ posY })}
          />
          <ZoomControls
            value={state.hero.scale}
            defaultValue={DEFAULT_STUDIO_STATE.hero.scale}
            onChange={(scale) => patchHero({ scale })}
          />
          <StudioSlider
            label="Copy raise from bottom (vh)"
            value={state.hero.copyBottomVh}
            defaultValue={DEFAULT_STUDIO_STATE.hero.copyBottomVh}
            min={8}
            max={52}
            displayValue={`${state.hero.copyBottomVh}vh`}
            onChange={(copyBottomVh) => patchHero({ copyBottomVh })}
          />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">
            Copy position
          </p>
          <StudioCopyOffsetSliders
            frame={{
              offsetX: state.hero.copyOffsetX,
              offsetY: state.hero.copyOffsetY,
            }}
            defaults={{
              offsetX: DEFAULT_STUDIO_STATE.hero.copyOffsetX,
              offsetY: DEFAULT_STUDIO_STATE.hero.copyOffsetY,
            }}
            showLift={false}
            onPatch={(partial) =>
              patchHero({
                ...(partial.offsetX !== undefined ? { copyOffsetX: partial.offsetX } : {}),
                ...(partial.offsetY !== undefined ? { copyOffsetY: partial.offsetY } : {}),
              })
            }
          />
        </div>
        </StudioAccordionSection>

        <StudioAccordionSection value="heritageHero" title="Heritage hero">
        <HeritageHeroStudioControls
          frame={heritageFrame}
          onPatch={(partial) => {
            const next = { ...heritageFrame, ...partial };
            setHeritageFrame(next);
            saveHeroStudioFrame("heritage", next);
          }}
        />
        </StudioAccordionSection>

        <StudioAccordionSection value="localeRail" title="Locale pills (Global · Ghana…)">
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground">
              Slide the language rail along the viewport. 0 = left edge, 50 = center, 100 = right edge.
            </p>
            <StudioSlider
              label="Horizontal (viewport %)"
              value={state.localeRail.viewportX}
              defaultValue={DEFAULT_STUDIO_STATE.localeRail.viewportX}
              min={0}
              max={100}
              displayValue={`${state.localeRail.viewportX}%`}
              onChange={(viewportX) => patchLocaleRail({ viewportX })}
            />
            <StudioSlider
              label="Vertical offset (vh)"
              value={state.localeRail.viewportY}
              defaultValue={DEFAULT_STUDIO_STATE.localeRail.viewportY}
              min={0}
              max={100}
              displayValue={`${state.localeRail.viewportY}vh`}
              onChange={(viewportY) => patchLocaleRail({ viewportY })}
            />
          </div>
        </StudioAccordionSection>

        <StudioAccordionSection value="offerings" title="2. What we do">
        <div className="space-y-3">
          <StudioSlider
            label="Section move up"
            value={-state.offerings.offsetY}
            defaultValue={-DEFAULT_STUDIO_STATE.offerings.offsetY}
            min={-120}
            max={120}
            onChange={(v) => patchOfferings({ offsetY: -v })}
          />
          <StudioSlider
            label="Top padding"
            value={state.offerings.paddingTop}
            defaultValue={DEFAULT_STUDIO_STATE.offerings.paddingTop}
            min={0}
            max={200}
            onChange={(paddingTop) => patchOfferings({ paddingTop })}
          />
        </div>
        </StudioAccordionSection>

        <StudioAccordionSection value="faq" title="3. FAQ">
        <div className="space-y-3">
          <StudioSlider
            label="Section move up"
            value={-state.faq.offsetY}
            defaultValue={-DEFAULT_STUDIO_STATE.faq.offsetY}
            min={-120}
            max={120}
            onChange={(v) => patchFaq({ offsetY: -v })}
          />
          <StudioSlider
            label="Top padding"
            value={state.faq.paddingTop}
            defaultValue={DEFAULT_STUDIO_STATE.faq.paddingTop}
            min={0}
            max={200}
            onChange={(paddingTop) => patchFaq({ paddingTop })}
          />
        </div>
        </StudioAccordionSection>

        <StudioAccordionSection value="pricing" title="4. Billing">
        <div className="space-y-3">
          <p className="text-[10px] leading-snug text-muted-foreground">
            Click any text on the billing cards to edit. Sliders only move the section — card layout stays fixed.
          </p>
          <StudioSlider
            label="Section move up"
            value={-state.pricing.offsetY}
            defaultValue={-DEFAULT_STUDIO_STATE.pricing.offsetY}
            min={-120}
            max={120}
            onChange={(v) => patchPricing({ offsetY: -v })}
          />
          <StudioSlider
            label="Top padding"
            value={state.pricing.paddingTop}
            defaultValue={DEFAULT_STUDIO_STATE.pricing.paddingTop}
            min={0}
            max={200}
            onChange={(paddingTop) => patchPricing({ paddingTop })}
          />
        </div>
        </StudioAccordionSection>

        <StudioAccordionSection value="outro" title="5. Outro">
        <div className="space-y-3">
          <StudioSlider
            label="Section move up"
            value={-state.outro.offsetY}
            defaultValue={-DEFAULT_STUDIO_STATE.outro.offsetY}
            min={-120}
            max={120}
            onChange={(v) => patchOutro({ offsetY: -v })}
          />
          <StudioSlider
            label="Top padding"
            value={state.outro.paddingTop}
            defaultValue={DEFAULT_STUDIO_STATE.outro.paddingTop}
            min={0}
            max={200}
            onChange={(paddingTop) => patchOutro({ paddingTop })}
          />
        </div>
        </StudioAccordionSection>

        <StudioAccordionSection value="data" title="Import & export">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" className="h-7 text-[10px]" onClick={() => void exportJson()}>
              Copy JSON
            </Button>
            <Button type="button" size="sm" variant="secondary" className="h-7 text-[10px]" onClick={saveJsonFile}>
              Save JSON
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[10px]"
              onClick={() => {
                onChange(DEFAULT_STUDIO_STATE);
                saveStudioState(DEFAULT_STUDIO_STATE);
              }}
            >
              Reset
            </Button>
          </div>
          {saveStatus ? <p className="mt-2 text-[10px] text-primary">{saveStatus}</p> : null}
        </StudioAccordionSection>
      </Accordion>
    </FloatingStudioShell>
  );
}

const HERO_ZOOM_MIN = 70;
const HERO_ZOOM_MAX = 160;
const HERO_ZOOM_STEP = 2;

function ZoomControls({
  value,
  defaultValue,
  onChange,
}: {
  value: number;
  defaultValue: number;
  onChange: (scale: number) => void;
}) {
  const clamp = (n: number) =>
    Math.min(HERO_ZOOM_MAX, Math.max(HERO_ZOOM_MIN, Math.round(n)));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <Label>Zoom</Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 px-0 text-base"
            aria-label="Zoom out"
            onClick={() => onChange(clamp(value - HERO_ZOOM_STEP))}
          >
            −
          </Button>
          <span className="min-w-[2.5rem] text-center tabular-nums text-muted-foreground">
            {Math.round(value)}%
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 w-7 px-0 text-base"
            aria-label="Zoom in"
            onClick={() => onChange(clamp(value + HERO_ZOOM_STEP))}
          >
            +
          </Button>
        </div>
      </div>
      <input
        type="range"
        className="w-full cursor-pointer accent-primary"
        value={value}
        min={HERO_ZOOM_MIN}
        max={HERO_ZOOM_MAX}
        step={1}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        onDoubleClick={() => onChange(clamp(defaultValue))}
        title="Double-click to reset"
      />
    </div>
  );
}

/** Loads saved hero framing always; panel visibility follows `panelEnabled`. */
export function useLandingLayoutStudio(panelEnabled: boolean) {
  const [state, setState] = useState<LandingLayoutStudioState>(() => loadStudioState());

  useEffect(() => {
    setState(loadStudioState());
  }, []);

  return { panelEnabled, state, setState };
}
