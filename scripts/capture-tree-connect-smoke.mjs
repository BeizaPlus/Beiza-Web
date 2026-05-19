/**
 * Screenshots: Oppong tree — connected edge, disconnect menu, controls scale, edit menu.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "docs", "progress-snapshots", "tree-connect-smoke");

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const base = process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080";
const admin = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PRIVILEGED_KEY, {
  auth: { persistSession: false },
});

const OPPONG_ID = "01a7ea9a-2a06-4cb4-a511-3b5a377f63a3";
const tokenMod = await import(
  pathToFileURL(path.join(root, "api", "lib", "circleAccessToken.ts")).href
);

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const { data: people } = await admin.from("family_people").select("id").eq("circle_id", OPPONG_ID);
  const ids = (people ?? []).map((p) => p.id);
  if (ids.length < 2) throw new Error("Need 2+ people in Oppong circle");

  const [sourceId, targetId] = ids;

  await admin.from("tree_edges").delete().eq("circle_id", OPPONG_ID);

  const { data: edge, error } = await admin
    .from("tree_edges")
    .insert({
      circle_id: OPPONG_ID,
      source_person_id: sourceId,
      target_person_id: targetId,
      relationship_type: "sibling_of",
    })
    .select()
    .single();
  if (error) throw error;

  const { data: circle } = await admin
    .from("family_circles")
    .select("*")
    .eq("id", OPPONG_ID)
    .single();

  const { data: allPeople } = await admin.from("family_people").select("*").eq("circle_id", OPPONG_ID);
  const { data: treeEdges } = await admin.from("tree_edges").select("*").eq("circle_id", OPPONG_ID);
  const { data: recordings } = await admin
    .from("recordings")
    .select("id, circle_id, prompt, audio_url, duration_seconds, title, created_at, recorded_by")
    .eq("circle_id", OPPONG_ID);
  const recordingIds = (recordings ?? []).map((r) => r.id);
  let links = [];
  if (recordingIds.length) {
    const { data: linkRows } = await admin
      .from("recording_person_links")
      .select("*")
      .in("recording_id", recordingIds);
    links = linkRows ?? [];
  }

  const { raw, hash, expiresAt } = tokenMod.generateCircleAccessToken();
  await admin.from("circle_access_tokens").insert({
    circle_id: OPPONG_ID,
    token_hash: hash,
    expires_at: expiresAt.toISOString(),
  });
  const sessionToken = tokenMod.signCircleSessionToken(OPPONG_ID, raw);

  const treePayload = {
    circle,
    people: allPeople ?? [],
    recordings: recordings ?? [],
    links,
    treeEdges: treeEdges ?? [],
    memberCount: allPeople?.length ?? 0,
    memoryCount: recordings?.length ?? 0,
  };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.route(/\/api\/circle\/verify-code/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ valid: true, token: sessionToken }),
    });
  });
  await page.route(/\/api\/circle\/tree-data/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(treePayload),
    });
  });

  const shot = async (name) => {
    await page.screenshot({ path: path.join(outDir, name), fullPage: false });
    console.log(`  ✓ ${name}`);
  };

  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ circleId, token }) => {
      localStorage.setItem(`beiza_circle_${circleId}_token`, token);
    },
    { circleId: OPPONG_ID, token: sessionToken },
  );

  await page.goto(`${base}/circle/${OPPONG_ID}/tree`, { waitUntil: "networkidle" });
  await page.waitForSelector(".react-flow, .family-tree-flow", { timeout: 30000 });
  await page.waitForTimeout(3500);
  await shot("01-tree-connected.png");

  const edgePath = page.locator(".react-flow__edge-path").first();
  await edgePath.click({ force: true });
  await page.waitForTimeout(500);
  await shot("02-edge-selected.png");

  await edgePath.click({ button: "right", force: true });
  await page.waitForTimeout(400);
  await shot("03-edge-context-menu.png");

  await page.locator('button:has-text("Remove connection")').click();
  await page.waitForTimeout(2000);
  await shot("04-tree-disconnected.png");

  await page.locator(".react-flow__node-person").first().click();
  await page.waitForTimeout(400);
  await page.locator('button[aria-label="Edit name and role"]').click();
  await page.waitForTimeout(400);
  await shot("05-person-edit-dropdown.png");

  await shot("06-zoom-controls-30vh.png");

  await admin.from("tree_edges").delete().eq("id", edge.id);
  await browser.close();

  console.log(`\nDone → ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
