import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-0 w-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo on the left */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Head.svg"
              alt="Beiza Plus"
              className="h-10 w-auto group-hover:scale-110 transition-transform duration-300"
            />
            <img
              src="/Beiza_White.svg"
              alt="Beiza Plus"
              className="h-6 w-auto group-hover:scale-110 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`font-manrope font-medium transition-all duration-300 ${location.pathname === '/' ? 'text-white' : 'text-white/90 hover:text-white'
                }`}
              style={{ fontSize: '26px' }}
            >
              Live Now
            </Link>
            <Link
              to="/gallery"
              className={`font-manrope font-medium transition-all duration-300 ${location.pathname === '/gallery' ? 'text-white' : 'text-white/90 hover:text-white'
                }`}
              style={{ fontSize: '26px' }}
            >
              Biographies
            </Link>
          </div>

          {/* Desktop CTA button */}
          <div className="hidden md:block">
            <Link to="/contact">
              <Button
                className="bg-white text-black hover:bg-white/90 rounded-full px-6 py-3 text-sm font-manrope font-medium h-auto border-0"
              >
                Send Tribute
              </Button>
            </Link>
          </div>

          {/* Mobile menu button - Framer shows red button on mobile */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-white/80 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/contact">
              <Button
                className="bg-red-500 text-white hover:bg-red-600 rounded-full px-6 py-3 text-sm font-manrope font-medium h-auto border-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgb(255, 0, 0)' }}
              >
                Send Tribute
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-manrope font-medium transition-all duration-300 px-3 py-3 rounded-lg ${location.pathname === '/' ? 'text-white' : 'text-white/90 hover:text-white'
                  }`}
                style={{ fontSize: '26px' }}
              >
                Live Now
              </Link>
              <Link
                to="/gallery"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-manrope font-medium transition-all duration-300 px-3 py-3 rounded-lg ${location.pathname === '/gallery' ? 'text-white' : 'text-white/90 hover:text-white'
                  }`}
                style={{ fontSize: '26px' }}
              >
                Biographies
              </Link>
              <div className="pt-4">
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    className="w-full bg-white text-black hover:bg-white/90 rounded-full px-6 py-3 text-sm font-manrope font-medium h-auto border-0"
                  >
                    Send Tribute
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
