# Beiza website progress snapshots

Full-page PNG captures to track design and copy iteration over time.

| File | Source |
|------|--------|
| `beiza-fullpage-YYYY-MM-DD.png` | Local dev (`localhost:8080/?studio=0`) — homepage |
| `beiza-fullpage-production-YYYY-MM-DD.png` | Live [beizaplus.com](https://beizaplus.com/) |
| `beiza-legacy-fullpage-YYYY-MM-DD.png` | Local `/legacy` route |

## Layout JSON

| File | Purpose |
|------|---------|
| `landing-layout.json` | Baseline slider values (hero, sections) — commit snapshots as `landing-layout-YYYY-MM-DD.json` |

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
