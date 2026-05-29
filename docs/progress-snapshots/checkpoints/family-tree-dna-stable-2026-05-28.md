# Stable: Family tree + Family DNA (2026-05-28)

Revert here when tree connections, layout, or DNA charts break.

## Git restore point

| Field | Value |
|-------|--------|
| **Tag** | `stable/family-tree-dna-2026-05-28` |
| **Branch** | `main` |
| **Remote** | `https://github.com/BeizaPlus/Beiza-Web.git` |

Commit hash is filled in after tag is created — run:

```bash
git rev-parse stable/family-tree-dna-2026-05-28
```

## What this stable build includes

- **Tree canvas:** drag-to-connect saves (studio preview + Supabase), auto-layout after connect, nodes not stacked
- **Family DNA axes:** Finance, Creativity, Morale, Religion, Community
- **Family leader profile:** two charts — **Your DNA** (personal) + **Family DNA** (all members overlaid on one radar, color per person)
- **Non-leader profile:** single **Your DNA** chart
- Prior session fixes still on `main`: reels play, record loop, vault styling, studio chrome toggles

## Revert options

**Option A — new branch from tag (safe):**

```bash
git fetch origin --tags
git checkout -b restore/family-tree-dna stable/family-tree-dna-2026-05-28
```

**Option B — reset main (destructive):**

```bash
git fetch origin --tags
git checkout main
git reset --hard stable/family-tree-dna-2026-05-28
git push origin main
```

**Option C — cherry-pick one file from stable:**

```bash
git fetch origin --tags
git checkout stable/family-tree-dna-2026-05-28 -- src/components/legacy/family-tree/FamilyTreeCanvas.tsx
```

## Key files

| Area | Files |
|------|--------|
| Tree connect + layout | `FamilyTreeCanvas.tsx`, `treeCanvasPersistence.ts`, `studioPreviewData.ts` |
| DNA scoring | `familyStrengths.ts`, `radarChartGeometry.ts` |
| Personal radar | `PersonStrengthsRadar.tsx` |
| Circle overlay radar | `FamilyCircleStrengthsRadar.tsx`, `PersonBiographyPanel.tsx` |
| Verification | `scripts/capture-legacy-tree-connect.mjs`, `docs/verification-screenshots/tree-connect/` |

## Verify after restore

1. Open `/legacy/circle` — two nodes separated, connect with gold handles
2. Click family leader — Profile shows **Your DNA** + **Family DNA** with two shapes on one chart
3. Toast: **Connection saved** after linking nodes
