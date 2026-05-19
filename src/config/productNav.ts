export type ProductNavLink = {
  id: string;
  label: string;
  href: string;
};

export const PRODUCT_NAV_LINKS: ProductNavLink[] = [
  { id: "vault", label: "Vault", href: "/vault" },
  { id: "circle", label: "Circle", href: "/circle" },
  { id: "heritage", label: "Heritage", href: "/heritage" },
];

export const FOOTER_PRICING_LINK = { label: "Plans & pricing", href: "/pricing" };
export const FOOTER_STORIES_LINK = { label: "Stories", href: "/events" };
