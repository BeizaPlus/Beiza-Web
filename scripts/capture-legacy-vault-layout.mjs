/**
 * Screenshot: /legacy/vault two-column layout (book left, stories right).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "docs", "verification-screenshots", "legacy-vault");
const outFile = path.join(outDir, "02-vault-recordings-scroll.png");

const base = process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8083";

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(`${base}/legacy/vault`, { waitUntil: "networkidle" });
  await page.getByText(/Open stories/i).waitFor({ timeout: 30000 });
  await page.waitForTimeout(2500);

  const scroll = page.locator(".vault-recordings-scroll");
  await scroll.evaluate((el) => {
    el.scrollTop = 120;
  });
  await page.waitForTimeout(400);

  await page.screenshot({ path: outFile, fullPage: false });

  await browser.close();
  console.log(outFile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
