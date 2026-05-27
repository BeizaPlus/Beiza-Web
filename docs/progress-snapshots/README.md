# Beiza website progress snapshots

## Revert checkpoints (git tags)

| Tag | Doc | When |
|-----|-----|------|
| `checkpoint/instagram-reels-2026-05-27` | [checkpoints/instagram-reels-2026-05-27.md](./checkpoints/instagram-reels-2026-05-27.md) | 12 Chloe vs History reels, 9:16 cards, desktop breakpoints |
| *(reference)* | [checkpoints/welcome-gate-2026-05-27.md](./checkpoints/welcome-gate-2026-05-27.md) | Welcome `/welcome` on `:8080` — wordmark + 3 cards + locale rail |

```bash
git fetch origin --tags
git checkout checkpoint/instagram-reels-2026-05-27
```

---

Full-page PNG captures to track design and copy iteration over time.

| File | Source |
|------|--------|
| `beiza-fullpage-YYYY-MM-DD.png` | Local dev (`localhost:8080/?studio=0`) — homepage |
| `beiza-fullpage-production-YYYY-MM-DD.png` | Live [beizaplus.com](https://beizaplus.com/) |
| `beiza-legacy-fullpage-YYYY-MM-DD.png` | Local `/legacy` route |

## Layout JSON

**Source of truth (edit these, then reload):**

| File | Purpose |
|------|---------|
| `src/data/beiza-layout-canonical.json` | Record page, nav rail, site padding, heritage hero, welcome UI rules |
| `src/data/welcome-gate-canonical.json` | Welcome gate crops + locale rail/toolbar |

Imported by `src/lib/layoutCanonical.ts`. Older snapshots below are archives only.

| File | Purpose |
|------|---------|
| `landing-layout.json` | Baseline slider values (hero, sections) — commit snapshots as `landing-layout-YYYY-MM-DD.json` |
| `record-page-canonical.json` | Archive — see `beiza-layout-canonical.json` |
| `legacy-record-station-canonical.json` | Archive — signed-in station (`legacy-auth`) |
| `legacy-nav-canonical.json` | Archive — record vertical tab rail |

In **Layout studio** (local dev): **Copy JSON** → clipboard, or **Save JSON** → downloads `landing-layout-YYYY-MM-DD.json`.

## Capture again

```bash
npm run dev
# other terminal:
node scripts/capture-fullpage.mjs
# or:
npx playwright screenshot --browser chromium --full-page "http://localhost:8080/?studio=0" docs/progress-snapshots/beiza-fullpage-$(date +%Y-%m-%d).png
```

On Windows PowerShell, date stamp manually or use the script default path.
