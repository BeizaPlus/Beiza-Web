import type { AnchorLink } from "@/components/marketing/ArmAnchorMenu";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

export const LEGACY_ARM_ANCHORS: AnchorLink[] = [
  { href: "#recording-station", label: "The Recording Station" },
  { href: BEIZA_LINKS.marketing.booklet, label: "The Memory Booklet" },
  { href: BEIZA_LINKS.legacy.vault, label: "Your Legacy Vault" },
  { href: BEIZA_LINKS.legacy.circle, label: "Family Tree" },
  { href: BEIZA_LINKS.legacy.packet, label: "The Legacy Packet" },
  { href: BEIZA_LINKS.legacy.faqs, label: "FAQs" },
];

export const EDUCATION_ARM_ANCHORS: AnchorLink[] = [
  { href: "#symbols", label: "Symbols of your people" },
  { href: "#cultural-films", label: "Cultural films and stories" },
  { href: "#your-language", label: "Your language, your marks" },
  { href: "#start-legacy", label: "Start your legacy →" },
];

export const FAREWELL_ARM_ANCHORS: AnchorLink[] = [
  { href: "#plan-farewell", label: "Plan a farewell" },
  { href: "#vessels-caskets", label: "Legacy vessels and caskets" },
  { href: "#white-swan", label: "The White Swan" },
  { href: "#recover-voice", label: "Recover a voice" },
  { href: "#farewell-faqs", label: "FAQs" },
];
