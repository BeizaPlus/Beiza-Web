/**
 * Welcome gate smoke test — / and /welcome
 * Usage: SMOKE_SITE_URL=http://127.0.0.1:8080 node scripts/welcome-smoke-test.mjs
 */
import { chromium } from "playwright";

const base = process.env.SMOKE_SITE_URL ?? "http://localhost:8080";
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

async function waitForWelcomeReady(page, route) {
  const path = route.includes("?") ? route : `${route}?studio=0`;
  await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
  await page.getByRole("listbox", { name: "Region & language" }).waitFor({ timeout: 20_000 });
  await page.getByText(/Where would you like to begin/i).waitFor({ timeout: 10_000 });
  await page.getByRole("heading", { name: "Learn your culture" }).waitFor({ state: "visible", timeout: 10_000 });
}

async function auditWelcome(page, route) {
  console.log(`\n--- ${route} ---\n`);
  await waitForWelcomeReady(page, route);

  const cardCopy = await page.locator("[data-welcome-path] h2, [data-welcome-path] p").allTextContents();
  const cardText = cardCopy.join(" ");
  if (cardText.includes("—")) fail(`${route} no em-dashes in card copy`);
  else pass(`${route} no em-dashes in card copy`);

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

  const logo = page.locator(
    'a[aria-label="Beiza welcome"], img[alt="Beiza"], img[src*="Beiza_White"], img[src*="beiza-mascot"]',
  );
  if ((await logo.count()) > 0) pass(`${route} Beiza logo or mascot`);
  else fail(`${route} logo missing`);

  const cards = page.locator("[data-welcome-path] a").filter({ has: page.locator("h2") });
  const hrefs = await cards.evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  if (hrefs.length >= 3 && hrefs.every((h) => h && h.length > 0)) {
    pass(`${route} three path links (${hrefs.join(", ")})`);
  } else fail(`${route} path links`, hrefs.join(" | "));

  if ((await page.getByRole("listbox", { name: "Region & language" }).count()) > 0) {
    pass(`${route} vertical language rail`);
  } else fail(`${route} locale rail missing`);

  if ((await page.locator("#welcome-region-hint").count()) === 0) {
    pass(`${route} region hint copy removed`);
  } else fail(`${route} region hint should be removed`);

  const expectedGh = "/home,/legacy/record,/af/farewell";
  if (hrefs.join(",") === expectedGh) pass(`${route} GH default card hrefs (${expectedGh})`);
  else fail(`${route} GH default card hrefs`, hrefs.join(" | "));

  const count = await cards.count();
  if (count === 3) pass(`${route} three path cards`);
  else fail(`${route} card count`, String(count));

  const iconCount = await page.locator("[data-welcome-path] a span.rounded-full:has(svg)").count();
  if (iconCount >= 3) pass(`${route} icon circles present (${iconCount})`);
  else warn(`${route} icon circles`, `found ${iconCount} (ok if showIconCircleBg is off)`);

  const pageScroll = await page.evaluate(() => ({
    welcomeRoute: document.documentElement.classList.contains("welcome-route"),
    bodyOverflow: document.body.style.overflow,
  }));
  if (pageScroll.welcomeRoute && pageScroll.bodyOverflow === "hidden") {
    pass(`${route} one viewport (no page scroll)`);
  } else fail(`${route} viewport lock`, JSON.stringify(pageScroll));

  const grid = page.locator(".welcome-cards-row");
  const box = await grid.boundingBox();
  if (box && box.width > 200) pass(`${route} three-card grid (${Math.round(box.width)}px)`);
  else fail(`${route} card grid`, box ? `width ${box.width}` : "missing");

  if ((await cards.nth(1).locator("img").count()) > 0) pass(`${route} Legacy card has photo`);
  else fail(`${route} Legacy card photo missing`);

  const themeToggle = page.getByRole("button", {
    name: /Switch to (dark|light) background|light mode|dark mode/i,
  });
  if ((await themeToggle.count()) > 0) pass(`${route} theme toggle`);
  else fail(`${route} theme toggle missing`);
}

/** Click locale on vertical rail (label button or dot-only option). */
async function selectWelcomeLocale(page, labelPattern) {
  const option = page.getByRole("option", { name: labelPattern }).first();
  await option.click();
  await page.waitForTimeout(450);
}

async function auditWelcomeLocales(page, route) {
  const cards = page.locator("[data-welcome-path] a").filter({ has: page.locator("h2") });

  await selectWelcomeLocale(page, /EN — English/i);
  const enHrefs = await cards.evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  const expectedEn = "/home,/legacy/record,/farewell";
  if (enHrefs.join(",") === expectedEn) pass(`${route} EN card hrefs (${expectedEn})`);
  else fail(`${route} EN card hrefs`, enHrefs.join(" | "));

  const enTitles = await cards.locator("h2").allTextContents();
  const enOrder = ["Learn your culture", "Preserve a life story", "Craft a memorial"];
  if (enTitles.join("|") === enOrder.join("|")) pass(`${route} EN card order`);
  else fail(`${route} EN card order`, enTitles.join(" | "));

  await selectWelcomeLocale(page, /ES — Spanish/i);
  if ((await page.getByRole("heading", { name: /Preserva una vida/i }).count()) > 0) {
    pass(`${route} ES toggle switches language`);
  } else fail(`${route} ES toggle language`, "Spanish heading not found");

  await selectWelcomeLocale(page, /GH — Ghana/i);
  const ghHrefs = await cards.evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  const expectedGh = "/home,/legacy/record,/af/farewell";
  if (ghHrefs.join(",") === expectedGh) pass(`${route} GH card hrefs after switch (${expectedGh})`);
  else fail(`${route} GH card hrefs after switch`, ghHrefs.join(" | "));
}

async function main() {
  console.log("Welcome gate smoke test");
  console.log(`Site: ${base}\n`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.addInitScript(() => {
      localStorage.setItem("beiza-locale", "africa");
      localStorage.setItem("beiza-locale-pinned", "1");
    });
    const page = await context.newPage();

    for (const route of ["/", "/welcome"]) {
      try {
        await auditWelcome(page, route);
        await auditWelcomeLocales(page, route);
      } catch (e) {
        fail(`${route} page load`, e.message);
      }
    }

    await context.close();
  } catch (e) {
    fail("playwright launch", e.message);
    console.error("\nTip: npm run dev, then SMOKE_SITE_URL=http://127.0.0.1:8080 node scripts/welcome-smoke-test.mjs");
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
