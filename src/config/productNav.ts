import { BEIZA_LINKS, BEIZA_REDIRECTS } from "@/lib/beizaMasterLinks";



export type ProductNavLink = {

  id: string;

  label: string;

  href: string;

};



export const PRODUCT_NAV_LINKS: ProductNavLink[] = [

  { id: "vault", label: "Vault", href: BEIZA_REDIRECTS.vault.from },

  { id: "circle", label: "Circle", href: BEIZA_LINKS.circle.directory },

  { id: "blog", label: "Blog", href: BEIZA_LINKS.marketing.blog },

];



export const FOOTER_PRICING_LINK = {

  label: "Plans & pricing",

  href: BEIZA_LINKS.marketing.pricing,

};

export const FOOTER_STORIES_LINK = {

  label: "Stories",

  href: BEIZA_LINKS.marketing.events,

};

