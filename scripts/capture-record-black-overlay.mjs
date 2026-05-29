/**
 * Capture /legacy/record over 10s — detect black overlay regression.
 * Usage: node scripts/capture-record-black-overlay.mjs [url]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] ?? process.env.SMOKE_SITE_URL ?? "https://www.beizaplus.com";
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = path.join(root, "docs", "verification-screenshots", "record-black-overlay", stamp);

fs.mkdirSync(outDir, { recursive: true });

async function sampleViewport(page) {
  return page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { avg: 0, heroAvg: 0, hasOverlay: false, heroLoaded: false };

    const points = [
      [w * 0.5, h * 0.5],
      [w * 0.25, h * 0.4],
      [w * 0.75, h * 0.35],
    ];
    let sum = 0;
    let n = 0;
    for (const [x, y] of points) {
      const el = document.elementFromPoint(x, y);
      if (!el) continue;
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        sum += (+m[1] + +m[2] + +m[3]) / 3;
        n++;
      }
    }

    const hero = document.querySelector(".record-station-viewport img");
    let heroAvg = 0;
    let heroLoaded = false;
    if (hero instanceof HTMLImageElement && hero.complete && hero.naturalWidth > 0) {
      heroLoaded = true;
      const c2 = document.createElement("canvas");
      c2.width = 32;
      c2.height = 32;
      const cx = c2.getContext("2d");
      if (cx) {
        const sw = hero.naturalWidth * 0.4;
        const sh = hero.naturalHeight * 0.4;
        const sx = (hero.naturalWidth - sw) / 2;
        const sy = (hero.naturalHeight - sh) / 2;
        cx.drawImage(hero, sx, sy, sw, sh, 0, 0, 32, 32);
        const data = cx.getImageData(0, 0, 32, 32).data;
        let hs = 0;
        for (let i = 0; i < data.length; i += 4) hs += (data[i] + data[i + 1] + data[i + 2]) / 3;
        heroAvg = hs / (data.length / 4);
      }
    }

    const overlay = document.querySelector(".record-viewport-overlay");
    const topEl = document.elementFromPoint(w * 0.5, h * 0.45);
    const topClass = topEl?.className?.toString?.().slice(0, 80) ?? topEl?.tagName ?? "?";

    return {
      avg: n ? sum / n : 0,
      heroAvg,
      heroLoaded,
      hasOverlay: Boolean(overlay),
      topClass,
      eyebrow: Boolean(document.body.textContent?.includes("Beiza Legacy · Record")),
      signIn: Boolean(document.querySelector('button[type="submit"]')),
    };
  });
}

async function main() {
  console.log(`Record black-overlay probe — ${base}/legacy/record`);
  console.log(`Output → ${outDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${base}/legacy/record`, { waitUntil: "domcontentloaded" });

  const timeline = [0, 500, 1000, 2000, 3000, 5000, 10000];
  const log = [];
  let lastMs = 0;

  for (const ms of timeline) {
    if (ms > lastMs) await page.waitForTimeout(ms - lastMs);
    lastMs = ms;
    const sample = await sampleViewport(page);
    const tag = String(ms).padStart(5, "0");
    const shot = path.join(outDir, `t-${tag}ms.png`);
    await page.screenshot({ path: shot, fullPage: false });
    const row = { ms, ...sample, shot: path.basename(shot) };
    log.push(row);
    console.log(
      `t=${(ms / 1000).toFixed(1)}s viewport≈${sample.avg.toFixed(0)} hero≈${sample.heroAvg.toFixed(0)} loaded=${sample.heroLoaded} overlay=${sample.hasOverlay} top=${sample.topClass}`,
    );
  }

  fs.writeFileSync(path.join(outDir, "timeline.json"), JSON.stringify(log, null, 2));

  const t0 = log[0];
  const t10 = log[log.length - 1];
  const regressed =
    t0.heroAvg > 25 &&
    (t10.heroAvg < 15 || (t10.hasOverlay && !t0.hasOverlay));

  console.log("\n=== Verdict ===");
  if (regressed) {
    console.log("FAIL: Hero darkened or overlay appeared after load.");
    process.exit(1);
  }
  if (!t10.heroLoaded || t10.heroAvg < 18) {
    console.log("FAIL: Hero not visible at 10s.");
    process.exit(1);
  }
  console.log("PASS: Hero stays visible through 10s.");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
