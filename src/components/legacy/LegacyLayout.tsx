import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { LegacyAuthGate } from "@/components/legacy/LegacyAuthGate";
import { RecordStationViewport } from "@/components/legacy/RecordStationViewport";
import { RecordFlowProvider } from "@/components/legacy/recordFlowContext";
import { RecordViewportLock } from "@/components/legacy/RecordViewportLock";
import { Navigation } from "@/components/Navigation";
import { LegacyTabRail } from "@/components/legacy/LegacyTabRail";
import { ArmAnchorMenu } from "@/components/marketing/ArmAnchorMenu";
import { LEGACY_ARM_ANCHORS } from "@/lib/armNavLinks";
import { LegacyStudioPanels } from "@/components/legacy/LegacyStudioPanels";
import { RecordLayoutStudioProvider } from "@/context/RecordLayoutStudioContext";
import { PageLayoutStudioZone } from "@/components/dev/PageLayoutStudioZone";
import {
  isLayoutStudioEnabled,
  isLegacyStudioPreview,
  studioRecordShellMode,
} from "@/lib/layoutStudio";
import { loadRecordPageStudioFrame, type RecordPageStudioFrame } from "@/lib/legacy/recordPageStudio";
import { LEGACY_AUTH_PAGE_STUDIO_ID, resolveLegacyPageStudioId } from "@/lib/pageLayoutStudio";
import { LegacyShellProvider } from "@/components/legacy/legacyShellContext";
import { useLegacyAuthSync } from "@/hooks/useLegacyAuthSync";
import { useLegacySession, useMyLegacyCircle } from "@/hooks/useLegacy";

function LegacyRecordRoute({
  circleLabel,
  signedIn,
  studioPreview,
}: {
  circleLabel?: string;
  signedIn: boolean;
  studioPreview: boolean;
}) {
  const studioOn = isLayoutStudioEnabled();
  const [recordStudio, setRecordStudio] = useState<RecordPageStudioFrame>(() =>
    loadRecordPageStudioFrame(),
  );
  const recordShell = studioPreview ? studioRecordShellMode() : "station";
  const showStation =
    studioPreview ? recordShell === "station" : signedIn;

  return (
    <LegacyShellProvider signedIn={signedIn || studioPreview}>
      <RecordFlowProvider>
        <RecordViewportLock />
        <div
          className="record-page-shell relative min-h-[100dvh] w-full overflow-visible bg-black text-foreground max-md:[--beiza-content-indent:0rem] max-md:[--record-content-indent:0rem]"
          style={{ "--record-site-nav-h": "4.5rem" } as CSSProperties}
        >
          <RecordStationViewport
            studioFrame={studioOn ? recordStudio : undefined}
            circleLabel={circleLabel}
            signedIn={showStation}
            station={
              showStation ? (
                <div className="legacy-record-station-panel w-full min-w-0 overflow-visible">
                  <Outlet />
                </div>
              ) : null
            }
          />
        <Navigation variant="recordOverlay" />
        <LegacyTabRail />
        <ArmAnchorMenu
          links={LEGACY_ARM_ANCHORS}
          className="pointer-events-auto fixed right-[max(1rem,var(--beiza-site-padding-x))] top-20 z-[60] min-[1200px]:right-[calc(5.5rem+var(--beiza-site-padding-x))]"
        />
        </div>
      </RecordFlowProvider>
    </LegacyShellProvider>
  );
}

/**
 * Shared Legacy shell — Heritage nav + icon tab bar.
 * Record route: single viewport, no document scroll.
 */
function wrapLegacyStudio(content: ReactNode) {
  const studioOn = isLayoutStudioEnabled();
  if (!studioOn) return content;
  return (
    <RecordLayoutStudioProvider>
      {content}
      <LegacyStudioPanels />
    </RecordLayoutStudioProvider>
  );
}

export function LegacyLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  useLegacyAuthSync();
  const studioOn = isLayoutStudioEnabled();
  const studioPreview = studioOn;
  const { data: session, isLoading: sessionLoading } = useLegacySession();
  const { data: circleCtx } = useMyLegacyCircle();
  const signedIn = !!session;
  const isTreeRoute = location.pathname === "/legacy/circle";
  const treeFullscreen = isTreeRoute && (signedIn || studioPreview);
  const isRecordRoute = location.pathname.startsWith(BEIZA_LINKS.legacy.recordStation);
  /** Logged out: record sign-in on every tab — unless layout studio (preview real pages). */
  const recordSignInShell = !signedIn && !sessionLoading && !studioPreview;
  const pageStudioId =
    signedIn || studioPreview
      ? resolveLegacyPageStudioId(location.pathname)
      : LEGACY_AUTH_PAGE_STUDIO_ID;

  const hadSessionRef = useRef(false);
  useEffect(() => {
    if (sessionLoading) return;
    const justSignedIn = signedIn && !hadSessionRef.current;
    hadSessionRef.current = signedIn;
    if (!justSignedIn || isRecordRoute || isTreeRoute) return;
    if (!location.pathname.startsWith("/legacy")) return;
    navigate(BEIZA_LINKS.legacy.recordStation, { replace: true });
  }, [signedIn, sessionLoading, isRecordRoute, isTreeRoute, location.pathname, navigate]);

  if (sessionLoading && isTreeRoute && !studioPreview) {
    return wrapLegacyStudio(
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>,
    );
  }

  if (treeFullscreen) {
    return wrapLegacyStudio(
      <LegacyShellProvider signedIn={signedIn || studioPreview}>
        <LegacyAuthGate>
          <LegacyTabRail />
          <Outlet />
        </LegacyAuthGate>
      </LegacyShellProvider>,
    );
  }

  if (recordSignInShell) {
    return wrapLegacyStudio(
      <LegacyRecordRoute
        circleLabel={circleCtx?.circle?.name}
        signedIn={false}
        studioPreview={false}
      />,
    );
  }

  if (isRecordRoute) {
    return wrapLegacyStudio(
      <LegacyRecordRoute
        circleLabel={circleCtx?.circle?.name}
        signedIn={signedIn}
        studioPreview={studioPreview}
      />,
    );
  }

  return wrapLegacyStudio(
    <LegacyShellProvider signedIn={signedIn || studioPreview}>
      <div className="relative min-h-screen bg-background text-foreground">
        <Navigation />
        <LegacyTabRail />
        <ArmAnchorMenu
          links={LEGACY_ARM_ANCHORS}
          className="pointer-events-auto fixed right-[max(1rem,var(--beiza-site-padding-x))] top-20 z-[60] min-[1200px]:right-[calc(5.5rem+var(--beiza-site-padding-x))]"
        />

        <main className="relative min-h-[calc(100dvh-8.5rem)] overflow-visible px-[var(--beiza-site-padding-x,1.25rem)] pb-24 pt-4 sm:min-h-[calc(100dvh-10.5rem)] sm:pb-28 min-[1200px]:pr-[calc(5.5rem+var(--beiza-site-padding-x,1.25rem))]">
          <PageLayoutStudioZone
            pageId={pageStudioId}
            className="w-full py-4 sm:py-6"
            applyMaxWidth
            copyLiftTarget="children"
          >
            <LegacyAuthGate>
              <Outlet />
            </LegacyAuthGate>
          </PageLayoutStudioZone>
        </main>
      </div>
    </LegacyShellProvider>,
  );
}
