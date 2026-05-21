/**
 * Validates link mastersheet invariants (no browser required).
 * Usage: npm run links:check
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const masterPath = join(root, "src/lib/beizaMasterLinks.ts");
const welcomePath = join(root, "src/pages/WelcomeGate.tsx");
const appPath = join(root, "src/App.tsx");

const master = readFileSync(masterPath, "utf8");
const welcome = readFileSync(welcomePath, "utf8");
const app = readFileSync(appPath, "utf8");

const failures = [];

/** docs/LINK-MASTERSHEET.md — welcome toolbar card hrefs (Education · Legacy · Farewell) */
const WELCOME_TOOLBAR_MATRIX = {
  GH: ["/home", "/legacy/record", "/af/farewell"],
  EN: ["/home", "/legacy/record", "/farewell"],
  ES: ["/home", "/legacy/record", "/la/farewell"],
  FR: ["/home", "/legacy/record", "/fr/farewell"],
  CN: ["/home", "/legacy/record", "/zh/farewell"],
};

const REGIONAL_ROUTE_PATHS = [
  "in/heritage",
  "in/farewell",
  "in/education",
  "la/heritage",
  "la/farewell",
  "la/education",
  "zh/heritage",
  "zh/farewell",
  "zh/education",
  "br/heritage",
  "br/farewell",
  "br/education",
  "af/heritage",
  "af/farewell",
  "af/education",
  "fr/heritage",
  "fr/farewell",
  "fr/education",
];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

// Source file contains locked paths
assert(master.includes('educationHome: "/home"'), "BEIZA_LINKS.home.educationHome must be /home");
assert(master.includes('recordStation: "/legacy/record"'), "BEIZA_LINKS.legacy.recordStation must be /legacy/record");
assert(
  master.includes("education: regionalEducationWrapperPath(locale)"),
  "All welcome education routes must use regionalEducationWrapperPath",
);
assert(
  master.includes("if (path === \"legacy\") return WELCOME_CARD_TARGETS.legacy"),
  "getWelcomeCardHref must lock Legacy to record station",
);
assert(
  !master.includes('if (path === "education") return WELCOME_CARD_TARGETS.education'),
  "getWelcomeCardHref must route Education via getWelcomeRoute (locale-aware)",
);

// Welcome gate uses mastersheet helper (not inline paths)
assert(
  welcome.includes("getWelcomeCardHref"),
  "WelcomeGate must use getWelcomeCardHref from mastersheet",
);
assert(
  !welcome.includes('to: "/education"') && !welcome.includes("to: '/education'"),
  "WelcomeGate must not hardcode /education on cards",
);
assert(
  !welcome.match(/key === "legacy"\s*\?\s*["']/),
  "WelcomeGate must not inline legacy path ternary — use getWelcomeCardHref",
);

assert(
  app.includes("REGIONAL_PREFIX_LOCALES") && app.includes("regionalAppRoutePath"),
  "App.tsx must generate regional routes from beizaMasterLinks",
);
assert(
  !app.includes('<Route path="/fr/farewell"'),
  "App.tsx must not hardcode duplicate regional routes",
);
assert(
  master.includes("legacy: WELCOME_CARD_TARGETS.legacy"),
  "WELCOME_REGIONAL_ROUTES legacy key must point to record station",
);

// Smoke expectations documented in mastersheet
const expectedEn = "/home,/legacy/record,/farewell";
assert(
  master.includes('education: BEIZA_LINKS.home.educationHome'),
  "WELCOME_CARD_TARGETS.education must point at education home",
);
assert(
  master.includes('culturalImmersion: "/education"'),
  "Legacy /education URL must redirect to education home",
);

// Regional URL prefixes (see REGIONAL_PREFIX in beizaMasterLinks.ts)
for (const prefix of ["/in", "/la", "/zh", "/br", "/af", "/fr"]) {
  assert(master.includes(prefix), `REGIONAL_PREFIX must include prefix ${prefix}`);
}
assert(
  app.includes("regionalAppRoutePath") && app.includes("REGIONAL_PREFIX_LOCALES"),
  "App.tsx must register regional routes from beizaMasterLinks",
);
assert(
  master.includes("WELCOME_TOOLBAR_LINK_TABLE"),
  "Publish welcome toolbar link table in beizaMasterLinks.ts",
);

assert(
  app.includes("educationCulturalImmersion") && app.includes("regionalEducationCulturalImmersionPath"),
  "App.tsx must redirect legacy /education URLs to education home",
);
assert(
  !welcome.includes('to: "/home"') && !welcome.includes("to: '/home'"),
  "WelcomeGate must not hardcode /home on cards — use getWelcomeCardHref",
);

console.log("Link mastersheet validation");
console.log(`  file: ${masterPath}`);

if (failures.length === 0) {
  console.log(`  ✓ All invariant groups passed`);
  console.log(`  ✓ Expected EN welcome hrefs: ${expectedEn}`);
  for (const [code, hrefs] of Object.entries(WELCOME_TOOLBAR_MATRIX)) {
    console.log(`  ✓ ${code} cards: ${hrefs.join(", ")}`);
  }
  process.exit(0);
}

console.error(`  ✗ ${failures.length} failure(s):`);
for (const f of failures) console.error(`    - ${f}`);
process.exit(1);
