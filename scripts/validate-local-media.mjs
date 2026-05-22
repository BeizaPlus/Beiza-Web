/**
 * Ensures fallback/UI code does not reference Framer CDN or removed image paths.
 * Usage: npm run media:check
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const imagesDir = join(root, "public", "images");

const failures = [];
const scanned = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "node_modules" || name === "admin") continue;
      walk(path);
      continue;
    }
    if (!/\.(tsx?|jsx?|mjs)$/.test(name)) continue;
    scanned.push(path);
  }
}

walk(srcDir);

const forbidden = [
  { pattern: /framerusercontent\.com/g, msg: "Framer CDN URL in src (use MEDIA_ASSETS)" },
  { pattern: /\/assets\/legacy-hero\.jpg/g, msg: "Deprecated /assets/legacy-hero.jpg" },
  { pattern: /\/assets\/ancestry-scene/g, msg: "Deprecated /assets/ancestry-scene" },
  { pattern: /adinkra-hands-hero\.png/g, msg: "Renamed — use beiza-storyworth-home-intentional-legacy-adinkra-hero.png" },
];

for (const file of scanned) {
  const text = readFileSync(file, "utf8");
  if (file.includes("validate-local-media")) continue;
  for (const { pattern, msg } of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) failures.push(`${msg} — ${file.replace(root + "\\", "").replace(root + "/", "")}`);
  }
}

const manifest = readFileSync(join(root, "src/lib/mediaAssets.ts"), "utf8");
const fileNames = [
  ...new Set([...manifest.matchAll(/beiza-storyworth-[a-z0-9.-]+\.(?:png|jpg|jpeg|webp)/g)].map((m) => m[0])),
];
for (const name of fileNames) {
  const file = join(imagesDir, name);
  if (!existsSync(file)) {
    failures.push(`MEDIA_ASSETS missing file: ${name}`);
  }
}

console.log("Local media validation");
console.log(`  scanned ${scanned.length} source files`);

if (failures.length) {
  console.error(`  ✗ ${failures.length} issue(s):`);
  for (const f of failures) console.error(`    - ${f}`);
  process.exit(1);
}

console.log(`  ✓ No forbidden CDN/legacy paths in src`);
console.log(`  ✓ ${fileNames.length} manifest image files exist on disk`);
process.exit(0);
