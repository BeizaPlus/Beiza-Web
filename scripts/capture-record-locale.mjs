import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("docs/verification-screenshots/record-locale");
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8084";

const LOCALES = [
  { locale: "black-american", file: "01-global-studio-hero.png", label: "Global" },
  { locale: "africa", file: "02-ghana-marmah-hero.png", label: "Ghana · Twi" },
  { locale: "latina", file: "03-spanish-studio-hero.png", label: "Spanish" },
  { locale: "fr", file: "04-french-hero.png", label: "French" },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const row of LOCALES) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  });
  await context.addInitScript(({ locale }) => {
    localStorage.setItem("beiza-locale", locale);
    localStorage.setItem("beiza-locale-pinned", "1");
  }, { locale: row.locale });

  const page = await context.newPage();
  await page.goto(`${BASE}/legacy/record`, {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForTimeout(2000);

  const meta = await page.evaluate(() => {
    const img = document.querySelector(".record-station-viewport img");
    const h1 = document.querySelector(".record-station-viewport h1");
    return {
      heroSrc: img?.getAttribute("src")?.split("/").pop(),
      heading: h1?.textContent?.trim(),
      locale: localStorage.getItem("beiza-locale"),
    };
  });

  const file = path.join(OUT, row.file);
  await page.locator(".record-station-viewport").screenshot({ path: file });
  console.log(row.file, row.label, meta);

  await context.close();
}

await browser.close();
console.log("done", OUT);
