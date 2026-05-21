/**
 * On-page SEO smoke test — verifies meta tags, canonical, JSON-LD, h1.
 * Does NOT verify Google Search ranking (#1 is not testable in CI).
 *
 * Usage: SMOKE_SITE_URL=http://127.0.0.1:8080 node scripts/seo-smoke-test.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = join(root, "artifacts");
const base = process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080";
const results = { passed: [], failed: [], warned: [] };

function pass(label) {
  results.passed.push(label);
  console.log(`  ✓ ${label}`);
}

function fail(label, detail = "") {
  const msg = detail ? `${label}: ${detail}` : label;
  results.failed.push(msg);
  console.log(`  ✗ ${msg}`);
}

function warn(label, detail = "") {
  const msg = detail ? `${label}: ${detail}` : label;
  results.warned.push(msg);
  console.log(`  ⚠ ${msg}`);
}

const ROUTES = [
  { path: "/?studio=0", expectTitleIncludes: "Welcome", expectH1: "Stories of the people we love" },
  { path: "/education?studio=0", expectTitleIncludes: "Education", expectH1: null },
  { path: "/legacy/record?studio=0", expectTitleIncludes: "Record", expectH1: "Record a memory" },
];

async function readSeo(page) {
  return page.evaluate(() => {
    const meta = (name, attr = "name") =>
      document.querySelector(`meta[${attr}="${name}"]`)?.getAttribute("content") ?? "";
    const jsonLd = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
      (s) => s.textContent,
    );
    return {
      title: document.title,
      description: meta("description"),
      robots: meta("robots"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
      ogTitle: meta("og:title", "property"),
      ogUrl: meta("og:url", "property"),
      h1: document.querySelector("h1")?.textContent?.trim() ?? "",
      jsonLdCount: jsonLd.length,
      hasWebSite: jsonLd.some((t) => t?.includes('"WebSite"')),
      hasOrganization: jsonLd.some((t) => t?.includes('"Organization"')),
    };
  });
}

async function auditRoute(page, { path, expectTitleIncludes, expectH1 }) {
  console.log(`\n--- ${path} ---\n`);
  await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(800);

  const seo = await readSeo(page);

  if (seo.title && seo.title.includes(expectTitleIncludes)) {
    pass(`${path} title contains "${expectTitleIncludes}"`);
  } else {
    fail(`${path} title`, seo.title || "(empty)");
  }

  if (seo.description.length >= 50 && seo.description.length <= 165) {
    pass(`${path} meta description length (${seo.description.length})`);
  } else {
    warn(`${path} meta description length`, `${seo.description.length} chars`);
  }

  if (seo.canonical.startsWith("https://www.beizaplus.com")) {
    pass(`${path} canonical URL`);
  } else {
    fail(`${path} canonical`, seo.canonical || "missing");
  }

  if (seo.robots.includes("index")) pass(`${path} robots index`);
  else warn(`${path} robots`, seo.robots);

  if (seo.ogTitle && seo.ogUrl) pass(`${path} Open Graph tags`);
  else fail(`${path} Open Graph`, `title=${seo.ogTitle} url=${seo.ogUrl}`);

  if (expectH1) {
    if (seo.h1 === expectH1 || seo.h1.includes(expectH1)) pass(`${path} h1: ${seo.h1}`);
    else fail(`${path} h1`, `got "${seo.h1}"`);
  } else if (seo.h1) {
    pass(`${path} has h1: ${seo.h1.slice(0, 40)}…`);
  } else {
    warn(`${path} no h1 on page`);
  }

  if (path.startsWith("/?") || path.startsWith("/welcome")) {
    if (seo.hasWebSite && seo.hasOrganization) pass(`${path} JSON-LD WebSite + Organization`);
    else fail(`${path} JSON-LD`, `count=${seo.jsonLdCount}`);
  }
}

async function main() {
  console.log("SEO smoke test (on-page only — not Google ranking)");
  console.log(`Site: ${base}\n`);
  mkdirSync(artifacts, { recursive: true });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    for (const route of ROUTES) {
      try {
        await auditRoute(page, route);
      } catch (e) {
        fail(`${route.path} load`, e.message);
      }
    }

    await page.goto(`${base}/?studio=0`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const reportPath = join(artifacts, "seo-audit-welcome.png");
    await page.screenshot({ path: reportPath, fullPage: false });
    pass(`screenshot saved: ${reportPath}`);

    const seo = await readSeo(page);
    const reportHtml = join(artifacts, "seo-audit-report.html");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Beiza SEO audit</title>
<style>body{font-family:system-ui;background:#111;color:#eee;padding:2rem}pre{background:#222;padding:1rem;border-radius:8px}
.note{color:#f5c518}</style></head><body>
<h1>Beiza on-page SEO audit</h1>
<p class="note">This verifies HTML meta tags only. Google ranking position cannot be tested in automation.</p>
<pre>${JSON.stringify(seo, null, 2)}</pre>
<p>Captured: ${new Date().toISOString()}</p>
</body></html>`;
    await import("node:fs").then(({ writeFileSync }) => writeFileSync(reportHtml, html));
    pass(`report saved: ${reportHtml}`);

    await context.close();
  } catch (e) {
    fail("playwright", e.message);
  } finally {
    await browser?.close();
  }

  console.log("\n=== Summary ===\n");
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  if (results.warned.length) console.log(`Warnings: ${results.warned.length}`);
  if (results.failed.length) {
    console.log("\nFailures:");
    for (const f of results.failed) console.log(`  - ${f}`);
  }
  console.log(
    "\nNote: Ranking #1 on Google requires indexing, backlinks, and time — not something this script can prove.",
  );

  process.exit(results.failed.length ? 1 : 0);
}

main();
