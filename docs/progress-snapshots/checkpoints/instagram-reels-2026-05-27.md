# Checkpoint: Instagram reels + education home (2026-05-27)

Use this file to restore the site to the state after Chloe vs History reels, desktop breakpoints, and 9:16 card layout were shipped.

## Git restore point

| Field | Value |
|-------|--------|
| **Commit** | `853c086322c285022aef530c35f2f03c34c9bf74` |
| **Short** | `853c086` |
| **Tag** | `checkpoint/instagram-reels-2026-05-27` |
| **Branch** | `main` |
| **Remote** | `https://github.com/BeizaPlus/Beiza-Web.git` |

### Revert to this exact state

**Option A — checkout tag (read-only inspect or new branch):**

```bash
git fetch origin --tags
git checkout checkpoint/instagram-reels-2026-05-27
```

**Option B — reset `main` to this commit (destructive; only if you mean to roll back production):**

```bash
git fetch origin
git checkout main
git reset --hard 853c086
git push origin main
```

**Option C — new branch from checkpoint (safe experiment):**

```bash
git fetch origin --tags
git checkout -b restore/instagram-reels-2026-05-27 checkpoint/instagram-reels-2026-05-27
```

After any reset on `main`, Vercel will redeploy from that commit automatically.

---

## Commits included (oldest → newest)

| Commit | Summary |
|--------|---------|
| `f14c54d` | Fix site crash — register `historySeriesReelTexture` in `mediaAssets.ts` |
| `c183302` | Instagram reel playback + responsive reel rail on `/home` |
| `e51e6dc` | Fix desktop breakpoints — literal `min-[810px]:` Tailwind classes (not template literals) |
| `1256d1f` | Wire all 12 reels from scraped dataset JSON |
| `853c086` | Reel cards `aspect-[9/16]`, embed zoom `1.14×`, less letterboxing |

---

## What this checkpoint includes

### Instagram series (12 episodes)

- **Source data:** `src/data/chloe-vs-history-reels.json` (from Apify scrape `dataset_instagram-reel-scraper_2026-05-27`)
- **Episode builder:** `src/lib/instagramHistorySeries.ts` → `HISTORY_SERIES_EPISODES`
- **Embed helper:** `src/lib/instagramEmbed.ts` — `/reel/{shortCode}/embed/`
- **UI:** `src/components/landing/InstagramReelsSection.tsx`, `InstagramReelPoster.tsx`
- **Landing:** `/home` education section uses default `posts={HISTORY_SERIES_EPISODES}`

| # | Short code | Card title |
|---|------------|------------|
| 1 | `DVGZcKrCJE8` | Ancient Egypt |
| 2 | `DU8xKfXDnxl` | Tudor London |
| 3 | `DX4pN1wOgAy` | Marathon |
| 4 | `DVBDq7giDrm` | Victorian London |
| 5 | `DXKhOg4jtNl` | History deep dive |
| 6 | `DWRoDDDiGqX` | English mystery |
| 7 | `DVJ03NXjr9-` | French Revolution |
| 8 | `DV4BMjpjuFr` | Dancing plague |
| 9 | `DVli3L3iMht` | Ice age |
| 10 | `DX92yFaOOkm` | Woodstock |
| 11 | `DYurOfXuasO` | Gold rush |
| 12 | `DYIJNV7O-s1` | Swinging London |

**Posters:** Episode 1 uses local AI poster `public/images/beiza-history-series-reel-ep00-dvgzckrcje8.png`. Episodes 2–12 use scraped Instagram CDN thumbnails (may expire).

### Reel card layout constants

File: `src/components/landing/InstagramReelsSection.tsx`

| Constant | Value |
|----------|--------|
| Aspect ratio | `9/16` |
| Card width (phone) | `min(78vw, 260px)` |
| Card width (tablet) | `min(34vw, 280px)` |
| Card width (desktop) | `280px` |
| `EMBED_TOP_CROP_PX` | `62` |
| `EMBED_BOTTOM_CROP_PX` | `72` |
| `EMBED_SCALE` | `1.1` (110%) |
| `EMBED_WIDTH_PERCENT` | `110` |
| Playback | Inline iframe on load (no click-to-play gate) |

### Breakpoints (do not regress)

File: `src/lib/layoutBreakpoints.ts`

- Phone: ≤809px  
- Tablet: 810–1199px (`min-[810px]:…`)  
- Desktop: ≥1200px (`min-[1200px]:…`)  

**Rule:** Never use `` `${LAYOUT_TW.tabletUp}:flex` `` in `className` — Tailwind will not compile dynamic breakpoint strings in production.

### Other features shipped in same era (still on `main` at this commit)

- Welcome explore prompt (`WelcomeExplorePrompt.tsx`)
- Family strengths radar on tree profiles (`familyStrengths.ts`, `PersonStrengthsRadar.tsx`)
- Legacy galleries removed from education home crossfade
- `Navigation` restored on `/home` landing

---

## Key files to diff if something breaks later

```
src/data/chloe-vs-history-reels.json
src/lib/instagramHistorySeries.ts
src/lib/instagramEmbed.ts
src/lib/mediaAssets.ts
src/components/landing/InstagramReelsSection.tsx
src/components/landing/InstagramReelPoster.tsx
src/pages/Landing.tsx
src/lib/layoutBreakpoints.ts
src/components/Navigation.tsx
public/images/beiza-history-series-reel-ep00-dvgzckrcje8.png
public/images/beiza-history-series-reel-texture.png
```

---

## Regenerate dataset from scrape

```bash
node -e "
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('C:/Users/steve/Downloads/dataset_instagram-reel-scraper_2026-05-27_07-36-29-389.json','utf8'));
const slim=d.map(r=>({shortCode:r.shortCode,url:r.url,caption:(r.caption||'').split('\\n')[0].slice(0,120),poster:(r.images&&r.images[0])||(r.displayUrl)||null}));
fs.writeFileSync('src/data/chloe-vs-history-reels.json', JSON.stringify(slim,null,2));
"
```

---

## Known limitations at this checkpoint

- Instagram embed autoplay is controlled by Instagram/browser — may require tap on some devices.
- Scraped CDN poster URLs can 404 after expiry; fallback texture in `mediaAssets`.
- Only episode 0 has a permanent local AI poster; episodes 1–11 not batch-generated yet.

---

## Verify after restore

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 8101
```

Open `http://127.0.0.1:8101/home` — scroll Instagram rail, resize past 810px and 1200px for layout check.

---

*Created: 2026-05-27 · Author: Cursor session checkpoint*
