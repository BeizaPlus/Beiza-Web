/**
 * Full-site link smoke — visit every mastersheet route + crawled internal links.
 * Screenshots + HTML report for review.
 *
 * Usage:
 *   npm run dev   (or preview on 8080)
 *   SMOKE_SITE_URL=http://127.0.0.1:8080 node scripts/capture-site-links-smoke.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const stamp = process.env.SMOKE_OUT_DIR ?? new Date().toISOString().slice(0, 10);
const outDir = path.join(root, "docs", "progress-snapshots", `site-links-smoke-${stamp}`);
const base = (process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");

/** Static routes from App.tsx + beizaMasterLinks (no admin, no dynamic :id/:slug) */
const STATIC_ROUTES = [
  { path: "/", label: "Welcome gate" },
  { path: "/welcome", label: "Welcome alias" },
  { path: "/home", label: "Education home" },
  { path: "/education", label: "Education redirect", expectFinal: "/home" },
  { path: "/education/story-questions", label: "Story questions" },
  { path: "/gallery", label: "Gallery redirect", expectFinal: "/circle" },
  { path: "/vault", label: "Vault redirect", expectFinal: "/legacy/vault" },
  { path: "/record", label: "Record redirect", expectFinal: "/legacy/record" },
  { path: "/recover", label: "Recover" },
  { path: "/circle", label: "Circle directory" },
  { path: "/family-trees", label: "Family trees redirect", expectFinal: "/circle" },
  { path: "/contact", label: "Contact" },
  { path: "/events", label: "Events" },
  { path: "/blog", label: "Blog index" },
  { path: "/memoirs", label: "Memoirs index" },
  { path: "/pricing", label: "Pricing" },
  { path: "/vault/explore", label: "Vault explore" },
  { path: "/download", label: "Download" },
  { path: "/order-confirmation", label: "Order confirmation" },
  { path: "/heritage", label: "Heritage legacy landing" },
  { path: "/farewell", label: "Farewell heritage" },
  { path: "/white-swan", label: "White swan redirect", expectFinal: "/farewell" },
  { path: "/legacy", label: "Legacy home" },
  { path: "/legacy/record", label: "Legacy record" },
  { path: "/legacy/vault", label: "Legacy vault" },
  { path: "/legacy/family", label: "Legacy family invite" },
  { path: "/legacy/circle", label: "Legacy circle" },
  { path: "/in/heritage", label: "IN heritage" },
  { path: "/in/farewell", label: "IN farewell" },
  { path: "/la/heritage", label: "LA heritage" },
  { path: "/la/farewell", label: "LA farewell" },
  { path: "/zh/heritage", label: "ZH heritage" },
  { path: "/zh/farewell", label: "ZH farewell" },
  { path: "/br/heritage", label: "BR heritage" },
  { path: "/br/farewell", label: "BR farewell" },
  { path: "/fr/heritage", label: "FR heritage" },
  { path: "/fr/farewell", label: "FR farewell" },
  { path: "/af/heritage", label: "AF heritage" },
  { path: "/af/farewell", label: "AF farewell" },
  { path: "/in/education", label: "IN education redirect", expectFinal: "/home" },
  { path: "/la/education", label: "LA education redirect", expectFinal: "/home" },
  { path: "/zh/education", label: "ZH education redirect", expectFinal: "/home" },
  { path: "/br/education", label: "BR education redirect", expectFinal: "/home" },
  { path: "/fr/education", label: "FR education redirect", expectFinal: "/home" },
  { path: "/af/education", label: "AF education redirect", expectFinal: "/home" },
];

const CRAWL_SEEDS = ["/", "/home", "/heritage", "/farewell", "/legacy/record", "/pricing", "/events"];

const results = [];

function slugify(p) {
  return p
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "root";
}

function pass(entry, msg) {
  entry.checks.push({ ok: true, msg });
}

function fail(entry, msg) {
  entry.checks.push({ ok: false, msg });
  entry.ok = false;
}

async function auditPage(page, routePath, label, expectFinal) {
  const entry = {
    path: routePath,
    label,
    ok: true,
    checks: [],
    finalUrl: "",
    screenshot: "",
    errors: [],
  };

  const errors = [];
  const onErr = (e) => errors.push(String(e));
  page.on("pageerror", onErr);

  try {
    const url = `${base}${routePath}${routePath.includes("?") ? "&" : "?"}studio=0`;
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(1200);

    entry.finalUrl = new URL(page.url()).pathname;

    if (res && res.status() >= 400) fail(entry, `HTTP ${res.status()}`);
    else pass(entry, `HTTP ${res?.status() ?? "ok"}`);

    const rootText = await page.locator("#root").innerText().catch(() => "");
    if (rootText.trim().length > 15) pass(entry, "Page rendered content");
    else fail(entry, "Empty or crashed page (#root)");

    if (expectFinal && entry.finalUrl !== expectFinal) {
      fail(entry, `Expected redirect to ${expectFinal}, got ${entry.finalUrl}`);
    } else if (expectFinal) {
      pass(entry, `Redirect → ${expectFinal}`);
    }

    if (errors.length) {
      fail(entry, `JS errors: ${errors.slice(0, 2).join(" | ")}`);
    } else {
      pass(entry, "No page errors");
    }

    const file = `${String(results.length + 1).padStart(2, "0")}-${slugify(routePath)}.png`;
    await page.screenshot({ path: path.join(outDir, file), fullPage: true });
    entry.screenshot = file;
    pass(entry, "Screenshot saved");
  } catch (e) {
    fail(entry, e.message);
  } finally {
    page.off("pageerror", onErr);
  }

  entry.errors = errors;
  results.push(entry);
  return entry.ok;
}

