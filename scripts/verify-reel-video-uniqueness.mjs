/**
 * Play several reels and confirm each loads a distinct video URL + duration.
 */
import { chromium } from "playwright";
import reels from "../src/data/chloe-vs-history-reels.json" with { type: "json" };

const BASE = process.env.BASE_URL ?? "http://localhost:8085";
const INDICES = [0, 2, 4, 7, 8];

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

await page.goto(`${BASE}/home?studio=0`, { waitUntil: "networkidle", timeout: 90000 });
await page.locator("#cultural-films").scrollIntoViewIfNeeded();

const seen = new Map();

for (const idx of INDICES) {
  const reel = reels[idx];
  const playBtn = page.locator(`#cultural-films button[data-reel-play="${reel.shortCode}"]`);
  await playBtn.scrollIntoViewIfNeeded();
  await playBtn.click();
  await page.waitForTimeout(2000);

  const info = await page.evaluate((shortCode) => {
    const v = document.querySelector(`#cultural-films article[data-reel-id="${shortCode}"] video`);
    if (!v) return null;
    return {
      src: v.currentSrc,
      duration: v.duration,
      currentTime: v.currentTime,
      videoWidth: v.videoWidth,
      title: v.closest("article")?.querySelector(".font-manrope.text-lg")?.textContent?.trim(),
    };
  }, reel.shortCode);
  console.log(`\n[${idx}] ${reel.shortCode} — ${reel.caption.slice(0, 50)}`);
  console.log("  video:", info);

  if (info?.src) {
    const prev = seen.get(info.src);
    if (prev !== undefined) {
      console.log(`  DUPLICATE SRC with index ${prev}!`);
    }
    seen.set(info.src, idx);
  }
}

await browser.close();
