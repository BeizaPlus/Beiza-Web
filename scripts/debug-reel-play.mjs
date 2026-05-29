import { chromium } from "playwright";

const code = process.argv[2] ?? "DV4BMjpjuFr";
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("http://localhost:8085/home?studio=0", { waitUntil: "networkidle", timeout: 90000 });
await page.locator("#cultural-films").scrollIntoViewIfNeeded();
await page.locator(`#cultural-films button[data-reel-play="${code}"]`).scrollIntoViewIfNeeded();
await page.evaluate((shortCode) => {
  document.querySelector(`#cultural-films button[data-reel-play="${shortCode}"]`)?.click();
}, code);
await page.waitForTimeout(2500);
const info = await page.evaluate((shortCode) => {
  const art = document.querySelector(`#cultural-films article[data-reel-id="${shortCode}"]`);
  const v = art?.querySelector("video");
  return {
    hasArt: Boolean(art),
    hasVideo: Boolean(v),
    readyState: v?.readyState,
    src: v?.currentSrc?.slice(0, 100),
    title: art?.querySelector(".font-manrope.text-lg")?.textContent?.trim(),
  };
}, code);
console.log(code, info);
await browser.close();
