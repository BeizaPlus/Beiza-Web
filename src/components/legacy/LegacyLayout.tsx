import { useState, type CSSProperties } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
        className="record-page-shell relative h-[100dvh] max-h-[100dvh] min-h-0 w-full overflow-hidden bg-black text-foreground"
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
  const { data: session, isLoading: sessionLoading } = useLegacySession();
  const { data: circleCtx } = useMyLegacyCircle();
  const isTreeRoute = location.pathname === "/legacy/circle";
  const treeFullscreen = isTreeRoute && !!session;
  const isRecordRoute = location.pathname === "/legacy/record";
  const pageStudioId = session
    ? resolveLegacyPageStudioId(location.pathname)
    : LEGACY_AUTH_PAGE_STUDIO_ID;

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

  if (isRecordRoute) {
    return (
      <LegacyRecordRoute circleLabel={circleCtx?.circle?.name} hasSession={!!session} />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <LegacyTabBar />

      <main className="relative min-h-[calc(100dvh-10.5rem)] overflow-visible">
        <PageLayoutStudioZone
          pageId={pageStudioId}
          className="px-4 py-6"
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
