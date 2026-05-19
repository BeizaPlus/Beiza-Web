# Beiza Web — Legacy Product Summary

**Repo:** [BeizaPlus/Beiza-Web](https://github.com/BeizaPlus/Beiza-Web)  
**Live:** https://beizaplus.com  
**Stack:** Vite + React + Tailwind + Supabase (Vercel serverless API)

Last updated: May 2026 · branch `main`

---

## What shipped (recent)

### Landing & brand

| Area | Details |
|------|---------|
| **Voices that stayed** | Replaced testimonial carousel with vertical cards, chain motif, MadamRose featured card |
| **Hero image** | `beiza-elder-gye-nyame-hero.png` — cinematic portrait; Gye Nyame framing on `/heritage` |
| **Events portrait** | `beiza-ernestina-portrait-bw.png` — landing Events card fallback |
| **Homepage hero** | Full-bleed elder image + left gradient overlay; framing via Layout Studio |
| **Closing CTA** | Two-line subheading; “Explore the vault” → `/vault/explore` |

### `/heritage` — White Swan experience

- Route: **`/heritage`** · redirect **`/white-swan` → `/heritage`**
- Full page: hero, feature grid, White Swan callout, pricing comparison, consultation form, closing quote
- SEO title: *Beiza Heritage · Memorial & Legacy Coordination* (not “White Swan” in tab)
- Linked from Heritage pricing CTA, footer *Planning ahead? Heritage →*

### Legacy app (`/legacy`)

| Tier | Recording | Rename | Delete | Share | Storage |
|------|-----------|--------|--------|-------|---------|
| **Circle** (free) | Unlimited length | Yes | Locked (upsell) | No | 5 GB |
| **Keeper** ($4.99/mo) | Yes | Yes | Yes | Yes (fragment-protected) | 500 MB |
| **Heritage** ($200/yr) | Yes | Yes | Yes | Yes | Unlimited |

- Delete upsell → Keeper dialog → `/pricing`
- Tier override for dev: `VITE_LEGACY_TIER=keeper|heritage`

### Pricing & UI polish

- USD tiers on homepage + **`/pricing`**
- **CasketIcon** — gold stroke SVG replaces swan emoji in White Swan callouts
- Pricing cards: flex body + `mt-auto` CTA so all three buttons share one baseline

### Public explore

- **`/vault/explore`** — public vault covers only; click shows “private” message

### APIs & database

| Item | Path / table |
|------|----------------|
| Heritage inquiries | `POST /api/heritage-inquiry` → `heritage_inquiries` |
| Recording rename/delete RLS | `20260520T100000_legacy_recordings_update_delete.sql` |
| Heritage table | `20260520T120000_heritage_inquiries.sql` |

**Vercel env required for forms:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Hero image controls (Layout Studio)

- **Dev:** panel bottom-right by default  
- **Any env:** add `?studio=1` (hide with `?studio=0`)
- **Zoom:** 70%–160% with **− / +** and slider; pan with Background X/Y
- Applies to homepage, `/heritage`, and `/events` heroes (saved in `localStorage`)

---

## Asset naming convention

`[product]-[subject/content]-[usage]-[variant].[ext]`

See `public/images/ASSETS.md` for the current file list.

| File | Usage |
|------|--------|
| `beiza-elder-gye-nyame-hero.png` | Homepage, Heritage, Events heroes |
| `beiza-ernestina-portrait-bw.png` | Events / landing featured card |
| `the-leader-mockup.png` | What We Do product mockup |

---

## Key routes

| URL | Purpose |
|-----|---------|
| `/` | Landing |
| `/legacy` | Family circle app |
| `/legacy/record` | Voice recording |
| `/legacy/vault` | Memory vault |
| `/pricing` | Legacy curation pricing |
| `/heritage` | White Swan / Heritage experience |
| `/vault/explore` | Public vault covers |
| `/white-swan` | Redirects to `/heritage` |

---

## Deploy checklist

1. Push to `main` — Vercel auto-deploys  
2. Run Supabase migrations (recordings RLS + `heritage_inquiries`)  
3. Set `SUPABASE_SERVICE_ROLE_KEY` on Vercel for heritage form  
4. Hard-refresh after deploy to bust CDN cache on hero images  

---

## Recent commits (reference)

- `c06e61e` — Pricing CTA alignment, CasketIcon, outro two-line copy  
- `54f4f82` — Cinematic hero image, zoom controls (Layout Studio)  
- `1b29eec` — Heritage page, Gye Nyame hero, USD pricing, vault explore  
- `8b8fd24` — Voices section, free-tier recording/rename, Keeper upsell  

---

## Docs elsewhere

- `LEGACY.md` — `/legacy` routes and deploy  
- `docs/HERITAGE_PAGE.md` — Heritage hero + SEO notes  
- `public/images/ASSETS.md` — image naming  
