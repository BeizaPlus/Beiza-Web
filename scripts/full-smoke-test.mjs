/**
 * Full smoke test: Creative Director copy in DB + legacy family E2E.
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
const siteUrl = env.SMOKE_SITE_URL ?? "https://beizaplus.com";

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXPECT = {
  hero_heading: "Build Intentional Legacy",
  hero_cta_label: "Start Your Legacy",
  hero_cta_href: "/legacy",
  hero_reviews: "100+ Families Preserved",
  hero_subheading_must_not_include: "Thank you for a life well lived",
  hero_subheading_must_not_include2: "farewell",
  offering_title: "Legacy Galleries",
  offering_description: "Curated imagery of the people you love",
  faq_snippets: [
    "start preserving my family's legacy",
    "When is the right time to start",
    "Beiza Legacy from outside Ghana",
    "How long does the process take",
    "What kind of experiences do you create",
  ],
};

function pass(label) {
  console.log(`  ✓ ${label}`);
  return true;
}

function fail(label, detail) {
  console.log(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
  return false;
}

async function checkContent() {
  console.log("\n=== 1. Supabase content (Creative Director PIVOT) ===\n");
  let ok = true;

  const { data: settings } = await admin.from("site_settings").select("key,value");
  const map = Object.fromEntries((settings ?? []).map((r) => [r.key, r.value]));

  for (const key of ["hero_heading", "hero_cta_label", "hero_cta_href", "hero_reviews"]) {
    if (map[key] === EXPECT[key]) ok = pass(`site_settings.${key}`) && ok;
    else ok = fail(`site_settings.${key}`, `got "${map[key]}"`) && ok;
  }

  const sub = map.hero_subheading ?? "";
  if (!sub.toLowerCase().includes(EXPECT.hero_subheading_must_not_include.toLowerCase()))
    ok = pass("hero_subheading has no farewell tagline") && ok;
  else ok = fail("hero_subheading still has old tagline") && ok;

  if (map.hero_background_image === "/images/adinkra-hands-hero.png")
    ok = pass("hero_background_image") && ok;
  else ok = fail("hero_background_image", map.hero_background_image) && ok;

  const { data: offerings } = await admin.from("offerings").select("title,description").limit(5);
  const gallery = offerings?.find((o) => o.title === EXPECT.offering_title);
  if (gallery?.description === EXPECT.offering_description) ok = pass("offerings Legacy Galleries") && ok;
  else ok = fail("offerings", JSON.stringify(offerings)) && ok;

  const { data: faqs } = await admin.from("faqs").select("question").order("display_order");
  for (const snippet of EXPECT.faq_snippets) {
    const found = faqs?.some((f) => f.question.includes(snippet));
    if (found) ok = pass(`faq contains "${snippet.slice(0, 40)}..."`) && ok;
    else ok = fail(`faq missing snippet`, snippet) && ok;
  }

  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((b) => b.id === "legacy-recordings")) ok = pass("storage bucket legacy-recordings") && ok;
  else ok = fail("storage bucket legacy-recordings") && ok;

  return ok;
}

async function checkProductionAssets() {
  console.log("\n=== 2. Production deploy (beizaplus.com) ===\n");
  let ok = true;

  const indexRes = await fetch(`${siteUrl}/`);
  if (indexRes.ok) ok = pass(`GET ${siteUrl}/ (${indexRes.status})`) && ok;
  else ok = fail(`GET ${siteUrl}/`, indexRes.status) && ok;

  const heroImg = await fetch(`${siteUrl}/images/adinkra-hands-hero.png`, { method: "HEAD" });
  if (heroImg.ok) ok = pass("hero image /images/adinkra-hands-hero.png") && ok;
  else ok = fail("hero image", heroImg.status) && ok;

  const legacyRes = await fetch(`${siteUrl}/legacy`);
  if (legacyRes.ok) ok = pass(`GET ${siteUrl}/legacy`) && ok;
  else ok = fail(`GET ${siteUrl}/legacy`, legacyRes.status) && ok;

  // Spot-check built bundle for pivot strings (best-effort)
  const html = await indexRes.text();
  const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (jsMatch) {
    const jsUrl = `${siteUrl}${jsMatch[1]}`;
    const js = await fetch(jsUrl).then((r) => r.text());
    if (js.includes("What We Do")) ok = pass("bundle contains What We Do") && ok;
    else ok = fail("bundle missing What We Do") && ok;
    if (js.includes("100+ Families Preserved")) ok = pass("bundle contains 100+ Families Preserved") && ok;
    else ok = fail("bundle missing Families Preserved fallback") && ok;
  } else {
    ok = fail("could not find main JS bundle in index.html") && ok;
  }

  return ok;
}

// --- Legacy family E2E (from legacy-smoke-test.mjs) ---
const BUCKET = "legacy-recordings";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part()}-${part()}-${part()}`;
}

function clientForUser(accessToken) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function createTestUser(email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
}

async function signIn(email, password) {
  const { data, error } = await admin.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

async function createCircleAsUser(session, name) {
  const sb = clientForUser(session.access_token);
  const inviteCode = generateInviteCode();
  const { data: circle, error: circleError } = await sb
    .from("family_circles")
    .insert({ name, invite_code: inviteCode, created_by: session.user.id })
    .select()
    .single();
  if (circleError) throw circleError;

  const { error: memberError } = await sb.from("family_members").insert({
    circle_id: circle.id,
    user_id: session.user.id,
    role: "keeper",
    display_name: name.split(" ")[0],
  });
  if (memberError) throw memberError;

  return { circle, inviteCode };
}

async function recordMemory(session, circleId, prompt) {
  const sb = clientForUser(session.access_token);
  const recordingId = crypto.randomUUID();
  const pathKey = `${circleId}/${recordingId}.webm`;
  const blob = new Blob([new Uint8Array([0x1a, 0x45, 0xdf, 0xa3])], { type: "audio/webm" });

  const { error: uploadError } = await sb.storage.from(BUCKET).upload(pathKey, blob, {
    contentType: "audio/webm",
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: publicUrl } = sb.storage.from(BUCKET).getPublicUrl(pathKey);

  const { data, error } = await sb
    .from("recordings")
    .insert({
      id: recordingId,
      circle_id: circleId,
      recorded_by: session.user.id,
      prompt,
      audio_url: publicUrl.publicUrl,
      duration_seconds: 3,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function listRecordings(session, circleId) {
  const sb = clientForUser(session.access_token);
  const { data, error } = await sb.from("recordings").select("id").eq("circle_id", circleId);
  if (error) throw error;
  return data ?? [];
}

async function runLegacyFamilyTest() {
  console.log("\n=== 3. Legacy family E2E (Oppong + Essel) ===\n");
  let ok = true;

  const { error: tableErr } = await admin.from("family_circles").select("id").limit(1);
  if (tableErr) {
    fail("family_circles table", tableErr.message);
    return false;
  }
  ok = pass("family_circles accessible") && ok;

  const ts = Date.now();
  const oppongEmail = `legacy-oppong-${ts}@beiza-smoke.test`;
  const esselEmail = `legacy-essel-${ts}@beiza-smoke.test`;
  const password = `SmokeTest!${ts}`;

  await createTestUser(oppongEmail, password);
  await createTestUser(esselEmail, password);
  ok = pass("created 2 test users") && ok;

  const oppongSession = await signIn(oppongEmail, password);
  const esselSession = await signIn(esselEmail, password);
  ok = pass("signed in both users") && ok;

  const oppong = await createCircleAsUser(oppongSession, "The Oppong");
  ok = pass(`Oppong circle created (${oppong.inviteCode})`) && ok;

  const oppongRec = await recordMemory(
    oppongSession,
    oppong.circle.id,
    "What is your earliest memory of home?",
  );
  ok = pass(`Oppong recording sealed (${oppongRec.id.slice(0, 8)}…)`) && ok;

  const essel = await createCircleAsUser(esselSession, "The Essel");
  ok = pass(`Essel circle created (${essel.inviteCode})`) && ok;

  const esselRec = await recordMemory(
    esselSession,
    essel.circle.id,
    "Who in your family taught you the most?",
  );
  ok = pass(`Essel recording sealed (${esselRec.id.slice(0, 8)}…)`) && ok;

  const oppongOwn = await listRecordings(oppongSession, oppong.circle.id);
  const oppongOther = await listRecordings(oppongSession, essel.circle.id);
  const esselOwn = await listRecordings(esselSession, essel.circle.id);
  const esselOther = await listRecordings(esselSession, oppong.circle.id);

  const isolationPass =
    oppongOwn.length >= 1 &&
    oppongOther.length === 0 &&
    esselOwn.length >= 1 &&
    esselOther.length === 0;

  if (isolationPass) ok = pass("RLS isolation (families cannot see each other)") && ok;
  else {
    ok = fail("RLS isolation", {
      oppongOwn: oppongOwn.length,
      oppongOther: oppongOther.length,
      esselOwn: esselOwn.length,
      esselOther: esselOther.length,
    }) && ok;
  }

  console.log("\n  Test family credentials (for manual UI check):");
  console.log(`    Oppong: ${oppongEmail} / ${password}`);
  console.log(`    Essel:  ${esselEmail} / ${password}`);
  console.log(`    Oppong invite: ${oppong.inviteCode}`);
  console.log(`    Essel invite:  ${essel.inviteCode}`);

  return ok;
}

async function main() {
  console.log("Beiza full smoke test");
  console.log(`Supabase: ${url}`);
  console.log(`Site: ${siteUrl}`);

  const a = await checkContent();
  const b = await checkProductionAssets();
  const c = await runLegacyFamilyTest();

  console.log("\n=== Summary ===\n");
  if (a && b && c) {
    console.log("ALL PASSED");
    process.exit(0);
  } else {
    console.log("SOME CHECKS FAILED");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
