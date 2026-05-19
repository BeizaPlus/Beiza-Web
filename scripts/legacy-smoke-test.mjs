/**
 * End-to-end Legacy vault smoke test (two families + RLS isolation).
 * Requires: migrations applied, SUPABASE_URL + service role in .env
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
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

if (!url || !serviceKey || !anonKey) {
  console.error("Missing VITE_SUPABASE_URL, VITE_SUPABASE_PRIVILEGED_KEY, or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "legacy-recordings";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part()}-${part()}-${part()}`;
}

async function ensureTables() {
  const { error } = await admin.from("family_circles").select("id").limit(1);
  if (error?.message?.includes("schema cache")) {
    throw new Error(
      "family_circles table missing. Run: node scripts/apply-legacy-migration.mjs (requires SUPABASE_DB_PASSWORD in .env)",
    );
  }
  if (error) throw error;
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

function clientForUser(accessToken) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
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
    .insert({
      name,
      invite_code: inviteCode,
      created_by: session.user.id,
    })
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
      title: null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function listRecordings(session, circleId) {
  const sb = clientForUser(session.access_token);
  const { data, error } = await sb.from("recordings").select("id, prompt, circle_id").eq("circle_id", circleId);
  if (error) throw error;
  return data ?? [];
}

async function main() {
  const report = { errors: [], families: {} };

  try {
    await ensureTables();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  const ts = Date.now();
  const oppongEmail = `legacy-oppong-${ts}@beiza-smoke.test`;
  const esselEmail = `legacy-essel-${ts}@beiza-smoke.test`;
  const password = `SmokeTest!${ts}`;

  try {
    await createTestUser(oppongEmail, password);
    await createTestUser(esselEmail, password);
  } catch (e) {
    report.errors.push(`createUser: ${e.message}`);
  }

  const oppongSession = await signIn(oppongEmail, password);
  const esselSession = await signIn(esselEmail, password);

  const oppong = await createCircleAsUser(oppongSession, "The Oppong");
  report.families.oppong = {
    circleId: oppong.circle.id,
    inviteCode: oppong.inviteCode,
    recordingId: null,
  };

  const oppongRecording = await recordMemory(
    oppongSession,
    oppong.circle.id,
    "What is your earliest memory of home?",
  );
  report.families.oppong.recordingId = oppongRecording.id;

  const essel = await createCircleAsUser(esselSession, "The Essel");
  report.families.essel = {
    circleId: essel.circle.id,
    inviteCode: essel.inviteCode,
    recordingId: null,
  };

  const esselRecording = await recordMemory(
    esselSession,
    essel.circle.id,
    "Who in your family taught you the most?",
  );
  report.families.essel.recordingId = esselRecording.id;

  const oppongSeesOppong = await listRecordings(oppongSession, oppong.circle.id);
  const oppongSeesEssel = await listRecordings(oppongSession, essel.circle.id);
  const esselSeesEssel = await listRecordings(esselSession, essel.circle.id);
  const esselSeesOppong = await listRecordings(esselSession, oppong.circle.id);

  report.isolation = {
    oppongOwnCount: oppongSeesOppong.length,
    oppongOtherCount: oppongSeesEssel.length,
    esselOwnCount: esselSeesEssel.length,
    esselOtherCount: esselSeesOppong.length,
    pass:
      oppongSeesOppong.length >= 1 &&
      oppongSeesEssel.length === 0 &&
      esselSeesEssel.length >= 1 &&
      esselSeesOppong.length === 0,
  };

  const { data: adminRows } = await admin
    .from("family_circles")
    .select("id, name, invite_code")
    .in("id", [oppong.circle.id, essel.circle.id]);

  report.adminSnapshot = {
    circles: adminRows,
    recordings: await admin.from("recordings").select("id, circle_id, prompt").in("circle_id", [
      oppong.circle.id,
      essel.circle.id,
    ]),
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.isolation.pass) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
