/**
 * Applies tree canvas migration (tree_edges + canvas positions).
 * Requires SUPABASE_DB_PASSWORD in .env (Dashboard → Settings → Database).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return {};
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
const projectRef = (env.VITE_SUPABASE_URL ?? "").match(/https:\/\/([^.]+)/)?.[1];
const password = env.SUPABASE_DB_PASSWORD ?? process.env.SUPABASE_DB_PASSWORD;

if (!projectRef) {
  console.error("Missing VITE_SUPABASE_URL in .env");
  process.exit(1);
}
if (!password) {
  console.error(
    "Missing SUPABASE_DB_PASSWORD in .env — add your database password from Supabase Dashboard → Settings → Database",
  );
  process.exit(1);
}

const sql = postgres({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: "postgres",
  username: "postgres",
  password,
  ssl: "require",
  max: 1,
});

const migrationFile = "20260519T180000_tree_edges_canvas_positions.sql";

async function main() {
  const filePath = path.join(root, "supabase", "migrations", migrationFile);
  const body = fs.readFileSync(filePath, "utf8");
  console.log(`Applying ${migrationFile}...`);
  await sql.unsafe(body);
  console.log("  OK");

  const [{ exists }] = await sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'tree_edges'
    ) AS exists
  `;
  console.log("tree_edges exists:", exists);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
