import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-transparent">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/Head.svg" alt="Beiza Plus" className="h-10 w-auto" />
            <img src="/Beiza_White.svg" alt="Beiza Plus" className="h-6 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`font-manrope text-lg font-medium transition-colors ${location.pathname === "/" ? "text-white" : "text-white/80 hover:text-white"
                }`}
            >
              Live Now
            </Link>
            <Link
              to="/events"
              className={`font-manrope text-lg font-medium transition-colors ${location.pathname === "/events" ? "text-white" : "text-white/80 hover:text-white"
                }`}
            >
              Events
            </Link>
            <Link
              to="/gallery"
              className={`font-manrope text-lg font-medium transition-colors ${location.pathname === "/gallery" ? "text-white" : "text-white/80 hover:text-white"
                }`}
            >
              Gallery
            </Link>
            <Link
              to="/memoirs/monica-manu"
              className={`font-manrope text-lg font-medium transition-colors ${location.pathname.startsWith("/memoirs") ? "text-white" : "text-white/80 hover:text-white"
                }`}
            >
              Memoirs
            </Link>
          </div>

          <div className="hidden md:block">
            <Link to="/contact">
              <Button className="rounded-full bg-white px-6 py-3 text-sm font-manrope font-medium text-black hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleMobileMenu} className="text-white transition-colors hover:text-white/80">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/contact">
              <Button className="rounded-full bg-red-500 px-6 py-3 text-sm font-manrope font-medium text-white hover:bg-red-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="mt-4 space-y-3 border-t border-white/20 pt-4 md:hidden">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-3 text-lg font-manrope font-medium transition-colors ${location.pathname === "/" ? "text-white" : "text-white/80 hover:text-white"
                }`}
            >
              Live Now
            </Link>
            <Link
              to="/events"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-3 text-lg font-manrope font-medium transition-colors ${location.pathname === "/events" ? "text-white" : "text-white/80 hover:text-white"
                }`}
            >
              Events
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-3 text-lg font-manrope font-medium transition-colors ${location.pathname === "/gallery" ? "text-white" : "text-white/80 hover:text-white"
                }`}
            >
              Gallery
            </Link>
            <Link
              to="/memoirs/monica-manu"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-3 text-lg font-manrope font-medium transition-colors ${location.pathname.startsWith("/memoirs") ? "text-white" : "text-white/80 hover:text-white"
                }`}
            >
              Memoirs
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-lg font-manrope font-medium text-white/80 transition-colors hover:text-white"
            >
              Contact
            </Link>
          </div>
        ) : null}
      </div>
    </nav>
  );
};
