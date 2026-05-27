/**
 * Generate one BEIZA-style Instagram reel poster via OpenAI Images API.
 *
 * Usage:
 *   node scripts/generate-instagram-reel-poster.mjs 0
 *
 * Reads OPENAI_API_KEY from ER doc/.env (or process.env).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATASET =
  process.env.INSTAGRAM_DATASET ??
  "C:/Users/steve/Downloads/dataset_instagram-reel-scraper_2026-05-27_07-36-29-389.json";
const ER_ENV = path.resolve("C:/Users/steve/ER doc/.env");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

function posterPrompt({ cardTitle, cardSubtitle, eraLabel, caption }) {
  return [
    "Cinematic vertical documentary thumbnail for an education history series, aspect ratio 4:5.",
    `Subject: ${cardTitle} — ${cardSubtitle} (${eraLabel}).`,
    `Mood from reel: ${(caption || "").replace(/\s+/g, " ").slice(0, 160)}.`,
    "Warm amber gold highlights (#E6A817) on deep black shadows, subtle film grain, museum-quality historical atmosphere.",
    "No text, no logos, no watermarks, no faces looking at camera, no UI chrome.",
    "Photorealistic environment or artifact focus, premium Netflix-doc still frame.",
  ].join(" ");
}

const EPISODE_META = [
  {
    cardTitle: "Ancient Egypt",
    cardSubtitle: "Temples & tombs",
    eraLabel: "Ancient world",
    placeLabel: "Nile civilization",
  },
  {
    cardTitle: "Tudor London",
    cardSubtitle: "Streets of smoke",
    eraLabel: "Early modern",
    placeLabel: "England",
  },
  {
    cardTitle: "Marathon",
    cardSubtitle: "Ancient Greece",
    eraLabel: "Classical era",
    placeLabel: "Running legend",
  },
  {
    cardTitle: "Victorian London",
    cardSubtitle: "Top hat era",
    eraLabel: "19th century",
    placeLabel: "Gaslit streets",
  },
  {
    cardTitle: "History deep dive",
    cardSubtitle: "Extended episode",
    eraLabel: "Time travel",
    placeLabel: "Chloe vs History",
  },
  {
    cardTitle: "English mystery",
    cardSubtitle: "Famous case",
    eraLabel: "Victorian",
    placeLabel: "Detective trail",
  },
  {
    cardTitle: "French Revolution",
    cardSubtitle: "Paris unrest",
    eraLabel: "Revolution",
    placeLabel: "Liberté",
  },
  {
    cardTitle: "Dancing plague",
    cardSubtitle: "Strasbourg",
    eraLabel: "Medieval mystery",
    placeLabel: "Mass hysteria",
  },
  {
    cardTitle: "Ice age",
    cardSubtitle: "Frozen world",
    eraLabel: "Prehistory",
    placeLabel: "Mammoth steppe",
  },
  {
    cardTitle: "Woodstock",
    cardSubtitle: "1969",
    eraLabel: "Counterculture",
    placeLabel: "Festival fields",
  },
  {
    cardTitle: "Gold rush",
    cardSubtitle: "San Francisco",
    eraLabel: "American west",
    placeLabel: "1849 dreams",
  },
  {
    cardTitle: "Swinging London",
    cardSubtitle: "1960s",
    eraLabel: "Modern era",
    placeLabel: "Mod culture",
  },
];

const index = Number(process.argv[2] ?? "0");
const reels = JSON.parse(fs.readFileSync(DATASET, "utf8"));
if (!reels[index]) {
  console.error(`No reel at index ${index} (have ${reels.length})`);
  process.exit(1);
}

const reel = reels[index];
const meta = EPISODE_META[index] ?? {
  cardTitle: "History episode",
  cardSubtitle: reel.shortCode,
  eraLabel: "History",
  placeLabel: "Time travel",
};

const env = { ...loadEnv(ER_ENV), ...process.env };
const apiKey = env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY (set in ER doc/.env or env)");
  process.exit(1);
}

const outName = `beiza-history-series-reel-ep${String(index).padStart(2, "0")}-${reel.shortCode.toLowerCase()}.png`;
const outPath = path.join(ROOT, "public", "images", outName);
const prompt = posterPrompt({ ...meta, caption: reel.caption });

console.log(`Generating poster for index ${index} (${reel.shortCode})…`);
console.log(`Prompt preview: ${prompt.slice(0, 120)}…`);

const res = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: "1024x1536",
    quality: "high",
  }),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`OpenAI error ${res.status}:`, err);
  process.exit(1);
}

const json = await res.json();
const imagePayload = json.data?.[0];
let buffer;

if (imagePayload?.b64_json) {
  buffer = Buffer.from(imagePayload.b64_json, "base64");
} else if (imagePayload?.url) {
  const imgRes = await fetch(imagePayload.url);
  if (!imgRes.ok) {
    console.error("Failed to download image URL");
    process.exit(1);
  }
  buffer = Buffer.from(await imgRes.arrayBuffer());
} else {
  console.error("Unexpected OpenAI response:", JSON.stringify(json).slice(0, 400));
  process.exit(1);
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buffer);
console.log(`Saved → public/images/${outName}`);
console.log(`Use posterSrc: "/images/${outName}" for shortCode ${reel.shortCode}`);
