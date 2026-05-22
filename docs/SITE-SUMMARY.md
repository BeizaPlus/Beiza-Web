# Beiza site summary

**Last updated:** 22 May 2026 · branch `main` · live https://beizaplus.com

---

## What Beiza is

Beiza is a **family legacy platform** that combines:

1. **Storyworth-style recording** — interview prompts, magic-link sign-in, private voice vault  
2. **Cultural education** — immersion films and Adinkra symbols by region  
3. **Family tree & circles** — people, biographies, recordings linked to nodes  
4. **Farewell & heritage** — memorial dignity (White Swan, Gye Nyame, homegoing)

---

## Layout system (Framer-tier)

### Breakpoints (3 tiers)

| Tier | Width | Studio label |
|------|--------|----------------|
| **Phone** | ≤809px | Phone |
| **Tablet** | 810–1199px | Tablet |
| **Desktop** | ≥1200px | Desktop |

Source of truth: `src/lib/layoutBreakpoints.ts`

### Canonical JSON (edit these, then reload)

| File | Controls |
|------|----------|
| `src/data/beiza-layout-canonical.json` | Record page, nav rail, site padding, heritage hero, welcome UI rules |
| `src/data/welcome-gate-canonical.json` | Welcome gate crops + locale rail/toolbar |
| `src/lib/layoutCanonical.ts` | Imports both — wired into studio defaults |

Archive copies: `docs/progress-snapshots/record-page-canonical.json`, `legacy-nav-canonical.json`, `legacy-record-station-canonical.json`

### Studio localStorage keys (clear if layout looks stale)

- `beiza-record-page-studio`
- `beiza-page-layout-studio:legacy-auth`
- `beiza-legacy-nav-studio`
- `beiza-site-padding-studio`
- `welcome-gate-studio`

---

## Primary user journeys

| Journey | Entry | Outcome |
|---------|--------|---------|
| Discover | `/` welcome gate | Pick Education, Legacy, or Farewell — center card full color |
| Build legacy | `/home` → `/legacy/record` | Sign in → record station (mic) → vault |
| Grow tree | `/legacy/circle` | Sign in → family tree |
| Honor farewell | `/farewell` | Heritage memorial experience |
| Read prompts | `/education/story-questions` | SEO article + links to vault |

---

## Legacy app shell (`/legacy/*`)

### Header (site-wide, locked)

**Vault · Circle · Blog** — `src/config/productNav.ts` (not CMS-overridden)

### Record station (`/legacy/record`)

Single full-viewport hero station — no document scroll.

| State | Behaviour |
|-------|-----------|
| **Logged out** (any legacy tab: Home, Tree, Record, Vault, Invite) | Same record sign-in screen; tab URL updates active highlight only |
| **Signed in** on Record | Same shell; hero copy hides; **mic takes center**; upload/seal in station panel below |
| **Signed in** on other tabs | Real pages (home, tree, vault, family) via horizontal tab bar |

Implementation: `LegacyLayout.tsx`, `LegacyShellProvider`, `RecordStationViewport.tsx`, `LegacyTabRail.tsx`

### Desktop record defaults (canonical)

- Hero: posX 80, posY 67, scale 106, text left, overlay 68  
- Copy: offsetX 12.5vw, column 32rem, email 17.5rem (avoids nav rail overlap)  
- Signed-in station: legacy-auth layout — offsetY 12.5vh, maxWidth 23rem  
- Nav rail: offsetXPercent 79, offsetYPercent 55, maxWidth 23.5rem  
- Site padding: paddingX 6.75rem, contentIndent 0  

### Welcome gate (`/`)

- Center path card (**Legacy**) always full color; side cards show color in center strip  
- Phone: snapped card gets full color  
- Locale rail: CN/GH/EN codes no longer clipped (wider label column)

---

## Route map (marketing + legacy)

| Route | Page |
|-------|------|
| `/` | Welcome gate |
| `/home` | Education landing |
| `/farewell` | Farewell / White Swan (`Heritage.tsx`) |
| `/heritage` | Life-story marketing landing |
| `/legacy/record` | Record station |
| `/legacy` | Legacy home |
| `/legacy/circle` | Family tree |
| `/legacy/vault` | Memory vault |
| `/legacy/family` | Invite / circle setup |

---

## Technical stack

- **Frontend:** React, Vite, Tailwind, React Router, Framer Motion  
- **Content:** Supabase when configured; static fallbacks in `src/lib/fallbackContent.ts`  
- **SEO/AEO:** `src/lib/seo/siteSeo.ts`, `SeoManager`, JSON-LD  
- **Assets:** Local under `/public/images/` — `src/lib/mediaAssets.ts` (Storyworth SEO names)

---

## Key files

| Area | File |
|------|------|
| Routes & links | `src/lib/beizaMasterLinks.ts` |
| Product nav | `src/config/productNav.ts` |
| Layout canonical | `src/lib/layoutCanonical.ts`, `src/data/*.json` |
| Breakpoints | `src/lib/layoutBreakpoints.ts` |
| Record studio | `src/lib/legacy/recordPageStudio.ts` |
| Legacy shell | `src/components/legacy/LegacyLayout.tsx` |
| Welcome studio | `src/lib/welcomeStudio.ts` |
| Images | `src/lib/mediaAssets.ts` |
| Philosophy | `docs/BEIZA-PHILOSOPHY.md` |
| Link tree | `docs/SITE-LINK-TREE.md` |

---

## Recent `main` commits (layout pass)

| Commit | Summary |
|--------|---------|
| `c72954b` | Fix legacy tabs not navigating after sign-in (typo + `LegacyShellProvider`) |
| `c92310a` | Auth sync; signed-in vs logged-out shell split |
| `245b7e7` | Record sign-in row vs nav rail overlap (email 17.5rem) |
| `daa52a7` | Canonical layout JSON; unified legacy/welcome flows |
| `c1ad363` | Record CTA overlap fix (tablet/desktop) |
| `8f25b57` | Framer-tier studio; welcome/record/mobile padding |
| `34c6a78` | Local SEO images + site SEO docs |

---

## Deploy checklist

1. `npm run build`  
2. `npm run links:check`  
3. `npm run media:check`  
4. Confirm `public/sitemap.xml` and `robots.txt`  
5. Hard-refresh CDN after deploy  
6. Smoke record: `/legacy/record` logged out → sign in → mic → tab to Vault/Home

---

## Next step (baseline complete)

Base layout, routing, canonical JSON, and legacy sign-in → record station flow are in place on `main`. Next work can build on this without re-tuning breakpoints or re-pasting studio JSON from chat.

## Deferred (saved for later)

| Doc | Purpose |
|-----|---------|
| `docs/design-references/beiza-volume-slider-plans-ui.md` | Volume slider + dark tier cards (Resend Plans–style reference) for future `/pricing` or upgrade UI — **not building now** |
