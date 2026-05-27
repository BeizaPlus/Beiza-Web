import { useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { PRODUCT_NAV_LINKS, type ProductNavLink } from "@/config/productNav";
import {
  BEIZA_LINKS,
  BEIZA_REDIRECTS,
  isCirclePath,
} from "@/lib/beizaMasterLinks";
import {
  resolveSiteHeaderMode,
  SITE_HEADER_HEIGHT,
  SITE_HEADER_HEIGHT_VAR,
  siteHeaderInnerClass,
} from "@/lib/siteHeaderLayout";
import { BeizaLogoLink } from "@/components/BeizaLogoLink";
import { Button } from "./ui/button";
import { LAYOUT_TW } from "@/lib/layoutBreakpoints";
import { cn } from "@/lib/utils";

const CTA = { label: "Contact", href: BEIZA_LINKS.marketing.contact };

function isActiveNavPath(pathname: string, href: string): boolean {
  if (href === BEIZA_REDIRECTS.vault.from) {
    return pathname === BEIZA_REDIRECTS.vault.from || pathname.startsWith(BEIZA_LINKS.legacy.vault);
  }
  if (href === BEIZA_LINKS.circle.directory) {
    return isCirclePath(pathname);
  }
  if (href === BEIZA_LINKS.marketing.blog) {
    return pathname === BEIZA_LINKS.marketing.blog || pathname.startsWith(`${BEIZA_LINKS.marketing.blog}/`);
  }
  return pathname === href;
}

function navLinkClassName(linkId: string, active: boolean, cinematic = false): string {
  if (active) return "text-white";
  if (cinematic) return "text-white/50 transition-colors hover:text-white";
  if (linkId === "blog") return "text-[#666666] transition-colors hover:text-[#E6A817]";
  return "text-[#666666] transition-colors hover:text-white";
}

type NavItemProps = {
  link: ProductNavLink;
  onNavigate?: () => void;
  className?: string;
  cinematic?: boolean;
};

function NavItem({ link, onNavigate, className, cinematic = false }: NavItemProps) {
  const location = useLocation();
  const active = isActiveNavPath(location.pathname, link.href);

  return (
    <Link
      to={link.href}
      onClick={onNavigate}
      className={cn(
        "relative inline-block font-manrope font-medium",
        cinematic ? "pb-0 text-sm tracking-tight" : "pb-3 text-lg",
        navLinkClassName(link.id, active, cinematic),
        className,
      )}
    >
      {link.label}
      {active ? (
        <span
          className="absolute bottom-0 left-1/2 h-[1.5px] w-[1.5px] -translate-x-1/2 rounded-full bg-[#E6A817]"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

/** Locked product header — Vault · Circle · Blog (CMS rows must not replace this). */
const HEADER_NAV_LINKS: ProductNavLink[] = PRODUCT_NAV_LINKS;

/**
 * Global site header — mode is derived from the current route (see siteHeaderLayout.ts).
 * Render once via SiteChrome; do not mount per-page.
 */
export const Navigation = () => {
  const location = useLocation();
  const headerMode = resolveSiteHeaderMode(location.pathname);
  const recordOverlay = headerMode === "recordOverlay";
  const isCinematicHero = headerMode === "cinematic";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navLinks = HEADER_NAV_LINKS;

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    document.documentElement.style.setProperty(SITE_HEADER_HEIGHT_VAR, SITE_HEADER_HEIGHT);
    return () => {
      document.documentElement.style.removeProperty(SITE_HEADER_HEIGHT_VAR);
    };
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <nav
        className={cn(
          recordOverlay
            ? "pointer-events-none fixed inset-x-0 top-0 z-[90] w-full border-0 bg-gradient-to-b from-black/75 via-black/35 to-transparent"
            : isCinematicHero
              ? "pointer-events-none fixed inset-x-0 top-0 z-40 w-full border-0 bg-transparent"
              : "sticky top-0 z-40 w-full border-b border-white/5 bg-black/10 backdrop-blur-sm supports-[backdrop-filter]:bg-black/20",
        )}
        style={{ [SITE_HEADER_HEIGHT_VAR]: SITE_HEADER_HEIGHT } as CSSProperties}
      >
        <div
          className={cn(
            "pointer-events-auto w-full",
            siteHeaderInnerClass({ cinematic: isCinematicHero }),
          )}
        >
          <div
            className={cn(
              "min-w-0 items-center",
              isCinematicHero
                ? "flex justify-between gap-3 md:grid md:grid-cols-[minmax(0,11.25rem)_1fr_auto] md:gap-4"
                : "flex justify-between gap-3",
            )}
          >
            <BeizaLogoLink
              className={cn("relative z-[100]", isCinematicHero && "max-w-[180px]")}
              mascotClassName={isCinematicHero || recordOverlay ? "h-8 w-auto" : undefined}
              wordmarkClassName={isCinematicHero || recordOverlay ? "h-5 w-auto" : undefined}
            />

            <div
              className={cn(
                "hidden min-w-0 items-center justify-center",
                isCinematicHero ? `${LAYOUT_TW.tabletUp}:flex gap-12` : `${LAYOUT_TW.tabletUp}:flex gap-10`,
              )}
              style={isCinematicHero ? { paddingTop: "0.875rem" } : undefined}
            >
              {navLinks.map((link) => (
                <NavItem key={link.id} link={link} cinematic={isCinematicHero} />
              ))}
            </div>

            <div
              className={cn(
                "flex shrink-0 items-center gap-2",
                isCinematicHero && `${LAYOUT_TW.tabletUp}:items-start ${LAYOUT_TW.tabletUp}:gap-2.5`,
              )}
            >
              <Link
                to={CTA.href}
                className={cn("hidden", `${LAYOUT_TW.tabletUp}:inline-flex`)}
              >
                <Button
                  className="rounded-full bg-white px-5 py-2.5 font-manrope text-sm font-medium text-black hover:bg-white/90"
                >
                  {CTA.label}
                </Button>
              </Link>

              <button
                type="button"
                className={cn(
                  "relative z-[100] shrink-0 text-white",
                  isCinematicHero
                    ? `${LAYOUT_TW.tabletUp}:mt-2 ${LAYOUT_TW.tabletUp}:flex ${LAYOUT_TW.tabletUp}:h-10 ${LAYOUT_TW.tabletUp}:w-10 ${LAYOUT_TW.tabletUp}:items-center ${LAYOUT_TW.tabletUp}:justify-center ${LAYOUT_TW.tabletUp}:rounded-full ${LAYOUT_TW.tabletUp}:border ${LAYOUT_TW.tabletUp}:border-white/20 ${LAYOUT_TW.tabletUp}:bg-black/45 ${LAYOUT_TW.tabletUp}:backdrop-blur-sm`
                    : `${LAYOUT_TW.tabletUp}:hidden`,
                )}
                aria-label={drawerOpen ? "Close menu" : "Open menu"}
                onClick={() => setDrawerOpen((o) => !o)}
              >
                {drawerOpen ? (
                  <X className={cn(isCinematicHero ? "h-5 w-5" : "h-6 w-6")} />
                ) : (
                  <Menu className={cn(isCinematicHero ? "h-6 w-6 md:h-5 md:w-5" : "h-6 w-6")} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {drawerOpen ? (
        <div
          className={cn(
            "fixed inset-0 z-50",
            !isCinematicHero && `${LAYOUT_TW.tabletUp}:hidden`,
          )}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            aria-label="Close menu"
            onClick={closeDrawer}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-[#0a0a0a] px-8 py-10 shadow-2xl">
            <div className="flex items-center justify-between">
              <BeizaLogoLink
                variant="wordmark"
                wordmarkClassName="h-5 w-auto"
                onClick={closeDrawer}
              />
              <button type="button" onClick={closeDrawer} className="text-white" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col gap-8">
              {navLinks.map((link) => (
                <NavItem
                  key={link.id}
                  link={link}
                  onNavigate={closeDrawer}
                  className="font-manrope text-3xl font-medium leading-tight tracking-tight sm:text-4xl"
                />
              ))}
            </nav>

            <div className="mt-auto space-y-4 border-t border-[#1a1a1a] pt-8">
              <Link
                to={BEIZA_LINKS.record.alias}
                onClick={closeDrawer}
                className="flex w-full items-center justify-center rounded-full bg-[#E6A817] py-4 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#E6A817]/90"
              >
                + Start recording →
              </Link>
              <Link
                to={BEIZA_LINKS.marketing.pricing}
                onClick={closeDrawer}
                className="block text-center text-sm text-[#555555] hover:text-[#888888]"
              >
                Pricing →
              </Link>
              <Link
                to={CTA.href}
                onClick={closeDrawer}
                className="block text-center text-sm text-[#666666] hover:text-white"
              >
                {CTA.label}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
