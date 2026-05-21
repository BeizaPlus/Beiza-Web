import { Link } from "react-router-dom";
import { BeizaLogoLink } from "@/components/BeizaLogoLink";
import { useMemo } from "react";
import { FOOTER_PRICING_LINK, FOOTER_STORIES_LINK } from "@/config/productNav";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { useFooterLinks, useSiteSettings } from "@/hooks/usePublicContent";
import { sitePaddingX } from "@/lib/brandUi";
import { cn } from "@/lib/utils";

export const Footer = () => {
  const { data: footerLinks } = useFooterLinks();
  const { data: settings } = useSiteSettings();

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
      <div className={cn("w-full py-24 lg:py-28", sitePaddingX)}>
        <div className="grid min-w-0 gap-12 sm:gap-16 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_1fr_auto] lg:items-start lg:justify-between">
          <div className="max-w-md space-y-8">
            <BeizaLogoLink wordmarkClassName="h-5 w-auto" />
            <p className="text-subtle text-sm leading-relaxed">
              {settings?.footer_tagline ??
                "We design meaningful legacies — handcrafted records that celebrate life, culture, and family."}
            </p>
            <p className="text-subtle text-sm">
              <Link
                to={FOOTER_PRICING_LINK.href}
                className="text-muted-foreground transition-colors hover:text-subtle"
              >
                {FOOTER_PRICING_LINK.label} →
              </Link>
            </p>
            <p className="text-subtle text-sm">
              <Link
                to={BEIZA_LINKS.farewell.heritage}
                className="text-muted-foreground transition-colors hover:text-subtle"
              >
                Planning a farewell? →
              </Link>
            </p>
            <p className="text-subtle text-sm">
              <Link
                to={BEIZA_LINKS.marketing.recover}
                className="text-muted-foreground transition-colors hover:text-subtle"
              >
                Recover a voice →
              </Link>
            </p>
            <p className="text-subtle text-sm">
              <Link
                to={FOOTER_STORIES_LINK.href}
                className="text-muted-foreground transition-colors hover:text-subtle"
              >
                {FOOTER_STORIES_LINK.label} →
              </Link>
            </p>
            <p className="text-subtle text-xs uppercase tracking-[0.3em]">
              © {copyrightYear} {settings?.businessName ?? "Beiza Plus"} — Crafted with care, made to remember.
            </p>
          </div>

          {groupedFooterLinks.map((group) => (
            <div key={group.groupLabel} className="space-y-5 lg:justify-self-center">
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

          <div className="space-y-5 lg:justify-self-end">
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
    </footer>
  );
};
