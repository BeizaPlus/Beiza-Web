# Site links smoke — 2026-05-22

**Result:** 45/45 routes passed (local `http://127.0.0.1:8080`)

Open **`index.html`** in a browser for the full review grid (screenshot + pass/fail per route).

Re-run: `SMOKE_SITE_URL=http://127.0.0.1:8080 npm run smoke:site`

Fix applied: missing `useLegacySession` import in `LegacyTabBar.tsx` (crashed `/legacy`, `/legacy/vault`, `/vault` redirect).
