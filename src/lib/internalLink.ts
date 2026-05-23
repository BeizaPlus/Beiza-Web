/** True for in-app paths handled by React Router (not mailto/tel/http). */
export function isInternalAppHref(href: string): boolean {
  if (!href || href === "#") return false;
  if (href.startsWith("#")) return true;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  return href.startsWith("/") && !href.startsWith("//");
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}
