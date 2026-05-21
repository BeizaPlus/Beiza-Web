/**
 * Record area smoke + screenshots (Central Framing hero).
 * Usage: SMOKE_SITE_URL=http://127.0.0.1:8080 node scripts/capture-record-area-smoke.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080";
const stamp = new Date().toISOString().slice(0, 10);
const outDir = path.join(root, "docs", "progress-snapshots", `record-area-${stamp}`);
const imagePath = "/images/beiza-legacy-record-tab-landscape.png";
const africaImagePath = "/images/beiza-legacy-record-africa.png";

fs.mkdirSync(outDir, { recursive: true });

const results = { passed: [], failed: [] };

function pass(msg) {
  results.passed.push(msg);
  console.log(`  ✓ ${msg}`);
}

function fail(msg, detail = "") {
  const line = detail ? `${msg}: ${detail}` : msg;
  results.failed.push(line);
  console.log(`  ✗ ${line}`);
}

async function main() {
  console.log(`Record area smoke — ${base}`);
  console.log(`Screenshots → ${outDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const imgRes = await page.goto(`${base}${imagePath}`);
  if (imgRes?.ok()) pass(`Asset ${imagePath} returns ${imgRes.status()}`);
  else fail(`Asset ${imagePath}`, String(imgRes?.status()));

  await page.screenshot({
    path: path.join(outDir, "01-asset-direct.png"),
    fullPage: false,
  });

  await page.goto(`${base}/legacy/record`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const siteNav = page.getByRole("link", { name: "Legacy" });
  if ((await siteNav.count()) > 0) pass("Site Navigation (same chrome as Heritage)");
  else fail("Site Navigation missing");

  const tabIcons = page.locator('nav[aria-label="Legacy"] svg');
  if ((await tabIcons.count()) >= 5) pass(`Legacy tab bar SVG icons (${await tabIcons.count()})`);
  else fail("Legacy tab bar icons", `found ${await tabIcons.count()} svgs`);

  const heroEyebrow = page.getByText("Beiza Legacy · Record");
  if ((await heroEyebrow.count()) > 0) pass("Heritage-style record hero copy");
  else fail("Heritage-style record hero copy missing");

  const heroSignIn = page.getByRole("button", { name: /Sign in to record/i });
  if ((await heroSignIn.count()) > 0) pass("Sign-in CTA in hero (not duplicate card below)");
  else fail("Hero sign-in CTA missing");

  const heroImg = page.locator('.record-station-viewport img[src*="beiza-legacy-record"]');
  await heroImg.first().waitFor({ timeout: 15_000 });

  const loaded = await heroImg.first().evaluate((img) => {
    const el = img;
    return {
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      src: el.currentSrc || el.getAttribute("src"),
    };
  });

  if (loaded.complete && loaded.naturalWidth > 0) {
    pass(`Hero image loaded (${loaded.naturalWidth}×${loaded.naturalHeight})`);
  } else fail("Hero image failed to load", JSON.stringify(loaded));

  const box = await heroImg.first().boundingBox();
  if (box && box.width > 100 && box.height > 50) pass(`Hero visible in layout (${Math.round(box.width)}×${Math.round(box.height)}px)`);
  else fail("Hero not visible", box ? `${box.width}×${box.height}` : "no box");

  const avgBrightness = await heroImg.first().evaluate((img) => {
    const canvas = document.createElement("canvas");
    const w = 48;
    const h = 48;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const sw = img.naturalWidth * 0.35;
    const sh = img.naturalHeight * 0.35;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    return sum / (data.length / 4);
  });

  if (avgBrightness > 18) pass(`Hero center visible (luminance ${avgBrightness.toFixed(0)}/255)`);
  else fail("Hero appears black/empty", `luminance ${avgBrightness.toFixed(0)}`);

  await page.screenshot({
    path: path.join(outDir, "02-legacy-record-full.png"),
    fullPage: true,
  });

  const heroHandle = await heroImg.first().elementHandle();
  if (heroHandle) {
    await heroHandle.screenshot({ path: path.join(outDir, "03-record-hero-crop.png") });
    pass("Saved hero crop screenshot");
  }

  const recordNav = page.locator('nav[aria-label="Legacy"] a[href="/legacy/record"] img');
  if ((await recordNav.count()) > 0) {
    await recordNav.first().screenshot({ path: path.join(outDir, "04-record-tab-icon.png") });
    pass("Saved Record tab thumbnail");
  }

  const africaRes = await page.goto(`${base}${africaImagePath}`);
  if (africaRes?.ok()) pass(`Ghana asset ${africaImagePath} returns ${africaRes.status()}`);
  else fail(`Ghana asset ${africaImagePath}`, String(africaRes?.status()));

  await context.addInitScript(() => {
    localStorage.setItem("beiza-locale", "africa");
    localStorage.setItem("beiza-locale-pinned", "1");
  });
  const ghPage = await context.newPage();
  await ghPage.goto(`${base}/legacy/record`, { waitUntil: "networkidle" });
  await ghPage.waitForTimeout(1200);
  const ghHero = ghPage.locator('.record-station-viewport img[src*="beiza-legacy-record-africa"]');
  if ((await ghHero.count()) > 0) {
    pass("Ghana locale shows Marmah record hero");
    await ghPage.screenshot({ path: path.join(outDir, "05-legacy-record-ghana.png"), fullPage: true });
  } else fail("Ghana locale hero", "expected beiza-legacy-record-africa.png");

  await context.close();
  await browser.close();

  console.log("\n=== Summary ===");
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  if (results.failed.length) {
    for (const f of results.failed) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log(`\nScreenshots saved under:\n  ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
