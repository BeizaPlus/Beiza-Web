import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { LegacyAuthGate } from "@/components/legacy/LegacyAuthGate";
import { RecordStationViewport } from "@/components/legacy/RecordStationViewport";
import { RecordFlowProvider } from "@/components/legacy/recordFlowContext";
import { RecordViewportLock } from "@/components/legacy/RecordViewportLock";
import { Navigation } from "@/components/Navigation";
import { LegacyTabBar } from "@/components/legacy/LegacyTabBar";
import { LegacyTabRail } from "@/components/legacy/LegacyTabRail";
import { RecordPageStudioPanel } from "@/components/legacy/RecordPageStudioPanel";
import { PageLayoutStudioZone } from "@/components/dev/PageLayoutStudioZone";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { loadRecordPageStudioFrame, type RecordPageStudioFrame } from "@/lib/legacy/recordPageStudio";
import { LEGACY_AUTH_PAGE_STUDIO_ID, resolveLegacyPageStudioId } from "@/lib/pageLayoutStudio";
import { useLegacySession, useMyLegacyCircle } from "@/hooks/useLegacy";

function LegacyRecordRoute({ circleLabel, hasSession }: { circleLabel?: string; hasSession: boolean }) {
  const studioOn = isLayoutStudioEnabled();
  const [recordStudio, setRecordStudio] = useState<RecordPageStudioFrame>(() =>
    loadRecordPageStudioFrame(),
  );

  return (
    <RecordFlowProvider>
      <RecordViewportLock />
      <div
        className="record-page-shell relative h-[100dvh] max-h-[100dvh] min-h-0 w-full overflow-hidden bg-black text-foreground max-md:[--beiza-content-indent:0rem] max-md:[--record-content-indent:0rem]"
        style={{ "--record-site-nav-h": "4.5rem" } as CSSProperties}
      >
        <RecordStationViewport
          studioFrame={studioOn ? recordStudio : undefined}
          circleLabel={circleLabel}
          station={
            hasSession ? (
              <div className="legacy-record-station-panel h-full min-h-0 w-full overflow-hidden">
                <Outlet />
              </div>
            ) : null
          }
        />
        <Navigation variant="recordOverlay" />
        <LegacyTabRail />
        {studioOn ? (
          <RecordPageStudioPanel frame={recordStudio} onChange={setRecordStudio} />
        ) : null}
      </div>
    </RecordFlowProvider>
  );
}

/**
 * Shared Legacy shell — Heritage nav + icon tab bar.
 * Record route: single viewport, no document scroll.
 */
export function LegacyLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useLegacySession();
  const { data: circleCtx } = useMyLegacyCircle();
  const isTreeRoute = location.pathname === "/legacy/circle";
  const treeFullscreen = isTreeRoute && !!session;
  const isRecordRoute = location.pathname.startsWith(BEIZA_LINKS.legacy.recordStation);
  /** Logged out: every legacy tab shows the same record sign-in station (URL only changes active tab). */
  const recordStationShell = !session && !sessionLoading;
  const pageStudioId = session
    ? resolveLegacyPageStudioId(location.pathname)
    : LEGACY_AUTH_PAGE_STUDIO_ID;

  const hadSessionRef = useRef(false);
  useEffect(() => {
    if (sessionLoading) return;
    const justSignedIn = !!session && !hadSessionRef.current;
    hadSessionRef.current = !!session;
    if (!justSignedIn || isRecordRoute || isTreeRoute) return;
    if (!location.pathname.startsWith("/legacy")) return;
    navigate(BEIZA_LINKS.legacy.recordStation, { replace: true });
  }, [session, sessionLoading, isRecordRoute, isTreeRoute, location.pathname, navigate]);

  if (treeFullscreen) {
    return (
      <LegacyAuthGate>
        <Outlet />
      </LegacyAuthGate>
    );
  }

  if (sessionLoading && isTreeRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (isRecordRoute || recordStationShell) {
    return (
      <LegacyRecordRoute circleLabel={circleCtx?.circle?.name} hasSession={!!session} />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <LegacyTabBar />

      <main className="relative min-h-[calc(100dvh-8.5rem)] overflow-visible sm:min-h-[calc(100dvh-10.5rem)]">
        <PageLayoutStudioZone
          pageId={pageStudioId}
          className="w-full px-[var(--beiza-site-padding-x,1.25rem)] py-4 sm:py-6"
          applyMaxWidth
          copyLiftTarget="children"
        >
          <LegacyAuthGate>
            <Outlet />
          </LegacyAuthGate>
        </PageLayoutStudioZone>
      </main>
    </div>
  );
}
