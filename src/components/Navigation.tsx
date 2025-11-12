import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useNavigationLinks } from "@/hooks/usePublicContent";
import { Button } from "./ui/button";

export const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: navigationLinks } = useNavigationLinks("primary");

  const { primaryLinks, ctaLink } = useMemo(() => {
    const links = navigationLinks ?? [];
    const potentialCta = links.find((link) => link.label.toLowerCase() === "contact" || link.isCta);
    const filtered = potentialCta ? links.filter((link) => link.id !== potentialCta.id) : links;

    return {
      primaryLinks: filtered,
      ctaLink: potentialCta ?? {
        id: "default-contact-cta",
        label: "Contact",
        href: "/contact",
        location: "primary",
        displayOrder: filtered.length + 1,
      },
    };
  }, [navigationLinks]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const isActiveLink = (href: string) => {
    if (href.startsWith("/memoirs")) {
      return location.pathname.startsWith("/memoirs");
    }

    return href === "/" ? location.pathname === "/" : location.pathname === href;
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-transparent">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/Head.svg" alt="Beiza Plus" className="h-10 w-auto" />
            <img src="/Beiza_White.svg" alt="Beiza Plus" className="h-6 w-auto" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {primaryLinks.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link
                  key={link.id}
                  to={link.href}
                  className={`font-manrope text-lg font-medium transition-colors ${
                    isActive ? "text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Link to={ctaLink.href}>
              <Button className="rounded-full bg-white px-6 py-3 text-sm font-manrope font-medium text-black hover:bg-white/90">
                {ctaLink.label ?? "Get Started"}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleMobileMenu} className="text-white transition-colors hover:text-white/80">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to={ctaLink.href}>
              <Button className="rounded-full bg-red-500 px-6 py-3 text-sm font-manrope font-medium text-white hover:bg-red-600">
                {ctaLink.label ?? "Get Started"}
              </Button>
            </Link>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="mt-4 space-y-3 border-t border-white/20 pt-4 md:hidden">
            {primaryLinks.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link
                  key={link.id}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-lg font-manrope font-medium transition-colors ${
                    isActive ? "text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to={ctaLink.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-lg font-manrope font-medium text-white/80 transition-colors hover:text-white"
            >
              {ctaLink.label ?? "Contact"}
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  );
};
