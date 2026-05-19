/**
 * Push Supabase server env vars to Vercel from local .env
 * Requires: npx vercel link (to the beizaplus.com project first)
 *
 * Usage: node scripts/set-vercel-supabase-env.mjs
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env in project root.");
    process.exit(1);
  }
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
}

function addEnv(name, value, environment) {
  const result = spawnSync(
    "npx",
    ["vercel", "env", "add", name, environment, "--force"],
    {
      cwd: root,
      input: value,
      encoding: "utf8",
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    },
  );
  if (result.status !== 0) {
    console.error(`Failed to set ${name} for ${environment}`);
    process.exit(result.status ?? 1);
  }
  console.log(`✓ ${name} → ${environment}`);
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceKey = env.VITE_SUPABASE_PRIVILEGED_KEY ?? env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Need VITE_SUPABASE_URL and VITE_SUPABASE_PRIVILEGED_KEY in .env");
  process.exit(1);
}

if (!fs.existsSync(path.join(root, ".vercel", "project.json"))) {
  console.error(`
Not linked to a Vercel project yet. Run first:
  cd Beiza-Web
  npx vercel link
  (pick the project that serves beizaplus.com — often "beiza-web" under BeizaPlus team)

Then run this script again.
`);
  process.exit(1);
}

const targets = ["production", "preview", "development"];

console.log("Setting Supabase API env on linked Vercel project…\n");

for (const target of targets) {
  addEnv("SUPABASE_URL", supabaseUrl, target);
  addEnv("SUPABASE_SERVICE_ROLE_KEY", serviceKey, target);
}

console.log(`
Done. Redeploy production for circle access codes to work:
  npx vercel --prod
Or: Vercel Dashboard → Deployments → Redeploy latest
`);
