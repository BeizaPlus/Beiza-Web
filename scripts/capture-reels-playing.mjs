import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("docs/verification-screenshots/reels-playing");
const BASE = process.env.BASE_URL ?? "https://www.beizaplus.com";
const WAIT_MS = 5000;

/** Tap play on episode by index (0 = first visible). */
const EPISODES = [
  { index: 0, file: "01-episode-1-dancing-plague-playing.png" },
  { index: 2, file: "02-episode-3-marathon-playing.png" },
  { index: 4, file: "03-episode-5-ice-age-playing.png" },
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
  const playBtn = page.locator("#cultural-films button[aria-label^='Play']").nth(ep.index);
  await playBtn.scrollIntoViewIfNeeded();
  await playBtn.click();
  await page.waitForTimeout(800);

  const video = page.locator("#cultural-films video");
  await video.waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(WAIT_MS);

  const state = await page.evaluate(() => {
    const v = document.querySelector("#cultural-films video");
    if (!v) return null;
    return {
      paused: v.paused,
      currentTime: v.currentTime,
      readyState: v.readyState,
      width: v.videoWidth,
    };
  });

  const card = page.locator("#cultural-films article").filter({ has: page.locator("video") });
  await card.first().screenshot({ path: path.join(OUT, ep.file) });
  console.log(ep.file, state);
}

await browser.close();
console.log("done", OUT);
