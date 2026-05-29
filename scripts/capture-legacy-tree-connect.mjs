/**
 * Screenshot: drag-connect two nodes on /legacy/circle (studio preview on localhost).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const stamp = process.env.SMOKE_OUT_DIR ?? "verification-screenshots";
const outDir = path.join(root, "docs", stamp, "tree-connect");

const base = process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080";

async function dragConnect(page) {
  const nodes = page.locator(
    ".react-flow__node-person, .react-flow__node-circlePerson, .react-flow__node-squarePerson",
  );
  await nodes.first().waitFor({ state: "visible", timeout: 20000 });
  const count = await nodes.count();
  if (count < 2) throw new Error(`Expected 2 person nodes, found ${count}`);

  const firstBox = await nodes.nth(0).boundingBox();
  const secondBox = await nodes.nth(1).boundingBox();
  if (!firstBox || !secondBox) throw new Error("Could not locate person nodes");

  const dx = secondBox.x + secondBox.width / 2 - (firstBox.x + firstBox.width / 2);
  const dy = secondBox.y + secondBox.height / 2 - (firstBox.y + firstBox.height / 2);
  const sourceHandleId = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? "right" : "left") : dy >= 0 ? "bottom" : "top";
  const targetHandleId =
    sourceHandleId === "right"
      ? "left"
      : sourceHandleId === "left"
        ? "right"
        : sourceHandleId === "bottom"
          ? "top"
          : "bottom";

  await nodes.nth(0).hover();
  const sourceHandle = nodes.nth(0).locator(`.family-tree-handle[data-handleid="${sourceHandleId}"]`);
  const targetHandle = nodes.nth(1).locator(`.family-tree-handle[data-handleid="${targetHandleId}"]`);
  await sourceHandle.waitFor({ state: "visible", timeout: 5000 });
  const sourceBox = await sourceHandle.boundingBox();
  const targetBox = await targetHandle.boundingBox();
  if (!sourceBox || !targetBox) throw new Error("Could not locate connection handles");

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 28,
  });
  await page.mouse.up();
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const shot = async (name) => {
    const file = path.join(outDir, name);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`  ✓ ${name}`);
    return file;
  };

  await page.goto(`${base}/legacy/circle`, { waitUntil: "networkidle" });
  await page.waitForSelector(".react-flow", { timeout: 30000 });
  await page.waitForTimeout(3500);
  await shot("01-tree-before-connect.png");

  await dragConnect(page);
  await page.waitForSelector('text=How are these people related?', { timeout: 10000 });
  await page.waitForTimeout(400);
  await shot("02-relationship-picker.png");

  await page.locator('button:has-text("Sibling of")').first().click();
  await page.locator('button:has-text("Confirm")').click();
  await page.waitForSelector('text=Connection saved', { timeout: 10000 });
  await page.waitForTimeout(2200);
  const connectedShot = await shot("03-tree-connected-success.png");

  await browser.close();
  console.log(`\nDone → ${outDir}`);
  console.log(connectedShot);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
