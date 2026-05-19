# Beiza Legacy (`/legacy`)

Live path: **beizaplus.com/legacy** (Vercel SPA — same `index.html` rewrite as the main app).

## Routes

| Path | Screen |
|------|--------|
| `/legacy` | Family Circle home — greeting, storage meter, CTAs |
| `/legacy/record` | Prepare → hold mic → upload → seal |
| `/legacy/vault` | Playback list |
| `/legacy/family` | Create/join circle, invite code, Legacy Keeper badge |

## Deploy checklist

1. Run migrations on your Supabase project (Dashboard → SQL or `supabase db push`).
2. Set secrets: `ANTHROPIC_API_KEY` on `generate-prompts` edge function.
3. Vercel env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (already used by Beiza-Web).
4. Push to `main` — Vercel deploys automatically.

## Sandbox

Full sun-stories monorepo: `beiza-legacy/` (gitignored `node_modules`, `.env`).
