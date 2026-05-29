# Stable versions — revert when things break

Tagged snapshots on `main` you can return to without hunting commits.

| Tag | What works | Commit |
|-----|------------|--------|
| `stable/family-tree-dna-2026-05-28` | Tree connect + auto-layout, Family DNA axes, leader dual radar (Your DNA + circle overlay) | `f0e97da` |

## Quick revert

**Safe — new branch from stable tag (recommended):**

```bash
git fetch origin --tags
git checkout -b restore/family-tree-dna stable/family-tree-dna-2026-05-28
```

**Inspect stable code without changing branch:**

```bash
git fetch origin --tags
git checkout stable/family-tree-dna-2026-05-28
```

**Roll back `main` to stable (destructive — redeploys production):**

```bash
git fetch origin --tags
git checkout main
git reset --hard stable/family-tree-dna-2026-05-28
git push origin main
```

## List all stable tags

```bash
git tag -l "stable/*"
```

Full notes: `docs/progress-snapshots/checkpoints/family-tree-dna-stable-2026-05-28.md`
