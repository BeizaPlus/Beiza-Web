/**
 * Full-site smoke screenshots — all main routes + Oppong family tree flow.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const stamp = process.env.SMOKE_OUT_DIR ?? new Date().toISOString().slice(0, 10);
const outDir = path.join(root, "docs", "progress-snapshots", `full-smoke-${stamp}`);

function loadEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(path.join(root, ".env"), "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1)];
      }),
  );
}

const env = loadEnv();
const base = process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080";
const admin = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PRIVILEGED_KEY, {
  auth: { persistSession: false },
});

const ROUTES = [
  { path: "/", name: "01-home" },
  { path: "/circle", name: "02-circle-directory" },
  { path: "/recover", name: "03-recover" },
  { path: "/heritage", name: "04-heritage" },
  { path: "/pricing", name: "05-pricing" },
  { path: "/events", name: "06-events" },
  { path: "/legacy", name: "07-legacy-home" },
  { path: "/legacy/vault", name: "08-legacy-vault" },
  { path: "/legacy/record", name: "09-legacy-record" },
  { path: "/legacy/family", name: "10-legacy-family" },
  { path: "/vault/explore", name: "11-vault-explore" },
  { path: "/contact", name: "12-contact" },
];

const tokenMod = await import(
  pathToFileURL(path.join(root, "api", "lib", "circleAccessToken.ts")).href
);

async function pickOppongCircle() {
  const { data } = await admin
    .from("family_circles")
    .select("id, name, access_code")
    .order("created_at", { ascending: false });

  const withMemories = await Promise.all(
    (data ?? []).map(async (c) => {
      const { count } = await admin
        .from("recordings")
        .select("id", { count: "exact", head: true })
        .eq("circle_id", c.id);
      return { ...c, memories: count ?? 0 };
    }),
  );

  const oppong = withMemories
    .filter((c) => c.access_code && /oppong/i.test(c.name))
    .sort((a, b) => b.memories - a.memories)[0];

  return (
    oppong ??
    withMemories.filter((c) => c.access_code).sort((a, b) => b.memories - a.memories)[0]
  );
}

async function buildTreePayload(circleId) {
  const { data: circle } = await admin
    .from("family_circles")
    .select("id, name, access_code, access_code_hint, since_year, is_in_memoriam")
    .eq("id", circleId)
    .single();
  const { data: people } = await admin.from("family_people").select("*").eq("circle_id", circleId);
  const { data: treeEdges } = await admin.from("tree_edges").select("*").eq("circle_id", circleId);
  const { data: recordings } = await admin
    .from("recordings")
    .select("id, circle_id, prompt, audio_url, duration_seconds, title, created_at, recorded_by")
    .eq("circle_id", circleId);
  const recordingIds = (recordings ?? []).map((r) => r.id);
  let links = [];
  if (recordingIds.length > 0) {
    const { data: linkRows } = await admin
      .from("recording_person_links")
      .select("*")
      .in("recording_id", recordingIds);
    links = linkRows ?? [];
  }
  return {
    circle,
    people: people ?? [],
    recordings: recordings ?? [],
    links,
    treeEdges: treeEdges ?? [],
    memberCount: people?.length ?? 0,
    memoryCount: recordings?.length ?? 0,
  };
}

async function issueSessionToken(circleId) {
  const { raw, hash, expiresAt } = tokenMod.generateCircleAccessToken();
  await admin.from("circle_access_tokens").insert({
    circle_id: circleId,
    token_hash: hash,
    expires_at: expiresAt.toISOString(),
  });
  return tokenMod.signCircleSessionToken(circleId, raw);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const circle = await pickOppongCircle();
  if (!circle?.access_code) {
    console.error("No circle with access_code.");
    process.exit(1);
  }

  const sessionToken = await issueSessionToken(circle.id);
  const treePayload = await buildTreePayload(circle.id);

  console.log(`Base: ${base}`);
  console.log(`Circle: ${circle.name} (${circle.access_code})`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const fulfillJson = (route, body) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

  await page.route(/\/api\/circle\/verify-code/, async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const body = route.request().postDataJSON();
    const valid = body?.code?.toUpperCase() === circle.access_code;
    await fulfillJson(route, valid ? { valid: true, token: sessionToken } : { valid: false });
  });

  await page.route(/\/api\/circle\/tree-data/, async (route) => {
    await fulfillJson(route, treePayload);
  });

  for (const { path: routePath, name } of ROUTES) {
    try {
      await page.goto(`${base}${routePath}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(800);
      const file = path.join(outDir, `${name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  }

  await page.goto(`${base}/circle/${circle.id}/enter`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, "13-circle-enter-gate.png"), fullPage: true });
  console.log("  ✓ 13-circle-enter-gate");

  await page.locator('input[aria-label="Access code"]').fill(circle.access_code);
  await page.getByRole("button", { name: /Enter circle/i }).click();
  await page.waitForURL(/\/tree/, { timeout: 15000 });
  await page.waitForTimeout(4000);
  await page.waitForSelector(".react-flow, .family-tree-flow", { timeout: 25000 }).catch(() => null);
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(outDir, "14-family-tree-oppong.png"),
    fullPage: false,
  });
  console.log("  ✓ 14-family-tree-oppong");

  await browser.close();
  console.log(`\nScreenshots → ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
