import { Link } from "react-router-dom";
import siteConfig from "@/config/site-config";

const sectionLinks = [
  { label: "About Us", to: "/#about" },
  { label: "Memoirs", to: "/memoirs/monica-manu" },
  { label: "Tributes", to: "/gallery" },
  { label: "Contact", to: "/contact#hero" },
];

const socialLinks = [
  { label: "Facebook", href: siteConfig.social.facebook },
  { label: "Instagram", href: siteConfig.social.instagram },
  { label: "TikTok", href: siteConfig.social.tiktok },
  { label: "YouTube", href: siteConfig.social.youtube },
].filter((item) => Boolean(item.href));

export const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-8 py-24 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <div className="max-w-lg space-y-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/Head.svg" alt="Beiza" className="h-10 w-auto" />
              <img src="/Beiza_White.svg" alt="Beiza wordmark" className="h-5 w-auto" />
            </Link>
            <p className="text-subtle text-sm leading-relaxed">
              We design meaningful farewells — handcrafted tributes that celebrate life, culture, and legacy.
            </p>
            <p className="text-subtle text-xs uppercase tracking-[0.3em]">
              © {siteConfig.copyrightYear} Beiza — Crafted with care, made to remember.
            </p>
          </div>

          <div className="grid w-full gap-12 sm:grid-cols-2 sm:gap-16">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-subtle">Sections</p>
              <nav className="space-y-3 text-sm">
                {sectionLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="block text-subtle transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-subtle">Socials</p>
              <nav className="space-y-3 text-sm">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-subtle transition-colors duration-200 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
