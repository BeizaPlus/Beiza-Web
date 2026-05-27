/**
 * Education `/home` FAQs — death-free, aligned with docs/product/PHILOSOPHY-UX-BRIEF.md.
 * CMS rows that look like legacy/tribute marketing are rejected on this page.
 */
import type { FaqAccordionEntry } from "@/components/framer/FaqAccordionGroup";
import { EDUCATION_FAQ } from "@/lib/auditFaqContent";
import { DEATH_FREE_ZONE_PATTERN } from "@/lib/productPhilosophy";

/** Legacy marketing FAQs (pre-philosophy CMS) — must not appear on `/home`. */
const LEGACY_MARKETING_FAQ_PATTERN =
  /\b(preserving my family'?s legacy|right time to start|beiza legacy from outside ghana|how long does the process take|what kind of experiences do you create|tribute film|celebration service|homegoing|legacy gathering|legacy unveiling|rites)\b/i;

export const EDUCATION_HOME_FAQ_TITLE = "Everything you need to know";

export function isEducationHomeFaqEntry(question: string, answer: string): boolean {
  const blob = `${question} ${answer}`;
  if (DEATH_FREE_ZONE_PATTERN.test(blob)) return false;
  if (LEGACY_MARKETING_FAQ_PATTERN.test(blob)) return false;
  return true;
}

export function educationHomeFaqFallback(): FaqAccordionEntry[] {
  return EDUCATION_FAQ.map((item, index) => ({
    id: `education-faq-${index}`,
    question: item.q,
    answer: item.a,
  }));
}

type CmsFaqRow = {
  id: string;
  question: string;
  answer: string;
  displayOrder?: number | null;
};

/** Prefer philosophy-aligned CMS rows; otherwise canonical education FAQ list. */
export function resolveEducationHomeFaqs(cmsFaqs: readonly CmsFaqRow[]): FaqAccordionEntry[] {
  const allowed = cmsFaqs
    .filter((row) => isEducationHomeFaqEntry(row.question, row.answer))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  if (allowed.length > 0) {
    return allowed.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
    }));
  }

  return educationHomeFaqFallback();
}
