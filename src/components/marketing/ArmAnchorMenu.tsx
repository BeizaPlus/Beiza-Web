import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { legacyTabLinkTo } from "@/hooks/useLegacyTabNavigate";
import { Menu, X } from "lucide-react";
import { isInternalAppHref } from "@/lib/internalLink";
import { isBeizaLiveSite } from "@/lib/layoutStudio";
import { LAYOUT_TW } from "@/lib/layoutBreakpoints";
import { cn } from "@/lib/utils";

export type AnchorLink = { href: string; label: string };

type Props = {
  links: readonly AnchorLink[];
  className?: string;
};

/** Per-arm hamburger: anchor scroll within the current page. Hidden on live site; phone-only in dev. */
export function ArmAnchorMenu({ links, className }: Props) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (isBeizaLiveSite()) {
    return null;
  }

  return (
    <div className={cn("relative hidden", `${LAYOUT_TW.phoneOnly}:block`, className)}>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white backdrop-blur-sm"
        aria-label={open ? "Close section menu" : "Open section menu"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[40] bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            className="absolute right-0 top-12 z-[41] min-w-[14rem] rounded-xl border border-white/15 bg-[#0a0a0a] p-2 shadow-xl"
            aria-label="Page sections"
          >
            {links.map((link) => {
              const itemClass =
                "block rounded-lg px-3 py-2 font-manrope text-sm text-white/85 hover:bg-[#E6A817]/15 hover:text-[#E6A817]";
              const close = () => setOpen(false);

              if (isInternalAppHref(link.href) && !link.href.startsWith("#")) {
                return (
                  <Link
                    key={link.href}
                    to={legacyTabLinkTo(link.href, location)}
                    className={itemClass}
                    onClick={close}
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <a key={link.href} href={link.href} className={itemClass} onClick={close}>
                  {link.label}
                </a>
              );
            })}
          </nav>
        </>
      ) : null}
    </div>
  );
}
