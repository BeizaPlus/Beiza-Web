/**
 * Full-page screenshot for progress tracking (uses Playwright via npx).
 * Usage: node scripts/capture-fullpage.mjs [url] [output-path]
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const url = process.argv[2] ?? "http://localhost:8080/?studio=0";
const stamp = new Date().toISOString().slice(0, 10);
const defaultOut = path.join(root, "docs", "progress-snapshots", `beiza-fullpage-${stamp}.png`);
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : defaultOut;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const cmd = `npx --yes playwright@1.49.1 screenshot --browser chromium --full-page "${url}" "${outputPath}"`;
console.log(cmd);
execSync(cmd, { stdio: "inherit", cwd: root });
console.log(`Saved: ${outputPath}`);
