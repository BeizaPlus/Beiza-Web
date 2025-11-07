import { Link } from "react-router-dom";
import siteConfig from "@/config/site-config";

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 md:py-16 w-full">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Footer Info - Logo and Tagline */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src="/Head.svg"
                alt="Beiza Plus"
                className="h-10 w-auto"
              />
              <img
                src="/Beiza_White.svg"
                alt="Beiza Plus"
                className="h-6 w-auto"
              />
            </Link>
            <p className="text-gray-400 font-manrope text-base leading-relaxed mb-4">
              We design meaningful farewells — handcrafted tributes that celebrate life, culture, and legacy.
            </p>
            <p className="text-gray-400 font-manrope text-sm">
              © {siteConfig.copyrightYear} Beiza — Crafted with care, made to remember.
            </p>
          </div>

          {/* Sections Links */}
          <div>
            <h3 className="text-white font-manrope font-medium text-base mb-4">Sections</h3>
            <nav className="flex flex-col gap-3">
              <Link
                to="/#about"
                className="text-gray-400 hover:text-white transition-colors font-manrope text-sm"
              >
                About Us
              </Link>
              <Link
                to="/gallery"
                className="text-gray-400 hover:text-white transition-colors font-manrope text-sm"
              >
                Memoirs
              </Link>
              <Link
                to="/gallery"
                className="text-gray-400 hover:text-white transition-colors font-manrope text-sm"
              >
                Tributes
              </Link>
              <Link
                to="/contact"
                className="text-gray-400 hover:text-white transition-colors font-manrope text-sm"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Socials Links */}
          <div>
            <h3 className="text-white font-manrope font-medium text-base mb-4">Socials</h3>
            <nav className="flex flex-col gap-3">
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors font-manrope text-sm"
              >
                Facebook
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors font-manrope text-sm"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors font-manrope text-sm"
              >
                TikTok
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};
