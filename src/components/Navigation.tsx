import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { PRODUCT_NAV_LINKS, type ProductNavLink } from "@/config/productNav";
import { allowStaticContentFallback } from "@/lib/contentPolicy";
import { useNavigationLinks } from "@/hooks/usePublicContent";
import { BeizaLogoLink } from "@/components/BeizaLogoLink";
import { Button } from "./ui/button";
import { sitePaddingX } from "@/lib/brandUi";
import { cn } from "@/lib/utils";

const CTA = { label: "Contact", href: "/contact" };

function navIdFromHref(href: string): string {
  if (href === "/vault" || href.startsWith("/legacy/vault")) return "vault";
  if (href === "/circle" || href.startsWith("/circle") || href.startsWith("/family-trees")) {
    return "circle";
  }
  if (href === "/heritage" || href === "/farewell" || href.startsWith("/white-swan")) {
    return "heritage";
  }
  return href.replace(/^\//, "").replace(/\//g, "-") || "nav";
}

function isActiveNavPath(pathname: string, href: string): boolean {
  if (href === "/vault") {
    return pathname === "/vault" || pathname.startsWith("/legacy/vault");
  }
  if (href === "/circle") {
    return (
      pathname === "/circle" ||
      pathname.startsWith("/circle/") ||
      pathname.startsWith("/family-trees") ||
      pathname.startsWith("/legacy/circle")
    );
  }
  if (href === "/heritage") {
    return (
      pathname === "/heritage" ||
      pathname === "/farewell" ||
      pathname.startsWith("/white-swan")
    );
  }
  return pathname === href;
}

function navLinkClassName(linkId: string, active: boolean): string {
  if (active) return "text-white";
  if (linkId === "heritage") return "text-[#666666] transition-colors hover:text-[#E6A817]";
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

export const Navigation = ({ variant = "default" }: NavigationProps) => {
  const recordOverlay = variant === "recordOverlay";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: navFromDb = [] } = useNavigationLinks("primary");

  const navLinks: ProductNavLink[] = useMemo(() => {
    if (navFromDb.length > 0) {
      return navFromDb.map((link) => ({
        id: navIdFromHref(link.href),
        label: link.label,
        href: link.href,
      }));
    }
    return allowStaticContentFallback() ? PRODUCT_NAV_LINKS : [];
  }, [navFromDb]);

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
            ? "pointer-events-none absolute inset-x-0 top-0 z-40 w-full border-0 bg-gradient-to-b from-black/75 via-black/35 to-transparent [&_*]:pointer-events-auto"
            : "sticky top-0 z-40 w-full border-b border-white/5 bg-black/10 backdrop-blur-sm supports-[backdrop-filter]:bg-black/20",
        )}
      >
        <div className={cn("w-full", recordOverlay ? "py-3" : "py-6", sitePaddingX)}>
          <div className="flex items-center justify-between">
            <BeizaLogoLink />

            <div className="hidden items-center gap-10 md:flex">
              {navLinks.map((link) => (
                <NavItem key={link.id} link={link} />
              ))}
            </div>

            <div className="hidden md:block">
              <Link to={CTA.href}>
                <Button className="rounded-full bg-white px-6 py-3 font-manrope text-sm font-medium text-black hover:bg-white/90">
                  {CTA.label}
                </Button>
              </Link>
            </div>

            <button
              type="button"
              className="text-white md:hidden"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              onClick={() => setDrawerOpen((o) => !o)}
            >
              {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
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
                  className="font-manrope text-4xl font-medium leading-tight tracking-tight"
                />
              ))}
            </nav>

            <div className="mt-auto space-y-4 border-t border-[#1a1a1a] pt-8">
              <Link
                to="/record"
                onClick={closeDrawer}
                className="flex w-full items-center justify-center rounded-full bg-[#E6A817] py-4 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#E6A817]/90"
              >
                + Start recording →
              </Link>
              <Link
                to="/pricing"
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

