# Stable versions — revert when things break

Tagged snapshots on `main` you can return to without hunting commits.

| Tag | What works | Commit |
|-----|------------|--------|
| `stable/legacy-vault-2026-05-29` | **Latest.** Vault two-column layout, scrollable recordings only, gold styling + prior tree/DNA stable | `ffb2031` |
| `stable/family-tree-dna-2026-05-28` | Tree connect + auto-layout, Family DNA axes, leader dual radar (Your DNA + circle overlay) | `f0e97da` |

## Quick revert (latest stable)

**Safe — new branch from stable tag (recommended):**

```bash
git fetch origin --tags
git checkout -b restore/legacy-vault stable/legacy-vault-2026-05-29
```

**Inspect stable code without changing branch:**

```bash
git fetch origin --tags
git checkout stable/legacy-vault-2026-05-29
```

**Roll back `main` to stable (destructive — redeploys production):**

```bash
git fetch origin --tags
git checkout main
git reset --hard stable/legacy-vault-2026-05-29
git push origin main
```

## List all stable tags

```bash
git tag -l "stable/*"
```

Full notes:

- Latest: `docs/progress-snapshots/checkpoints/legacy-vault-stable-2026-05-29.md`
- Prior: `docs/progress-snapshots/checkpoints/family-tree-dna-stable-2026-05-28.md`
