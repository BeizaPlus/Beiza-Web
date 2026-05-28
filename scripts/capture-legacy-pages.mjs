import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("docs/verification-screenshots/legacy-pages");
const BASE = process.env.BASE_URL ?? "https://www.beizaplus.com";

const PAGES = [
  { path: "/legacy/record", file: "01-legacy-record.png", label: "Record station" },
  { path: "/legacy", file: "02-legacy-home.png", label: "Legacy home" },
  { path: "/legacy/vault", file: "03-legacy-vault-book.png", label: "Legacy vault book" },
  { path: "/legacy/circle", file: "04-legacy-circle.png", label: "Legacy circle" },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
await context.addInitScript(() => {
  localStorage.setItem("beiza-locale", "africa");
  localStorage.setItem("beiza-locale-pinned", "1");
});

const page = await context.newPage();

for (const row of PAGES) {
  await page.goto(`${BASE}${row.path}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(2000);
  const file = path.join(OUT, row.file);
  await page.screenshot({ path: file, fullPage: false });
  const title = await page.title();
  console.log("wrote", row.file, row.label, title);
}

await browser.close();
console.log("done", OUT);
