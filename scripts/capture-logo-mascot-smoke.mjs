/**
 * Logo / mascot → /welcome smoke with screenshots.
 *
 * Usage:
 *   npm run dev
 *   node scripts/capture-logo-mascot-smoke.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const stamp = process.env.SMOKE_OUT_DIR ?? new Date().toISOString().slice(0, 10);
const outDir = path.join(root, "docs", "progress-snapshots", `logo-mascot-smoke-${stamp}`);
const base = (process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");
const WELCOME = "/welcome";

const PAGES_WITH_HEADER_LOGO = [
  { path: "/home", label: "Education home" },
  { path: "/legacy/record", label: "Legacy record" },
  { path: "/legacy/vault", label: "Legacy vault" },
  { path: "/legacy/circle", label: "Legacy circle" },
  { path: "/legacy/family", label: "Legacy family" },
  { path: "/heritage", label: "Heritage landing" },
  { path: "/farewell", label: "Farewell" },
  { path: "/pricing", label: "Pricing" },
  { path: "/contact", label: "Contact" },
  { path: "/blog", label: "Blog" },
  { path: "/events", label: "Events" },
  { path: "/circle", label: "Circle directory" },
];

const results = [];

function slug(s) {
  return s.replace(/^\//, "").replace(/\//g, "-") || "root";
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`Logo/mascot smoke — ${base}`);
  console.log(`Output → ${outDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem("beiza-locale", "africa");
    localStorage.setItem("beiza-locale-pinned", "1");
    localStorage.setItem("beiza-welcome-theme", "dark");
    localStorage.setItem("beiza-layout-studio-master-open", "0");
  });

  const page = await context.newPage();

  for (const { path: routePath, label } of PAGES_WITH_HEADER_LOGO) {
    const entry = { path: routePath, label, ok: false, checks: [], screenshot: "" };
    try {
      await page.goto(`${base}${routePath}?studio=0`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(1000);

      const before = path.join(outDir, `${slug(routePath)}-before.png`);
      await page.screenshot({ path: before, fullPage: false });

      const logo = page.locator('a[aria-label="Beiza home"]').first();
      const logoCount = await logo.count();
      if (logoCount === 0) {
        entry.checks.push({ ok: false, msg: "No Beiza logo link (aria-label=Beiza home)" });
      } else {
        entry.checks.push({ ok: true, msg: "Logo link found in header" });
        const href = await logo.getAttribute("href");
        if (href === WELCOME || href === `${base}${WELCOME}`) {
          entry.checks.push({ ok: true, msg: `href → ${WELCOME}` });
        } else {
          entry.checks.push({ ok: false, msg: `href expected ${WELCOME}, got ${href}` });
        }
        await logo.click({ timeout: 10_000 });
        await page.waitForTimeout(1200);
        const finalPath = new URL(page.url()).pathname;
        if (finalPath === WELCOME) {
          entry.checks.push({ ok: true, msg: `Click navigates to ${WELCOME}` });
        } else {
          entry.checks.push({ ok: false, msg: `After click pathname is ${finalPath}, expected ${WELCOME}` });
        }
      }

      const after = path.join(outDir, `${slug(routePath)}-after-welcome.png`);
      await page.screenshot({ path: after, fullPage: false });
      entry.screenshot = `${slug(routePath)}-after-welcome.png`;
      entry.ok = entry.checks.every((c) => c.ok);
    } catch (e) {
      entry.checks.push({ ok: false, msg: e.message });
    }
    results.push(entry);
    console.log(`${entry.ok ? "✓" : "✗"} ${routePath} — ${label}`);
  }

  // Welcome gate center mascot
  {
    const entry = { path: "/welcome", label: "Welcome gate mascot", ok: false, checks: [], screenshot: "" };
    try {
      await page.goto(`${base}/welcome?studio=0`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(1000);
      const mascot = page.locator('a[aria-label="Beiza welcome"]').first();
      if ((await mascot.count()) === 0) {
        entry.checks.push({ ok: false, msg: "Welcome mascot link not found" });
      } else {
        entry.checks.push({ ok: true, msg: "Welcome mascot link found" });
        await mascot.click();
        await page.waitForTimeout(800);
        const finalPath = new URL(page.url()).pathname;
        if (finalPath === WELCOME) {
          entry.checks.push({ ok: true, msg: "Stays on /welcome after mascot click" });
        } else {
          entry.checks.push({ ok: false, msg: `Path after click: ${finalPath}` });
        }
      }
      entry.screenshot = "welcome-mascot.png";
      await page.screenshot({ path: path.join(outDir, entry.screenshot), fullPage: false });
      entry.ok = entry.checks.every((c) => c.ok);
    } catch (e) {
      entry.checks.push({ ok: false, msg: e.message });
    }
    results.push(entry);
    console.log(`${entry.ok ? "✓" : "✗"} /welcome — Welcome gate mascot`);
  }

  // Root redirect
  {
    const entry = { path: "/", label: "Root redirect", ok: false, checks: [], screenshot: "" };
    try {
      await page.goto(`${base}/?studio=0`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(800);
      const finalPath = new URL(page.url()).pathname;
      if (finalPath === WELCOME) {
        entry.checks.push({ ok: true, msg: `/ redirects to ${WELCOME}` });
        entry.ok = true;
      } else {
        entry.checks.push({ ok: false, msg: `Got ${finalPath}, expected ${WELCOME}` });
      }
      entry.screenshot = "root-redirect.png";
      await page.screenshot({ path: path.join(outDir, entry.screenshot), fullPage: false });
    } catch (e) {
      entry.checks.push({ ok: false, msg: e.message });
    }
    results.push(entry);
    console.log(`${entry.ok ? "✓" : "✗"} / — Root redirect`);
  }

  await context.close();
  await browser.close();

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>Logo/mascot smoke ${stamp}</title>
<style>
body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#eee;padding:24px}
.ok{color:#6ee7a0}.fail{color:#f87171}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.card{background:#111;border:1px solid #333;border-radius:8px;padding:12px}
img{width:100%;border-radius:6px;margin-top:8px}
</style></head><body>
<h1>Logo / mascot → /welcome</h1>
<p><strong>${passed}/${results.length} passed</strong> · Base: ${base}</p>
<div class="grid">${results
    .map(
      (r) => `<article class="card"><h2 class="${r.ok ? "ok" : "fail"}">${r.ok ? "PASS" : "FAIL"} ${r.label}</h2>
<p><code>${r.path}</code></p><ul>${r.checks.map((c) => `<li class="${c.ok ? "ok" : "fail"}">${c.msg}</li>`).join("")}</ul>
${r.screenshot ? `<img src="${r.screenshot}" alt=""/>` : ""}</article>`,
    )
    .join("")}</div></body></html>`;

  fs.writeFileSync(path.join(outDir, "index.html"), html);
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify({ base, passed, failed: failed.length, results }, null, 2));

  console.log(`\nReport: ${path.join(outDir, "index.html")}`);
  if (failed.length) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
