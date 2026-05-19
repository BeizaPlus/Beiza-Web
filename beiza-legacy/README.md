# beiza-legacy

Sandbox copy of [sun-stories-claude](https://github.com/idmtr/sun-stories-claude) inside **Beiza-Web**.

## Workflow

1. **Iterate here** — voice recording UX, vault, family circle, Claude prompts (reference implementation).
2. **Production route** — `/legacy` lives in parent `src/` (Beiza design tokens, your Supabase).
3. **When stable** — port patterns/components from this folder into `../src/` and remove duplication.

## Local dev (optional)

Requires Docker Desktop for `supabase start`, or link to your remote Supabase project.

```bash
cd beiza-legacy
pnpm install
cp .env.example .env
supabase start   # or use remote project
pnpm dev
```

## Parent repo

- Migrations: `../supabase/migrations/20260519T120000_legacy_family_vault.sql`
- Edge function: `../supabase/functions/generate-prompts/`
- App routes: `../src/pages/legacy/`
