# Heritage / White Swan page

## Route

- `/heritage` — main experience page
- `/white-swan` — redirects to `/heritage` (see `vercel.json`)

## Hero image

`/public/images/beiza-elder-gye-nyame-hero.png`

Full-bleed background on the Heritage hero. Overlay:

`linear-gradient(to right, rgba(0,0,0,0.88) 45%, rgba(0,0,0,0.15) 100%)`

Do not blur, desaturate, or crop the Gye Nyame carved panel from frame.

The Gye Nyame (Adinkra) means “except God / nothing is greater” — reference in subheading copy.

## SEO

Browser title: **Beiza Heritage · Memorial & Legacy Coordination** (not “White Swan”).

## Consultation API

`POST /api/heritage-inquiry` → `heritage_inquiries` table (service role).

Requires `SUPABASE_SERVICE_ROLE_KEY` on Vercel.

## Asset naming

See `public/images/ASSETS.md`.
