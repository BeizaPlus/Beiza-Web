# Checkpoint: Welcome gate layout (2026-05-27)

**Golden reference:** `http://localhost:8080/welcome` — BEIZA wordmark, three path cards, locale rail on the right.

Use this file to restore or verify the welcome screen matches the approved layout.

## Visual reference

- Screenshot: `docs/progress-snapshots/checkpoints/welcome-gate-layout-2026-05-27.png`
- Route: `/welcome` (App redirects `/` → `/welcome`)

## Layout source of truth

| File | Purpose |
|------|---------|
| `src/data/welcome-gate-canonical.json` | Default studio values (logo, card crops, locale rail, toolbar) |
| `src/pages/WelcomeGate.tsx` | Welcome page structure |
| `src/lib/welcomeStudio.ts` | Loads canonical + optional `localStorage` override |

**Important:** If your browser has saved studio tweaks, they live under `localStorage` key `welcome-gate-studio`. Production and fresh browsers use **only** `welcome-gate-canonical.json`.

To lock local tweaks into the repo:

1. Open `/welcome?studio=1`
2. Welcome studio → **Copy JSON (all regions)**
3. Replace contents of `src/data/welcome-gate-canonical.json` with `{ "global": ..., "locales": ... }`
4. Commit and push

## Approved layout (from screenshot)

- **Header:** BEIZA wordmark only (`useMascot: false`), tagline, subheading (“Where would you like to begin?” / locale equivalent)
- **Cards (desktop):** 3-column grid — Education · Legacy · Farewell
- **Locale rail:** Right edge — active row shows flag + **GH** + gold dot; inactive **EN / ES / FR / CN** stay visible in grey with grey dots; sun toggle below (`showInactiveCodes: true`)
- **Studio (dev only):** Bottom-right dock — Site bounds, Welcome studio, Layout studio

## Global defaults (canonical)

| Setting | Value |
|---------|--------|
| `logoScale` | `1.65` |
| `useMascot` | `false` |
| `headerTopPaddingRem` | `2.75` |
| `taglineFontPx` | `9` |
| `subheadingFontRem` | `1.0625` |
| `showLocaleRailBg` | `false` |

## Verify locally

```bash
npm run dev
# opens http://localhost:8080/welcome
```

Hard refresh. Compare to reference PNG. Test at **1366px** width for desktop three-card layout.

## Reset browser overrides

In devtools console on `/welcome`:

```js
localStorage.removeItem('welcome-gate-studio');
location.reload();
```

---

*Created: 2026-05-27 · Approved layout from user screenshot on :8080/welcome*
