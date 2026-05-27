import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { PRODUCT_NAV_LINKS, type ProductNavLink } from "@/config/productNav";
import {
  BEIZA_LINKS,
  BEIZA_REDIRECTS,
  isCirclePath,
} from "@/lib/beizaMasterLinks";
import { BeizaLogoLink } from "@/components/BeizaLogoLink";
import { Button } from "./ui/button";
import { sitePaddingX } from "@/lib/brandUi";
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

function navLinkClassName(linkId: string, active: boolean): string {
  if (active) return "text-white";
  if (linkId === "blog") return "text-[#666666] transition-colors hover:text-[#E6A817]";
  return "text-[#666666] transition-colors hover:text-white";
}

type NavItemProps = {
  link: ProductNavLink;
  onNavigate?: () => void;
  className?: string;
};

function NavItem({ link, onNavigate, className }: NavItemProps) {
  const location = useLocation();
  const active = isActiveNavPath(location.pathname, link.href);

  return (
    <Link
      to={link.href}
      onClick={onNavigate}
      className={cn(
        "relative inline-block pb-3 font-manrope text-lg font-medium",
        navLinkClassName(link.id, active),
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

type NavigationProps = {
  /** Record page: floats on hero, no extra black flex row */
  variant?: "default" | "recordOverlay";
};

/** Locked product header — Vault · Circle · Blog (CMS rows must not replace this). */
const HEADER_NAV_LINKS: ProductNavLink[] = PRODUCT_NAV_LINKS;

export const Navigation = ({ variant = "default" }: NavigationProps) => {
  const location = useLocation();
  const recordOverlay = variant === "recordOverlay";
  /** Transparent overlay nav — root redirect only (`/` → `/welcome`). All product pages use the locked sticky bar. */
  const isLandingHero = !recordOverlay && location.pathname === "/";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navLinks = HEADER_NAV_LINKS;

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <nav
        className={cn(
          recordOverlay
            ? "pointer-events-none fixed inset-x-0 top-0 z-[90] w-full border-0 bg-gradient-to-b from-black/75 via-black/35 to-transparent"
            : isLandingHero
              ? "pointer-events-none fixed inset-x-0 top-0 z-40 w-full border-0 bg-transparent"
              : "sticky top-0 z-40 w-full border-b border-white/5 bg-black/10 backdrop-blur-sm supports-[backdrop-filter]:bg-black/20",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto w-full",
            recordOverlay ? "py-3" : isLandingHero ? "py-5 sm:py-6" : "py-4 sm:py-6",
            sitePaddingX,
          )}
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <BeizaLogoLink
              className="relative z-[100]"
              mascotClassName={isLandingHero ? "h-8 w-auto" : undefined}
              wordmarkClassName={isLandingHero ? "h-5 w-auto" : undefined}
            />

            <div className="hidden min-w-0 items-center gap-6 lg:flex lg:gap-10">
              {navLinks.map((link) => (
                <NavItem
                  key={link.id}
                  link={link}
                  className={isLandingHero ? "pb-1 text-sm font-medium tracking-tight" : undefined}
                />
              ))}
            </div>

            <div className="hidden shrink-0 lg:block">
              <Link to={CTA.href}>
                <Button
                  className={cn(
                    "rounded-full bg-white font-manrope text-sm font-medium text-black hover:bg-white/90",
                    isLandingHero ? "px-5 py-2.5" : "px-5 py-2.5 sm:px-6 sm:py-3",
                  )}
                >
                  {CTA.label}
                </Button>
              </Link>
            </div>

            <button
              type="button"
              className="shrink-0 text-white lg:hidden"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              onClick={() => setDrawerOpen((o) => !o)}
            >
              {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
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

