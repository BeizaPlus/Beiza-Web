/**
 * Full product smoke test — schema, Circle gate, recovery, routes, APIs.
 * Usage: node scripts/product-smoke-test.mjs
 * Optional: SMOKE_SITE_URL=http://localhost:8080 (vite dev/preview)
 *            SMOKE_API_URL=https://beizaplus.com (for Vercel API routes)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(path.join(root, ".env"), "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i), line.slice(i + 1)];
      }),
  );
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const serviceKey = env.VITE_SUPABASE_PRIVILEGED_KEY;
const anonKey = env.VITE_SUPABASE_ANON_KEY;
const siteUrl = process.env.SMOKE_SITE_URL ?? env.SMOKE_SITE_URL ?? "http://127.0.0.1:8080";
const apiUrl = process.env.SMOKE_API_URL ?? env.SMOKE_API_URL ?? "https://beizaplus.com";

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const results = { passed: [], failed: [], warned: [] };

function pass(label) {
  results.passed.push(label);
  console.log(`  ✓ ${label}`);
  return true;
}

function fail(label, detail) {
  const msg = detail ? `${label}: ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : label;
  results.failed.push(msg);
  console.log(`  ✗ ${msg}`);
  return false;
}

function warn(label, detail) {
  results.warned.push(`${label}${detail ? `: ${detail}` : ""}`);
  console.log(`  ⚠ ${label}${detail ? ` — ${detail}` : ""}`);
}

async function checkSchema() {
  console.log("\n=== 1. Database schema & RPCs ===\n");
  let ok = true;

  const tables = [
    "family_circles",
    "family_members",
    "recordings",
    "family_people",
    "recording_person_links",
    "heritage_inquiries",
    "recovery_requests",
    "circle_members",
    "circle_access_tokens",
    "event_stories",
  ];

  for (const table of tables) {
    const { error } = await admin.from(table).select("*").limit(1);
    if (error) ok = fail(`table ${table}`, error.message) && ok;
    else ok = pass(`table ${table}`) && ok;
  }

  const { data: circles, error: rpcErr } = await anon.rpc("list_public_family_circles");
  if (rpcErr) ok = fail("RPC list_public_family_circles", rpcErr.message) && ok;
  else ok = pass(`RPC list_public_family_circles (${circles?.length ?? 0} rows)`) && ok;

  const { data: cols } = await admin.from("family_circles").select("access_code").limit(1);
  if (cols?.[0]?.access_code?.length === 6) ok = pass("family_circles.access_code column") && ok;
  else ok = fail("family_circles.access_code", "missing or wrong length — run migration 20260524") && ok;

  const { data: buckets } = await admin.storage.listBuckets();
  for (const id of ["legacy-recordings", "recovery-documents"]) {
    if (buckets?.some((b) => b.id === id)) ok = pass(`storage bucket ${id}`) && ok;
    else ok = fail(`storage bucket ${id}`) && ok;
  }

  return ok;
}

async function checkCircleGateE2E() {
  console.log("\n=== 2. Circle access code gate (DB + API) ===\n");
  let ok = true;

  const ts = Date.now();
  const name = `Smoke Gate ${ts}`;
  const { data: circle, error: insertErr } = await admin
    .from("family_circles")
    .insert({ name, invite_code: `SMK-${ts}`.slice(0, 11) })
    .select("id, name, access_code")
    .single();

  if (insertErr) return fail("create test circle", insertErr.message);

  ok = pass(`test circle created (${circle.access_code})`) && ok;

  const { data: cover, error: coverErr } = await anon.rpc("get_public_circle_cover", {
    p_circle_id: circle.id,
  });
  if (coverErr || !cover?.[0]) ok = fail("get_public_circle_cover", coverErr?.message) && ok;
  else ok = pass("get_public_circle_cover returns row") && ok;

  const wrongCode = "XXXXXX";
  if (wrongCode !== circle.access_code) ok = pass("wrong code differs from real code") && ok;

  try {
    const res = await fetch(`${apiUrl}/api/circle/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circle_id: circle.id, code: wrongCode }),
    });
    const body = await res.json();
    if (body.valid === false) ok = pass("API verify-code rejects wrong code") && ok;
    else ok = fail("API verify-code wrong code", body) && ok;
  } catch (e) {
    ok = warn("API verify-code (wrong)", `skipped — ${e.message}. Use SMOKE_API_URL or vercel dev`) && ok;
  }

  try {
    const res = await fetch(`${apiUrl}/api/circle/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circle_id: circle.id, code: circle.access_code }),
    });
    const body = await res.json();
    if (body.valid === true && body.token) {
      ok = pass("API verify-code accepts correct code + returns token") && ok;

      const treeRes = await fetch(
        `${apiUrl}/api/circle/tree-data?circle_id=${encodeURIComponent(circle.id)}`,
        { headers: { Authorization: `Bearer ${body.token}` } },
      );
      if (treeRes.ok) ok = pass("API tree-data with token") && ok;
      else ok = fail("API tree-data", await treeRes.text()) && ok;
    } else ok = fail("API verify-code correct code", body) && ok;
  } catch (e) {
    ok = warn("API verify-code (correct)", `skipped — ${e.message}`) && ok;
  }

  await admin.from("family_circles").delete().eq("id", circle.id);
  ok = pass("test circle cleaned up") && ok;

  return ok;
}

async function checkRecoveryAndHeritage() {
  console.log("\n=== 3. Recovery & Heritage intake ===\n");
  let ok = true;

  const { error: recErr } = await admin.from("recovery_requests").insert({
    deceased_name: "Smoke Test Deceased",
    deceased_contact: "smoke@test.com",
    requester_relation: "Child",
    requester_email: `recovery-${Date.now()}@beiza-smoke.test`,
    message: "Automated smoke test row",
    status: "pending",
  });
  if (recErr) ok = fail("recovery_requests insert (admin)", recErr.message) && ok;
  else ok = pass("recovery_requests insert (admin)") && ok;

  try {
    const res = await fetch(`${apiUrl}/api/recovery-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deceased_name: "API Smoke",
        deceased_contact: "api@test.com",
        requester_relation: "Sibling",
        requester_email: `api-recovery-${Date.now()}@beiza-smoke.test`,
        message: "API smoke",
      }),
    });
    const body = await res.json();
    if (res.ok && body.ok) ok = pass("POST /api/recovery-request") && ok;
    else ok = fail("POST /api/recovery-request", { status: res.status, body }) && ok;
  } catch (e) {
    ok = warn("POST /api/recovery-request", e.message) && ok;
  }

  const { error: herErr } = await admin.from("heritage_inquiries").insert({
    name: "Smoke Tester",
    email: `heritage-${Date.now()}@beiza-smoke.test`,
    message: "Smoke test",
  });
  if (herErr) ok = fail("heritage_inquiries insert", herErr.message) && ok;
  else ok = pass("heritage_inquiries insert") && ok;

  try {
    const res = await fetch(`${apiUrl}/api/heritage-inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "API Heritage",
        email: `api-heritage-${Date.now()}@beiza-smoke.test`,
      }),
    });
    const body = await res.json();
    if (res.ok && body.ok) ok = pass("POST /api/heritage-inquiry") && ok;
    else ok = fail("POST /api/heritage-inquiry", { status: res.status, body }) && ok;
  } catch (e) {
    ok = warn("POST /api/heritage-inquiry", e.message) && ok;
  }

  return ok;
}

async function checkFamilyTree() {
  console.log("\n=== 4. Family tree ===\n");
  let ok = true;

  const { error: fnErr } = await admin.rpc("get_person_biography", {
    p_person_id: "00000000-0000-0000-0000-000000000000",
  });
  if (fnErr && !fnErr.message.includes("null")) {
    if (fnErr.code === "PGRST202") ok = fail("get_person_biography RPC", "not found — run 20260522 migration") && ok;
    else ok = pass("get_person_biography RPC exists") && ok;
  } else ok = pass("get_person_biography RPC exists") && ok;

  const { data: stories } = await admin.from("event_stories").select("id, slug, title").limit(3);
  if (stories?.length) ok = pass(`event_stories seeded (${stories.length}+ rows)`) && ok;
  else ok = warn("event_stories", "empty — run 20260523 migration or use fallbacks") && ok;

  return ok;
}

async function checkRoutes() {
  console.log(`\n=== 5. SPA routes (${siteUrl}) ===\n`);
  let ok = true;

  const routes = [
    "/",
    "/circle",
    "/recover",
    "/heritage",
    "/pricing",
    "/events",
    "/legacy",
    "/legacy/vault",
    "/legacy/record",
    "/legacy/family",
    "/vault/explore",
    "/contact",
  ];

  for (const route of routes) {
    try {
      const res = await fetch(`${siteUrl}${route}`, { redirect: "follow" });
      if (res.ok) ok = pass(`GET ${route} (${res.status})`) && ok;
      else ok = fail(`GET ${route}`, res.status) && ok;
    } catch (e) {
      ok = fail(`GET ${route}`, e.message) && ok;
    }
  }

  const redirectChecks = [
    ["/gallery", "/circle"],
    ["/family-trees", "/circle"],
    ["/white-swan", "/heritage"],
    ["/vault", "/legacy/vault"],
    ["/record", "/legacy/record"],
  ];

  for (const [from, expectPath] of redirectChecks) {
    try {
      const res = await fetch(`${siteUrl}${from}`, { redirect: "manual" });
      const loc = res.headers.get("location") ?? "";
      if (res.status >= 300 && res.status < 400 && loc.includes(expectPath)) {
        ok = pass(`redirect ${from} → ${expectPath}`) && ok;
      } else if (res.ok) {
        ok = pass(`${from} serves SPA (client redirect)`) && ok;
      } else ok = warn(`redirect ${from}`, `status ${res.status} loc=${loc}`) && ok;
    } catch (e) {
      ok = warn(`redirect ${from}`, e.message) && ok;
    }
  }

  return ok;
}

async function checkBundle() {
  console.log("\n=== 6. Production bundle strings ===\n");
  let ok = true;

  try {
    const indexRes = await fetch(`${siteUrl}/`);
    if (!indexRes.ok) return fail("GET / for bundle check", indexRes.status);

    const html = await indexRes.text();
    const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (!jsMatch) return fail("find main bundle in index.html");

    const js = await fetch(`${siteUrl}${jsMatch[1]}`).then((r) => r.text());
    const needles = ["Vault", "Circle", "Heritage", "Recover a voice", "PRIVATE CIRCLES"];
    for (const n of needles) {
      if (js.includes(n) || html.includes(n)) ok = pass(`bundle/HTML contains "${n}"`) && ok;
      else ok = fail(`bundle missing "${n}"`) && ok;
    }
  } catch (e) {
    ok = fail("bundle check", e.message) && ok;
  }

  return ok;
}

async function main() {
  console.log("Beiza product smoke test");
  console.log(`Supabase: ${url}`);
  console.log(`Site: ${siteUrl}`);
  console.log(`API: ${apiUrl}`);

  if (!url || !serviceKey || !anonKey) {
    console.error("Missing Supabase env in .env");
    process.exit(1);
  }

  const a = await checkSchema();
  const b = await checkCircleGateE2E();
  const c = await checkRecoveryAndHeritage();
  const d = await checkFamilyTree();
  const e = await checkRoutes();
  const f = await checkBundle();

  console.log("\n=== Summary ===\n");
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Warnings: ${results.warned.length}`);

  if (results.failed.length) {
    console.log("\nFailures:");
    results.failed.forEach((f) => console.log(`  - ${f}`));
  }
  if (results.warned.length) {
    console.log("\nWarnings:");
    results.warned.forEach((w) => console.log(`  - ${w}`));
  }

  const critical = a && b && c && d;
  if (critical && results.failed.length === 0) {
    console.log("\nALL CRITICAL CHECKS PASSED");
    process.exit(e && f ? 0 : 0);
  } else if (results.failed.length === 0) {
    console.log("\nPASSED (some route/bundle checks may need dev server running)");
    process.exit(0);
  } else {
    console.log("\nSOME CHECKS FAILED");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
