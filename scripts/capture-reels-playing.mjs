import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("docs/verification-screenshots/reels-playing");
const BASE = process.env.BASE_URL ?? "https://www.beizaplus.com";
const WAIT_MS = 5000;

/** Tap play on episode by Instagram short code. */
const EPISODES = [
  { shortCode: "DV4BMjpjuFr", file: "01-dancing-plague-playing.png" },
  { shortCode: "DX4pN1wOgAy", file: "02-marathon-playing.png" },
  { shortCode: "DVli3L3iMht", file: "03-ice-age-playing.png" },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
})).newPage();

await page.goto(`${BASE}/home?studio=0`, { waitUntil: "networkidle", timeout: 90000 });
await page.locator("#cultural-films").scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

for (const ep of EPISODES) {
  const playBtn = page.locator(`#cultural-films button[data-reel-play="${ep.shortCode}"]`);
  await playBtn.scrollIntoViewIfNeeded();
  await playBtn.click();
  await page.waitForTimeout(800);

  const video = page.locator(`#cultural-films article[data-reel-id="${ep.shortCode}"] video`);
  await video.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(WAIT_MS);

  const state = await page.evaluate((shortCode) => {
    const v = document.querySelector(`#cultural-films article[data-reel-id="${shortCode}"] video`);
    if (!v) return null;
    return {
      paused: v.paused,
      currentTime: v.currentTime,
      readyState: v.readyState,
      width: v.videoWidth,
      title: v.closest("article")?.querySelector(".font-manrope.text-lg")?.textContent?.trim(),
    };
  }, ep.shortCode);

  const card = page.locator(`#cultural-films article[data-reel-id="${ep.shortCode}"]`);
  await card.screenshot({ path: path.join(OUT, ep.file) });
  console.log(ep.file, state);
}

await browser.close();
console.log("done", OUT);
