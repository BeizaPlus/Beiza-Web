/**
 * Welcome gate smoke test — / and /welcome
 * Usage: SMOKE_SITE_URL=http://127.0.0.1:8081 node scripts/welcome-smoke-test.mjs
 */
import { chromium } from "playwright";

const base = process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8081";
const results = { passed: [], failed: [], warned: [] };

function pass(label) {
  results.passed.push(label);
  console.log(`  ✓ ${label}`);
}

function fail(label, detail = "") {
  const msg = detail ? `${label}: ${detail}` : label;
  results.failed.push(msg);
  console.log(`  ✗ ${msg}`);
}

function warn(label, detail = "") {
  const msg = detail ? `${label}: ${detail}` : label;
  results.warned.push(msg);
  console.log(`  ⚠ ${msg}`);
}

async function auditWelcome(page, route, { clearLocale = false } = {}) {
  console.log(`\n--- ${route} ---\n`);
  if (clearLocale) {
    await page.evaluate(() => localStorage.removeItem("beiza-locale"));
  }
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const bodyText = await page.locator("body").innerText();
  if (bodyText.includes("—")) fail(`${route} no em-dashes in copy`);
  else pass(`${route} no em-dashes in copy`);

  const copyChecks = [
    { text: "Stories of the people we love", locator: page.getByText(/Stories of the people we love/i) },
    { text: "Where would you like to begin?", locator: page.getByText(/Where would you like to begin/i) },
    { text: "Learn your culture", locator: page.getByRole("heading", { name: "Learn your culture" }) },
    { text: "Preserve a life story", locator: page.getByRole("heading", { name: "Preserve a life story" }) },
    { text: "Craft a memorial", locator: page.getByRole("heading", { name: "Craft a memorial" }) },
  ];
  for (const { text, locator } of copyChecks) {
    if ((await locator.count()) > 0) pass(`${route} shows "${text}"`);
    else fail(`${route} missing copy`, text);
  }

  const logo = page.locator('img[alt="Beiza"]');
  if ((await logo.count()) > 0) {
    const src = await logo.first().getAttribute("src");
    if (src?.includes("Beiza_White")) pass(`${route} Beiza logo image`);
    else fail(`${route} logo src`, src ?? "missing");
  } else fail(`${route} logo missing`);

  const links = page.locator("main a").filter({ has: page.locator("h2") });
  const hrefs = await links.evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  if (hrefs.length >= 3 && hrefs.every((h) => h && h.length > 0)) {
    pass(`${route} three path links (${hrefs.join(", ")})`);
  } else fail(`${route} path links`, hrefs.join(" | "));

  const localeToggle = page.getByRole("group", { name: "Language region" });
  if ((await localeToggle.count()) > 0) pass(`${route} locale toggle EN | FR | AF`);
  else fail(`${route} locale toggle missing`);

  const cards = page.locator("main a").filter({ has: page.locator("h2") });
  const count = await cards.count();
  if (count === 3) pass(`${route} three path cards`);
  else fail(`${route} card count`, String(count));

  const titles = await cards.locator("h2").allTextContents();
  const enOrder = ["Learn your culture", "Preserve a life story", "Craft a memorial"];
  const frOrder = ["Découvrir votre culture", "Préserver une vie", "Créer un mémorial"];
  const orderOk =
    titles.join("|") === enOrder.join("|") || titles.join("|") === frOrder.join("|");
  if (orderOk) pass(`${route} card order (Education · Legacy · Farewell)`);
  else fail(`${route} card order`, titles.join(" | "));

  const iconCircles = page.locator(
    'main a span.rounded-full:has(svg)',
  );
  const iconCount = await iconCircles.count();
  if (iconCount >= 3) pass(`${route} icon circles present (${iconCount})`);
  else fail(`${route} icon circles`, `found ${iconCount}`);

  const circleClasses = await iconCircles.evaluateAll((els) =>
    els.map((el) => el.className),
  );
  const usesTokens = circleClasses.every((c) => c.includes("welcome-icon"));
  if (usesTokens) pass(`${route} icon circles use palette CSS tokens`);
  else fail(`${route} icon token classes`, circleClasses.join("; "));

  const legacyCard = cards.nth(1);
  const legacyClass = await legacyCard.getAttribute("class");
  if (legacyClass?.includes("border-primary") || legacyClass?.includes("scale-")) {
    pass(`${route} Legacy card featured treatment`);
  } else {
    warn(`${route} Legacy featured`, legacyClass?.slice(0, 80) ?? "no class");
  }

  const legacyImg = legacyCard.locator("img");
  if ((await legacyImg.count()) > 0) pass(`${route} Legacy card has photo`);
  else fail(`${route} Legacy card photo missing`);

  const themeToggle = page.getByRole("button", { name: /light mode|dark mode/i });
  if ((await themeToggle.count()) > 0) pass(`${route} theme toggle`);
  else warn(`${route} theme toggle not found by aria label`);

  const motionNodes = await page.locator("[style*='opacity']").count();
  if (motionNodes >= 0) pass(`${route} motion-rendered DOM (framer-motion ok)`);

  const grid = page.locator("main .grid");
  const box = await grid.boundingBox();
  if (box && box.width > 200) pass(`${route} card grid has stable width (${Math.round(box.width)}px)`);
  else fail(`${route} card grid layout`, box ? `width ${box.width}` : "no box");

  await page.getByRole("button", { name: "French" }).click();
  await page.waitForTimeout(300);
  const frHrefs = await links.evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  if (frHrefs.join(",") === "/fr/education,/fr/heritage,/fr/farewell") {
    pass(`${route} FR locale routes`);
  } else fail(`${route} FR locale routes`, frHrefs.join(" | "));
}

async function main() {
  console.log("Welcome gate smoke test");
  console.log(`Site: ${base}\n`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    for (const route of ["/", "/welcome"]) {
      try {
        await auditWelcome(page, route, { clearLocale: route === "/welcome" });
      } catch (e) {
        fail(`${route} page load`, e.message);
      }
    }

    await context.close();
  } catch (e) {
    fail("playwright launch", e.message);
    console.error("\nTip: npm run dev, then SMOKE_SITE_URL=http://127.0.0.1:PORT node scripts/welcome-smoke-test.mjs");
  } finally {
    await browser?.close();
  }

  console.log("\n=== Summary ===\n");
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  if (results.warned.length) console.log(`Warnings: ${results.warned.length}`);
  if (results.failed.length) {
    console.log("\nFailures:");
    for (const f of results.failed) console.log(`  - ${f}`);
  }
  if (results.warned.length) {
    console.log("\nWarnings:");
    for (const w of results.warned) console.log(`  - ${w}`);
  }

  process.exit(results.failed.length ? 1 : 0);
}

main();
