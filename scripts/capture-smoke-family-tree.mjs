/**
 * Screenshots: /circle → enter gate → tree (smoke-test path)
 * Mocks /api/circle/* when Vercel APIs are not running locally.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "docs", "progress-snapshots", "smoke-family-tree");

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
process.env.SUPABASE_SERVICE_ROLE_KEY = env.VITE_SUPABASE_PRIVILEGED_KEY;
const base = process.env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080";

const admin = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PRIVILEGED_KEY, {
  auth: { persistSession: false },
});

const tokenMod = await import(
  pathToFileURL(path.join(root, "api", "lib", "circleAccessToken.ts")).href
);

async function pickCircle() {
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

  return withMemories.sort((a, b) => b.memories - a.memories)[0];
}

async function buildTreePayload(circleId) {
  const { data: circle } = await admin
    .from("family_circles")
    .select("id, name, access_code, access_code_hint, since_year, is_in_memoriam")
    .eq("id", circleId)
    .single();

  const { data: people } = await admin.from("family_people").select("*").eq("circle_id", circleId);
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

  const circle = await pickCircle();
  if (!circle?.access_code) {
    console.error("No circle with access_code found.");
    process.exit(1);
  }

  const sessionToken = await issueSessionToken(circle.id);
  const treePayload = await buildTreePayload(circle.id);

  console.log(`Circle: ${circle.name}`);
  console.log(`Access code: ${circle.access_code}`);
  console.log(`Memories: ${treePayload.memoryCount}`);

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

  const shot = async (name) => {
    const file = path.join(outDir, name);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  Saved ${name}`);
  };

  await page.goto(`${base}/circle`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(600);
  await shot("01-circle-directory.png");

  await page.goto(`${base}/circle/${circle.id}/enter`, { waitUntil: "networkidle" });
  await shot("02-access-gate.png");

  await page.locator('input[aria-label="Access code"]').fill(circle.access_code);
  await shot("03-access-gate-code-filled.png");

  await page.getByRole("button", { name: /Enter circle/i }).click();
  await page.waitForURL(/\/tree/, { timeout: 15000 });
  await page.waitForTimeout(3500);
  const treeShot = path.join(outDir, "04-family-tree-canvas.png");
  await page.screenshot({ path: treeShot, fullPage: false });
  console.log("  Saved 04-family-tree-canvas.png");

  // /circle/:id/tree needs Vercel API locally; use /legacy/circle with auth for tree UI
  const ts = Date.now();
  const email = `screenshot-tree-${ts}@beiza-smoke.test`;
  const password = `Shot!${ts}`;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) throw createErr;
  const { data: auth, error: signErr } = await admin.auth.signInWithPassword({ email, password });
  if (signErr || !auth.session) throw signErr ?? new Error("No session after sign-in");
  const inviteCode = `SCR-${String(ts).slice(-9)}`;
  const { data: lc, error: lcErr } = await admin
    .from("family_circles")
    .insert({ name: `Screenshot Tree ${ts}`, invite_code: inviteCode, created_by: auth.user.id })
    .select("id, access_code")
    .single();
  if (lcErr || !lc) throw lcErr ?? new Error("Could not create screenshot circle");
  await admin.from("family_members").insert({
    circle_id: lc.id,
    user_id: auth.user.id,
    role: "keeper",
    display_name: "Keeper",
  });
  const { data: anchor } = await admin
    .from("family_people")
    .insert({
      circle_id: lc.id,
      display_name: "Grandparent",
      status: "living",
      is_tree_anchor: true,
      created_by: auth.user.id,
    })
    .select("id")
    .single();
  await admin.from("family_people").insert({
    circle_id: lc.id,
    display_name: "Child",
    status: "living",
    parent_id: anchor?.id ?? null,
    created_by: auth.user.id,
  });

  await page.goto(`${base}/legacy`, { waitUntil: "networkidle" });
  await page.evaluate(
    async ({ session, supabaseUrl, anonKey }) => {
      const key = "beiza-admin-session";
      localStorage.setItem(key, JSON.stringify(session));
      const { createClient } = await import(
        "https://esm.sh/@supabase/supabase-js@2.49.1"
      );
      if (supabaseUrl && anonKey) {
        const client = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: true, storageKey: key },
        });
        await client.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }
    },
    {
      session: auth.session,
      supabaseUrl: env.VITE_SUPABASE_URL,
      anonKey: env.VITE_SUPABASE_PUBLIC_KEY ?? env.VITE_SUPABASE_ANON_KEY,
    },
  );
  await page.goto(`${base}/legacy/circle`, { waitUntil: "networkidle" });
  await page.waitForSelector(".react-flow", { timeout: 20000 }).catch(() => null);
  await page.waitForTimeout(2500);
  await shot("05-legacy-family-tree.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await shot("06-legacy-family-tree-mobile.png");

  await browser.close();

  fs.writeFileSync(
    path.join(outDir, "README.md"),
    `# Smoke — family tree screenshots

Captured: ${new Date().toISOString()}

- **Circle:** ${circle.name}
- **Code:** \`${circle.access_code}\`
- **Memories:** ${treePayload.memoryCount}

| File | Step |
|------|------|
| 01-circle-directory.png | /circle |
| 02-access-gate.png | Private circle gate |
| 03-access-gate-code-filled.png | Code filled |
| 04-family-tree-canvas.png | After Enter — public /circle/.../tree |
| 05-legacy-family-tree.png | Tree canvas via /legacy/circle (signed in) |
| 06-legacy-family-tree-mobile.png | Mobile tree view |

Note: Public \`/circle/:id/tree\` needs \`vercel dev\` or production API env; tree UI shown via legacy route for local captures.
`,
  );

  console.log(`\nDone → ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
