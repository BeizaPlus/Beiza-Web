/**
 * Runtime check: welcome card hrefs match docs/LINK-MASTERSHEET.md toolbar table.
 * Usage: npx tsx scripts/validate-welcome-hrefs.mjs
 */
import { getWelcomeCardHref } from "../src/lib/beizaMasterLinks.ts";
import { WELCOME_LANGUAGE_OPTIONS } from "../src/lib/locale/welcomeLanguageOptions.ts";

const MATRIX = {
  GH: ["/home", "/legacy/record", "/af/farewell"],
  EN: ["/home", "/legacy/record", "/farewell"],
  ES: ["/home", "/legacy/record", "/la/farewell"],
  FR: ["/home", "/legacy/record", "/fr/farewell"],
  CN: ["/home", "/legacy/record", "/zh/farewell"],
};

const failures = [];

for (const { code, locale } of WELCOME_LANGUAGE_OPTIONS) {
  const expected = MATRIX[code];
  const actual = [
    getWelcomeCardHref(locale, "education"),
    getWelcomeCardHref(locale, "legacy"),
    getWelcomeCardHref(locale, "farewell"),
  ];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(
      `${code}: expected ${expected.join(", ")} — got ${actual.join(", ")}`,
    );
  }
}

if (failures.length) {
  console.error("Welcome href matrix failures:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("  ✓ Welcome toolbar card hrefs match LINK-MASTERSHEET.md");
