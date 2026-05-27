/** Education home (`/home`) — culture & legacy, not farewell/loss framing. */

export const EDUCATION_HERO_SUBHEADING =
  "Learn your roots, record your family's voice, and carry symbols forward — Ghana-first, open to families everywhere.";

const LOSS_OR_FAREWELL_PATTERN =
  /\b(loss|goodbye|farewells?|grief|memorial|passed away|life well lived|never been about loss)\b/i;

/** Replace farewell/loss hero copy with education-first messaging. */
export function educationHeroSubheading(incoming?: string | null): string {
  const text = incoming?.trim();
  if (!text || LOSS_OR_FAREWELL_PATTERN.test(text)) {
    return EDUCATION_HERO_SUBHEADING;
  }
  return text;
}
