import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("docs/verification-screenshots/locale-switches");
const BASE = process.env.BASE_URL ?? "https://www.beizaplus.com";

const PILLS = [
  { id: "global", label: "Global", file: "01-global.png" },
  { id: "ghana", label: "Ghana · Twi", file: "02-ghana-twi.png" },
  { id: "spanish", label: "Spanish", file: "03-spanish.png" },
  { id: "french", label: "French", file: "04-french.png" },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
})).newPage();

await page.goto(`${BASE}/home?studio=0`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.locator("#locale-rail").waitFor({ state: "visible", timeout: 60000 });
await page.waitForTimeout(1000);

for (const pill of PILLS) {
  const btn = page.getByRole("button", { name: new RegExp(pill.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ force: true });
  await page.waitForTimeout(600);

  const state = await page.evaluate((label) => {
    const sub = document.querySelector("#hero p");
    const active = document.querySelector("#locale-rail button[aria-pressed='true']");
    return {
      activeLabel: active?.textContent?.trim(),
      heroSubheading: sub?.textContent?.trim()?.slice(0, 120),
    };
  }, pill.label);

  const file = path.join(OUT, pill.file);
  await page.locator("#hero").screenshot({ path: file });
  console.log(pill.file, state);
}

await page.screenshot({
  path: path.join(OUT, "05-full-page-all-locales-bar.png"),
  fullPage: false,
});

await browser.close();
console.log("done", OUT);
