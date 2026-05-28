import { chromium } from "playwright";
import path from "node:path";

const OUT = path.resolve("docs/verification-screenshots/legacy-pages/03-legacy-vault-book-figure.png");
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8084";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(`${BASE}/legacy/vault?studio=0`, { waitUntil: "networkidle", timeout: 90000 });
const book = page.locator('img[src*="beiza-legacy-vault-book"]');
await book.waitFor({ state: "visible", timeout: 30000 });
await book.scrollIntoViewIfNeeded();
await page.locator("figure:has(img[src*='beiza-legacy-vault-book'])").screenshot({ path: OUT });
console.log("wrote", OUT);
await browser.close();
