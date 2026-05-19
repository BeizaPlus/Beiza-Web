/**
 * Fails if marketing/app UI reintroduces Playfair, DM Sans, or font-* overrides.
 * TipTap editor CSS is excluded (admin blog editor only).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");

const FORBIDDEN_IN_UI = [
  /Playfair\s*Display/i,
  /DM\s*Sans/i,
  /\bfont-display\b/,
  /\bfont-heading\b/,
  /\bfont-sans\b/,
  /\bfont-serif\b/,
];

const SKIP = [path.join(src, "components", "tiptap")];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (SKIP.some((s) => full.startsWith(s))) continue;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts|css)$/.test(name)) files.push(full);
  }
  return files;
}

const violations = [];
for (const file of walk(src)) {
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of FORBIDDEN_IN_UI) {
    if (pattern.test(text)) {
      violations.push({ file: path.relative(root, file), pattern: pattern.source });
    }
  }
}

const indexCss = fs.readFileSync(path.join(src, "index.css"), "utf8");
if (/Playfair|DM\s*Sans/i.test(indexCss)) {
  violations.push({ file: "src/index.css", pattern: "Playfair/DM Sans @import" });
}

if (violations.length > 0) {
  console.error("Font audit failed:\n");
  for (const v of violations) {
    console.error(`  ${v.file} (${v.pattern})`);
  }
  process.exit(1);
}

console.log("Font audit passed — Manrope/Inter only in UI.");
