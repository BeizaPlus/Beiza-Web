import { Outlet, useLocation } from "react-router-dom";
import { LegacyAuthGate } from "@/components/legacy/LegacyAuthGate";
import { RecordStationViewport } from "@/components/legacy/RecordStationViewport";
import { RecordFlowProvider } from "@/components/legacy/recordFlowContext";
import { Navigation } from "@/components/Navigation";
import { LegacyTabBar } from "@/components/legacy/LegacyTabBar";
import { PageLayoutStudioZone } from "@/components/dev/PageLayoutStudioZone";
import { LEGACY_AUTH_PAGE_STUDIO_ID, resolveLegacyPageStudioId } from "@/lib/pageLayoutStudio";
import { useLegacySession, useMyLegacyCircle } from "@/hooks/useLegacy";

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
      <RecordFlowProvider>
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
          <Navigation />
          <LegacyTabBar />
          <RecordStationViewport
            circleLabel={circleCtx?.circle?.name}
            station={
              session ? (
                <div className="legacy-record-station-panel h-full min-h-0 w-full overflow-hidden">
                  <Outlet />
                </div>
              ) : null
            }
          />
        </div>
      </RecordFlowProvider>
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
