import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useFooterLinks, useSiteSettings } from "@/hooks/usePublicContent";

export const Footer = () => {
  const { data: footerLinks } = useFooterLinks();
  const { data: siteSettings } = useSiteSettings();

  const settings = useMemo(() => {
    return siteSettings ?? null;
  }, [siteSettings]);

  const groupedFooterLinks = useMemo(() => {
    if (!footerLinks) return [];

    const links = footerLinks.map((link) => ({
      id: link.id,
      label: link.label,
      href: link.href,
      groupLabel: link.groupLabel ?? "Sections",
    }));

    const map = new Map<string, { id: string; label: string; href: string }[]>();

    links.forEach((link) => {
      const key = link.groupLabel ?? "Sections";
      if (!map.has(key))
      {
        map.set(key, []);
      }
      map.get(key)!.push({ id: link.id, label: link.label, href: link.href });
    });

    return Array.from(map.entries()).map(([groupLabel, groupLinks]) => ({
      groupLabel,
      links: groupLinks,
    }));
  }, [footerLinks]);

  const socialLinks = useMemo(() => {
    if (!settings?.social) return [];

    return [
      { label: "Facebook", href: settings.social.facebook },
      { label: "Instagram", href: settings.social.instagram },
      { label: "TikTok", href: settings.social.tiktok },
      { label: "YouTube", href: settings.social.youtube },
    ].filter((item) => Boolean(item.href));
  }, [settings]);

  const copyrightYear = new Date().getFullYear();

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
              © {copyrightYear} {settings?.businessName ?? "Beiza Plus"} — Crafted with care, made to remember.
            </p>
          </div>

          <div className="grid w-full gap-12 sm:grid-cols-2 sm:gap-16">
            {groupedFooterLinks.map((group) => (
              <div key={group.groupLabel} className="space-y-5">
                <p className="text-xs uppercase tracking-[0.3em] text-subtle">{group.groupLabel}</p>
                <nav className="space-y-3 text-sm">
                  {group.links.map((item) => (
                    <Link
                      key={item.id}
                      to={item.href}
                      className="block text-subtle transition-colors duration-200 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}

            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.3em] text-subtle">Socials</p>
              <nav className="space-y-3 text-sm">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href!}
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