async function collectInternalLinks(page, seedPath) {
  await page.goto(`${base}${seedPath}?studio=0`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(800);
  return page.evaluate(() => {
    const out = new Set();
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      try {
        const u = new URL(href, window.location.origin);
        if (u.origin !== window.location.origin) continue;
        out.add(u.pathname);
      } catch {
        /* skip */
      }
    }
    return [...out];
  });
}

function writeReport() {
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  const rows = results
    .map((r) => {
      const status = r.ok
        ? '<span class="ok">PASS</span>'
        : '<span class="fail">FAIL</span>';
      const checks = r.checks.map((c) => `<li class="${c.ok ? "ok" : "fail"}">${c.msg}</li>`).join("");
      const img = r.screenshot
        ? `<a href="${r.screenshot}"><img src="${r.screenshot}" alt="" loading="lazy" /></a>`
        : "<p>No screenshot</p>";
      return `<article class="card ${r.ok ? "" : "fail-card"}">
        <h2>${status} ${r.label}</h2>
        <p><code>${r.path}</code> → <code>${r.finalUrl || "—"}</code></p>
        <ul>${checks}</ul>
        ${img}
      </article>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Beiza site links smoke — ${stamp}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #eee; margin: 0; padding: 24px; }
    h1 { font-size: 1.25rem; }
    .summary { margin-bottom: 24px; padding: 16px; background: #141414; border-radius: 8px; }
    .ok { color: #6ee7a0; } .fail { color: #f87171; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .card { background: #111; border: 1px solid #222; border-radius: 10px; padding: 14px; }
    .fail-card { border-color: #522; }
    img { width: 100%; border-radius: 6px; margin-top: 10px; border: 1px solid #333; }
    code { font-size: 12px; color: #aaa; }
    ul { margin: 8px 0; padding-left: 18px; font-size: 12px; }
    li { margin: 2px 0; }
  </style>
</head>
<body>
  <h1>Beiza full-site link smoke</h1>
  <div class="summary">
    <p><strong>Base:</strong> ${base}</p>
    <p><strong>Date:</strong> ${stamp}</p>
    <p><strong>Result:</strong> <span class="ok">${passed} passed</span>, <span class="fail">${failed.length} failed</span> (${results.length} total)</p>
  </div>
  <div class="grid">${rows}</div>
</body>
</html>`;

  fs.writeFileSync(path.join(outDir, "index.html"), html);
  fs.writeFileSync(
    path.join(outDir, "report.json"),
    JSON.stringify({ base, stamp, passed, failed: failed.length, total: results.length, results }, null, 2),
  );
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`Site links smoke — ${base}`);
  console.log(`Output → ${outDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  await context.addInitScript(() => {
    localStorage.setItem("beiza-locale", "africa");
    localStorage.setItem("beiza-locale-pinned", "1");
    localStorage.setItem("beiza-welcome-theme", "dark");
  });

  const page = await context.newPage();
  const visited = new Set();

  console.log("=== Static routes ===\n");
  for (const route of STATIC_ROUTES) {
    if (visited.has(route.path)) continue;
    visited.add(route.path);
    const ok = await auditPage(page, route.path, route.label, route.expectFinal);
    console.log(`${ok ? "✓" : "✗"} ${route.path} — ${route.label}`);
  }

  console.log("\n=== Crawled internal links ===\n");
  const crawled = new Set();
  for (const seed of CRAWL_SEEDS) {
    const links = await collectInternalLinks(page, seed);
    for (const p of links) crawled.add(p);
  }

  const skipPattern = /^\/(admin|memory\/|blog\/[^/]+|memoirs\/[^/]+|tribute\/|circle\/[^/]+)/;
  for (const p of [...crawled].sort()) {
    if (visited.has(p) || skipPattern.test(p)) continue;
    visited.add(p);
    const ok = await auditPage(page, p, `Crawled from seeds`, undefined);
    console.log(`${ok ? "✓" : "✗"} ${p} (crawled)`);
  }

  await context.close();
  await browser.close();

  writeReport();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== Summary ===`);
  console.log(`Passed: ${results.length - failed.length}/${results.length}`);
  console.log(`Report: ${path.join(outDir, "index.html")}`);

  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) {
      console.log(`  - ${f.path}: ${f.checks.filter((c) => !c.ok).map((c) => c.msg).join("; ")}`);
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
