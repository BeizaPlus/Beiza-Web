import { useLocation } from "react-router-dom";
import { PageSeo } from "@/components/seo/PageSeo";
import { resolveSeoForPath } from "@/lib/seo/siteSeo";

/** Applies route-aware meta tags on every navigation (SPA). */
export function SeoManager() {
  const { pathname } = useLocation();
  const config = resolveSeoForPath(pathname);
  const includeSiteSchema = pathname === "/" || pathname === "/welcome" || pathname === "/home";

  return <PageSeo config={config} includeSiteSchema={includeSiteSchema} />;
}
