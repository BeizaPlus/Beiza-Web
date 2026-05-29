# Stable: Legacy Vault layout (2026-05-29)

Revert here when the vault page layout, scroll behavior, or styling breaks.

## Git restore point

| Field | Value |
|-------|--------|
| **Commit** | `ffb2031` |
| **Short** | `ffb2031` |
| **Tag** | `stable/legacy-vault-2026-05-29` |
| **Branch** | `main` |
| **Remote** | `https://github.com/BeizaPlus/Beiza-Web.git` |
| **Also includes** | `f0e97da` (family leader dual DNA radar), `b78d2cf` (tree connect + auto-layout + DNA axes) |

## What this stable build includes

- **Legacy Vault:** two-column layout — book + title on left, player + scrollable recordings on right
- **Scroll:** only the Open stories memory list scrolls; book, title, and Family story sequence player stay fixed
- **Styling:** black background, gold play/actions, dark memory cards
- **Studio preview:** 8 mock recordings for localhost vault
- **Rule:** open verification screenshots after capture (`.cursor/rules/open-screenshots-after-capture.mdc`)
- Prior stable features still on `main`: family tree connect, auto-layout, Family DNA axes, leader dual radar

## Revert options

**Option A — new branch from tag (safe):**

```bash
git fetch origin --tags
git checkout -b restore/legacy-vault stable/legacy-vault-2026-05-29
```

**Option B — reset main (destructive):**

```bash
git fetch origin --tags
git checkout main
git reset --hard stable/legacy-vault-2026-05-29
git push origin main
```

**Option C — cherry-pick one file from stable:**

```bash
git fetch origin --tags
git checkout stable/legacy-vault-2026-05-29 -- src/pages/legacy/vault.tsx
```

## Key files

| Area | Files |
|------|--------|
| Vault page layout | `src/pages/legacy/vault.tsx`, `LegacyLayout.tsx` |
| Vault components | `LegacyVaultSequencePlayer.tsx`, `LegacyVaultMemoryCard.tsx` |
| Studio mock data | `src/lib/legacy/studioPreviewData.ts` |
| Scroll styling | `src/index.css` (`.vault-recordings-scroll`) |
| Verification | `scripts/capture-legacy-vault-layout.mjs`, `docs/verification-screenshots/legacy-vault/` |

## Verify after restore

1. Open `/legacy/vault` — book + title on left, gold “Play full story” fixed on right
2. Scroll recordings list — page shell does not scroll; only memory cards move
3. Screenshot: `docs/verification-screenshots/legacy-vault/02-vault-recordings-scroll.png`
