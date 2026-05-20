# Smoke test run — 2026-05-19

**Site:** `http://127.0.0.1:8080` (Vite dev)  
**Circle:** Oppong · access code `B7AB0E` · 4 memories

## Results

| Suite | Status | Log |
|-------|--------|-----|
| `npm run smoke:full` | **PASS** (all) | `smoke-full.log` |
| `npm run smoke:legacy` | **PASS** | `smoke-legacy.log` |
| `npm run smoke:screenshots` | **PASS** | `smoke-screenshots-final.log` |
| `npm run smoke:tree-connect` | **PASS** | `smoke-tree-connect-final.log` |
| `capture-full-site-smoke.mjs` | **PASS** (14 routes) | `smoke-full-site.log` |
| `npm run smoke` (product) | **PARTIAL** (35 pass / 6 fail / 3 warn) | `smoke-product.log` |

### Product smoke failures (environment / schema — not tree UI)

- Missing tables: `heritage_inquiries`, `event_stories` (migrations not applied on remote DB)
- Production API routes (`/api/recovery-request`, `/api/heritage-inquiry`) return 500 without service role on `beizaplus.com`
- `find main bundle in index.html` — dev index vs production bundle check

### Fix applied during this run

- Installed **`@dagrejs/dagre`** — tree canvas was 500 on `autoLayoutTree.ts` and React Flow never mounted.

## Screenshots (this folder)

| File | Description |
|------|-------------|
| `01-circle-directory.png` | `/circle` directory |
| `02-access-gate.png` | Private circle enter gate |
| `03-access-gate-code-filled.png` | Code filled |
| `04-family-tree-canvas.png` | Oppong tree canvas |
| `04b-tree-node-selected.png` | Node selected |
| `04c-person-side-panel.png` | **Profile side panel** (editable) |
| `05-legacy-family-tree.png` | `/legacy/circle` tree |
| `06-legacy-family-tree-mobile.png` | Mobile tree |
| `tree-connect/*.png` | Edge connect, context menu, disconnect, edit dropdown |

## Full-site route screenshots

`docs/progress-snapshots/full-smoke-smoke-run-2026-05-19/` — home, heritage, pricing, legacy vault, Oppong tree, etc.

## Re-run

```bash
# Terminal 1
npm run dev

# Terminal 2
$env:SMOKE_SITE_URL="http://127.0.0.1:8080"
$env:SMOKE_OUT_DIR="smoke-run-2026-05-19"
npm run smoke:screenshots
npm run smoke:tree-connect
node scripts/capture-full-site-smoke.mjs
npm run smoke
npm run smoke:legacy
npm run smoke:full
```
