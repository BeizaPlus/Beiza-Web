import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { shouldHideGlobalHeader } from "@/lib/siteHeaderLayout";

/** Single app header — all routes render through here except welcome / admin. */
export function SiteChrome() {
  const { pathname } = useLocation();

  if (shouldHideGlobalHeader(pathname)) {
    return <Outlet />;
  }

  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}
