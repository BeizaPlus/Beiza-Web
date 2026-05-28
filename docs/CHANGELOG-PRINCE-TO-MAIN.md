# Changelog: Prince baseline → current `main`

**Audience:** Prince (blackprince001) — what changed on Beiza-Web after your foundation work.  
**Written:** 27 May 2026  
**Current production commit:** `ff4def7` on `main` → https://www.beizaplus.com  

---

## How to read this doc

| Baseline | Commit | Date | What it represents |
|----------|--------|------|-------------------|
| **Prince last authored** | [`67a2b02`](https://github.com/BeizaPlus/Beiza-Web/commit/67a2b02) | 6 Mar 2026 | Your last commit on `main` (admin rich-text toolbar sticky). |
| **Production ship anchor** | [`fdf0e81`](https://github.com/BeizaPlus/Beiza-Web/commit/fdf0e81) | 20 May 2026 | “Ship-now” Vercel deploy: APIs deferred, studio hidden on live domains. |
| **Current** | [`ff4def7`](https://github.com/BeizaPlus/Beiza-Web/commit/ff4def7) | 27 May 2026 | Today’s `main` (welcome rail lock, Instagram reels, layout fixes). |

**Scope:**

- Prince → current: **125 commits**, ~**890 files**, **+55k / −2.6k** lines (full tree).
- Ship anchor → current: **~70 commits** (everything after the May 20 production cut).

**Compare locally:**

```bash
git fetch origin
git diff 67a2b02..ff4def7 --stat          # full delta since your last commit
git diff fdf0e81..ff4def7 --stat          # since production ship anchor
git log 67a2b02..ff4def7 --oneline        # commit list
```

**Revert checkpoints (docs + tags):**

| Doc | Tag |
|-----|-----|
| [progress-snapshots/checkpoints/instagram-reels-2026-05-27.md](./progress-snapshots/checkpoints/instagram-reels-2026-05-27.md) | `checkpoint/instagram-reels-2026-05-27` → commit `853c086` |
| [progress-snapshots/checkpoints/welcome-gate-2026-05-27.md](./progress-snapshots/checkpoints/welcome-gate-2026-05-27.md) | *(doc only — no git tag yet)* |

Index: [progress-snapshots/README.md](./progress-snapshots/README.md)

---

## Executive summary

Between your last commit and today, the repo grew from a **CMS + admin + Shopify marketing site** into a **multi-product surface**: regional welcome gate, legacy vault/record station, family circles + React Flow tree, education/farewell landings, Instagram reel series, and extensive **layout studio** tooling for Steve to tune without redeploying CSS.

**Your code is still the foundation.** Cursor rule [`.cursor/rules/reuse-prince-foundation.mdc`](../.cursor/rules/reuse-prince-foundation.mdc) points to your anchor commits `c1dda0c`, `af39640`, `67a2b02` — admin, Shopify, routes, Tiptap, events, memoirs, tributes.

**What production looks like today vs your build:**

| Area | Prince-era (`67a2b02`) | Current `main` / beizaplus.com |
|------|------------------------|--------------------------------|
| Site entry | Likely `/` → marketing home | `/` → **`/welcome`** (three-path gate) |
| Home / education | Single landing patterns | **`/home`** education hub + reels + locale variants |
| Legacy product | Not present | Full **`/legacy/*`** shell (record, vault, family, circle) |
| Family tree | Not present | **`/circle`**, **`/family-trees/:id/tree`** (React Flow) |
| Layout tuning | Mostly CSS / component props | **Canonical JSON** + browser `localStorage` studio overrides |
| Welcome locale rail | N/A | Right rail: **GH** + **EN/ES/FR/CN** + sun theme toggle |
| Studio UI on live site | N/A | **Hidden** unless `?studio=1` (localhost always has studio) |
| Stripe / health cron / persona API | May have been in progress | **Deferred** (`api/lib/deployDeferred.ts` returns 503) |
| Admin / Tiptap / Shopify | Your implementation | Still present; extended, not replaced |

---

## Timeline (high level)

### 19–20 May 2026 — Legacy + Circle + CMS scale-up

Large product expansion **after** your March admin commit, mostly Steve + Cursor:

- **`779daa0`–`771fb94`**: `/legacy` routes, Supabase legacy schema, Circle flows, recovery, simplified nav.
- **`3cbd4c9`–`bd45ddc`**: React Flow family tree, vault recording, circle directory (Adinkra cards).
- **`16a5cbd`**: Stripe Keeper, health tabs, weekly questions, patterns API (later **deferred** for deploy).
- **`16840cb`**: CMS-first marketing; memoir-linked events; content policy (`contentPolicy.ts`).
- **`fdf0e81`**: **Production ship** — defer Stripe/health/persona; fix `vercel.json`; trigger deploy.
- **`dbae4cf`**: Layout studio **off** on production hostnames unless `?studio=1`.

### 20–21 May 2026 — Welcome gate + canonical layout

- **`a2f7ac5` → `efc2ff3`**: Three-path welcome gate (education / legacy / farewell), light/dark toggle.
- **`1e88ab7`**: Regional welcome + Ghana-default record + link mastersheet.
- **`daa52a7`**: **`welcome-gate-canonical.json`** + **`beiza-layout-canonical.json`** — layout source of truth in repo.
- **`8f25b57`**: Framer breakpoints: phone ≤639, tablet 640–1199, desktop ≥1200.
- **`ea573f4` / `2c9c275`**: Vertical locale rail + studio toolbar on welcome.

### 21–23 May 2026 — Fixes, smoke tests, studio polish

- **`c72954b` / `c92310a`**: Legacy tabs navigate to real pages after sign-in.
- **`245b7e7` / `c1ad363`**: Record sign-in form vs nav rail overlap (desktop/tablet).
- **`71c759c` / `0c2a7f2` / `9cc90e7`**: Welcome locale rail rewrite, studio nudge sliders, dot axis scaling.
- **`7bdbfed`**: Full-site link smoke + `LegacyTabBar` import crash fix.
- **`7590981`**: **`docs/FIXES-LOG.md`** — recurring bugs reference.
- **`00d87ae`–`53ab12d`**: Welcome UX, logo → `/welcome`, record HUD, FAQ, `/home` studio blackout fix.

### 27 May 2026 — Instagram reels + welcome handoff

- **`1256d1f`**: 12 **Chloe vs History** reels from Apify scrape → `src/data/chloe-vs-history-reels.json`.
- **`e51e6dc`**: **Critical:** Tailwind breakpoint classes must be literal `min-[640px]:` not template strings (prod was mobile layout on desktop).
- **`56beea6` / `78c2153`**: Native `<video>` playback; poster thumbnails; pause other reels on play.
- **`5d364dc`**: Welcome uses **wordmark only** (`useMascot: false`).
- **`905b346`**: **Quick start** modal on welcome (`WelcomeExplorePrompt`) — first visit per session.
- **`c31f2d5` / `ff4def7`**: Side rail always shows **EN/ES/FR/CN**; `localStorage` studio cache can’t hide them.

---

## 1. Routing & information architecture

### Entry & redirects

| Route | Then (`67a2b02` era) | Now |
|-------|----------------------|-----|
| `/` | Marketing landing | **Redirects to `/welcome`** |
| `/welcome` | Did not exist | **Primary gate** — 3 path cards + locale rail |
| `/home` | Unclear / landing | **Education-first home** (reels, offerings) |
| `/legacy`, `/legacy/record`, … | Did not exist | Legacy product shell |
| `/circle`, `/family-trees/:id/tree` | Did not exist | Circle directory + tree canvas |
| `/recover` | Did not exist | Account recovery flow |
| `/memory/:token` | Did not exist | Shared memory playback |
| `/gallery` | May have existed | **Redirects → `/circle`** |
| `/white-swan` | — | **Redirects → `/farewell`** |
| Regional paths | Limited | **`RegionalRoutePage`** — locale × variant (heritage, farewell, education) |

**File:** `src/App.tsx` (+139 lines vs ship anchor), `src/lib/beizaMasterLinks.ts`, `src/lib/welcomeRegionalRoutes.ts`.

### Prince modules still used

- **Admin** `AdminApp` — unchanged router pattern (extend only).
- **Events, Memoirs, Blog, Tributes, Contact, Pricing** — still Prince templates/hooks; content increasingly from Supabase CMS migrations.
- **Shopify** — your `api/shopify` structure consolidated to `api/shopify/[path].ts` (Hobby deploy limit).

---

## 2. Welcome gate (`/welcome`)

**New product surface** — not in your March baseline.

### UX (approved 27 May)

- Header: **BEIZA wordmark** (no mascot on welcome), tagline, italic subheading.
- **3 cards:** Learn your culture · Preserve a life story · Craft a memorial.
- **Right locale rail:** GH (flag + gold dot) + grey **EN / ES / FR / CN** + sun (light/dark).
- **Quick start dialog** (session): path picker + US/IN/LA/CN/BR/AF/FR pills — *not* in earliest approved screenshots; added `905b346`.
- **Studio (dev):** bottom-right dock — Site bounds, Welcome studio, Layout studio (`localhost` or `?studio=1`).

### Layout data

| File | Role |
|------|------|
| `src/data/welcome-gate-canonical.json` | Shipped defaults (crops, rail, toolbar) |
| `src/lib/welcomeStudio.ts` | Loads canonical; merges `localStorage` key `welcome-gate-studio` |
| `src/pages/WelcomeGate.tsx` | Page composition |
| `src/components/welcome/WelcomeLocaleRail.tsx` | Side rail (locked show-all codes) |
| `src/components/welcome/WelcomePathCard.tsx` | Card component |
| `src/components/welcome/WelcomeExplorePrompt.tsx` | Quick start modal |

### Gotchas (why prod looked “broken”)

1. **Old `localStorage`** with `showInactiveCodes: false` hid EN/ES/FR/CN — fixed `ff4def7` (always show + heal on load).
2. **Quick start** covers page on first session — dismiss “Skip for now”.
3. **Framer motion** — cards fade in; fast screenshot looks empty for ~0.5s.
4. **Phone ≤639px** — side rail hidden; languages move under header (`WelcomeLangSwitcher`).

---

## 3. Education / marketing home (`/home`)

| Feature | Commits / files |
|---------|-----------------|
| Instagram **Chloe vs History** (12 episodes) | `1256d1f`, `src/data/chloe-vs-history-reels.json`, `src/lib/instagramHistorySeries.ts` |
| Reel UI | `src/components/landing/InstagramReelsSection.tsx` — 9:16 cards, native video, one active player |
| Adinkra symbols grid (max 9) + CTAs | `aa4203f`, `AdinkraSymbolsListSection.tsx` |
| What We Do + record curiosity loop | `2ed1140`, `WhatWeDoSection.tsx`, `RecordStationCuriosityLoop.tsx` |
| Education locale switcher (top) | `EducationTopLocaleSwitcher.tsx` |
| White Swan embed | `WhiteSwanFilmEmbed.tsx`, `183724b` |
| Farewell / education-first content | `798be9c`, `6df31c5` |

**Checkpoint tag:** `checkpoint/instagram-reels-2026-05-27` @ `853c086` (reels + breakpoints; before later welcome-only commits).

---

## 4. Legacy product (`/legacy/*`)

Built May 19–23; extends your patterns (pages + Supabase), new shell.

| Piece | Description |
|-------|-------------|
| `LegacyLayout` | Tab rail: Home, Circle, Record, Vault, Family |
| Logged-out | Shared **record sign-in hero** on all legacy tabs |
| Logged-in | `/legacy/record` → mic-centered **record station**; other tabs → real pages |
| Vault | Sequence player, categories, Plus upsell |
| Record | Tap-to-toggle record (was hold-to-record), HUD, memory studio panel |
| Nav fixes | `c72954b`, `c92310a`, `4b73d30`, `093c437` |

**Canonical layout:** `src/data/beiza-layout-canonical.json` — record page, nav rail, site padding.

**Docs:** `LEGACY.md`, `BEIZA_WEB_SUMMARY.md`, `docs/SITE-SUMMARY.md`.

---

## 5. Circle & family tree

| Feature | Notes |
|---------|--------|
| Directory | `/circle` — Adinkra stamp cards (`fa59b5f`) |
| Tree canvas | React Flow — `FamilyTreeCanvasPage`, `TreeAppShell` |
| Persona / strengths | `8b9be6a` — radar on profiles; API deferred |
| APIs | `api/circle/[path].ts`, `verifyCircleSession`, migrations `20260519`–`20260527` |
| Recovery | `/recover`, `api/recovery-request.ts` |

---

## 6. Heritage, farewell, regional

| Page | Changes |
|------|---------|
| `/heritage`, `/farewell` | Hero studios, White Swan, Gye Nyame asset (`1b29eec`) |
| Regional | `src/pages/regional/RegionalRoutePage.tsx` — locale-specific heritage/farewell/education |
| French locale hero | `4de50a6` |
| Heritage video polish | `1baf286` |

---

## 7. Layout studio & dev tooling (major new subsystem)

**Not on production** unless `?studio=1`.

| Component | Purpose |
|-----------|---------|
| `LayoutStudioContext` | Master studio mode |
| `FloatingStudioShell` | Draggable dock (Welcome studio, Layout studio, Site bounds) |
| `LandingLayoutStudio` | Homepage section positions |
| `SitePaddingStudio` | `--beiza-site-padding-x` per breakpoint |
| `HeroLayoutStudio` | Per-page hero zoom/position |
| `StudioEditableText` | On-page copy edit (dev) |
| `isLayoutStudioEnabled()` | `src/lib/layoutStudio.ts` — localhost or `?studio=1`; off on beizaplus.com |

**Rule for Prince:** breakpoints in Tailwind must be **literal** classes:

```tsx
// ✅ OK
className="min-[640px]:grid min-[1200px]:gap-8"

// ❌ Breaks in production build
className={`${LAYOUT_TW.tabletUp}:grid`}
```

See `src/lib/layoutBreakpoints.ts`, `docs/progress-snapshots/checkpoints/instagram-reels-2026-05-27.md`.

---

## 8. API & Vercel (`api/`, `vercel.json`)

### New / restructured routes (since ship anchor)

| Route | Status |
|-------|--------|
| `api/circle/[path].ts` | Active (tree, recordings, etc.) |
| `api/memory/public.ts` | Share tokens |
| `api/recovery-request.ts` | Recovery |
| `api/heritage-inquiry.ts` | Heritage form |
| `api/stripe/[path].ts` | **Deferred** (`DEFER_STRIPE`) |
| `api/cron/weekly-health-send.ts` | **Deferred** |
| `api/health/unsubscribe.ts` | **Deferred** |
| Persona chat libs | **Deferred** (`DEFER_PERSONA_CHAT`) |
| `api/shopify/[path].ts` | Consolidated from separate files (deploy limit) |

**Toggle deferrals:** `api/lib/deployDeferred.ts` — set flags to `false` when re-enabling.

### `vercel.json`

- SPA rewrites for `/legacy`, `/legacy/:path*`
- Redirects: `/white-swan` → `/farewell`, `/gallery` → `/circle`
- Cron array emptied while health cron deferred
- Invalid JSON comment removed (`f71d486` — had broken deploy)

---

## 9. Supabase migrations (new since Prince baseline)

Applied on production through **`20260530`** per `BEIZA_WEB_SUMMARY.md`:

| Migration | Topic |
|-----------|--------|
| `20260519T120000_legacy_family_vault.sql` | Legacy vault schema |
| `20260519T180000_tree_edges_canvas_positions.sql` | Tree canvas |
| `20260519T200000_family_people_gender_career.sql` | Person fields |
| `20260520T*` | Footer, heritage inquiries, photos, Adinkra circles |
| `20260522T100000_family_tree.sql` | Tree tables |
| `20260523T100000_event_stories_trending.sql` | Trending events |
| `20260524T100000_recovery_access_family_trees.sql` | Recovery |
| `20260528T100000_billing_health_weekly.sql` | Billing/health (API deferred) |
| `20260529T100000_ernestina_memoir_sync.sql` | Ernestina memoir |
| `20260530T100000_mass_adoption_cms.sql` | Nav, footer, testimonials, offerings CMS |
| `20260601T000000_restore_primary_nav.sql` | Primary marketing nav |

---

## 10. CMS & content policy

| Change | Detail |
|--------|--------|
| `contentPolicy.ts` | Production: **Supabase only**; no demo fallback unless `VITE_ALLOW_CONTENT_FALLBACK=true` |
| Nav / footer | From `navigation_links`, `footer_links` (not hardcoded only) |
| Events | Link to `/memoirs/{slug}`; hero from linked memoir |
| Offerings / FAQ / pricing | DB-driven on landing |
| Testimonials | `testimonials` table + carousel |

Your **admin CMS** remains the editor surface; marketing pages consume published rows.

---

## 11. Components & UI systems (new files — sample)

**~200+ new files** under `src/components/`. Highlights:

- `BeizaLogoLink`, `SiteChrome`, `FullBleedHero`, `FramedHeroImage`
- Entire `src/components/legacy/*` tree
- Entire `src/components/welcome/*` tree
- Entire `src/components/landing/*` (reels, What We Do, Adinkra, etc.)
- Entire `src/components/dev/*` (studio)
- `src/components/family-trees/*` (tree UI)
- `FaqAccordionGroup`, `HomeFaqSection` (Prince-style independent FAQ rows preserved)

**Modified Prince files (examples):**

- `Navigation.tsx` — product nav links, logo → welcome
- `Footer.tsx` — CMS links
- `Hero.tsx`, `TestimonialsSection.tsx`, `TributesSection.tsx`
- `tiptap/*` — toolbar layout (your sticky toolbar commit `67a2b02` still in history)

---

## 12. Scripts, smoke tests, docs

| Asset | Purpose |
|-------|---------|
| `npm run smoke:site` | Full-site link screenshots |
| `npm run smoke:record` | Record area captures |
| `npm run links:check` | Link mastersheet validation |
| `docs/FIXES-LOG.md` | Recurring bugs |
| `docs/LINK-MASTERSHEET.md` | Route truth |
| `docs/progress-snapshots/` | PNG checkpoints + revert docs |
| `BEIZA_WEB_SUMMARY.md` | Product summary (updated May 27) |

---

## 13. Branding & assets

- Storyworth-style image naming (`34c6a78`) — `src/lib/brandImages.ts`, `public/images/`
- Mascot vs wordmark experiments (`f51dfc5` → **reverted** `f31cda9` for global header; welcome stays wordmark-only)
- Instagram reel posters + texture assets under `public/images/`
- Font audit: Playfair/DM Sans removed (`0a978da`)

---

## 14. Production vs local dev (what you’ll see)

| Behavior | `localhost:8080` | https://www.beizaplus.com |
|----------|------------------|----------------------------|
| Layout studio dock | **On** by default | **Off** (use `?studio=1` to debug) |
| Welcome studio overrides | `localStorage` `welcome-gate-studio` | Same key in browser — can drift from canonical until healed |
| Quick start modal | Once per session | Same |
| Deferred APIs | 503 JSON `{ deferred: true }` | Same |
| Deploy | `npm run dev` | Auto from `main` on Vercel |

**Verify production deploy SHA:**

```bash
gh api repos/BeizaPlus/Beiza-Web/deployments?environment=Production --jq '.[0].sha[0:7]'
# Expect: ff4def7 (or newer after you read this)
```

---

## 15. What we did **not** replace (Prince foundation intact)

Per `.cursor/rules/reuse-prince-foundation.mdc`:

- **Admin app** — routes, sidebar, rich text editor structure
- **Shopify integration** — product/order/webhook path (refactored for Vercel file limits)
- **Memoir / tribute / event templates** — extended, not rewritten from scratch
- **Supabase auth patterns** — `useAdminMutations`, edge functions for invites
- **Tiptap extensions** — image upload, audio, galleries
- **Core marketing pages** — still composed from your section components

**Your anchor commits to inspect:**

```bash
git show c1dda0c --name-only   # routes, Tailwind, footer/nav
git show af39640 --name-only   # Shopify, ads, email, public/admin pages
git show 67a2b02 --name-only   # editor toolbar sticky
```

---

## 16. Known issues / open items (at `ff4def7`)

| Issue | Notes |
|-------|--------|
| Stripe / health / persona | Intentionally deferred — flip `deployDeferred.ts` + restore cron |
| Instagram CDN posters | Scraped thumbnails can 404; ep1 uses local poster |
| Welcome Quick start | May surprise users vs static gate mockups |
| `checkpoint/welcome-gate-*` git tag | Doc exists; tag not created yet |
| Git stashes on Steve machine | `stash@{2}` welcome gate WIP — not on GitHub |

---

## 17. Full commit list (Prince `67a2b02` → `ff4def7`)

<details>
<summary>125 commits (click to expand)</summary>

```
2026-05-19 779daa0 Add /legacy family vault routes and Supabase schema
2026-05-19 4fe41ef Reframe site copy for legacy language and wire /legacy routing
… (see `git log 67a2b02..ff4def7 --oneline`) …
2026-05-27 ff4def7 Lock welcome locale rail codes so studio cache cannot hide them again.
```

Run: `git log 67a2b02..ff4def7 --format="%ad %h %s" --date=short`

</details>

---

## 18. Suggested next steps for Prince

1. **Pull `main`** and run `npm install && npm run dev` → open `/welcome?studio=0` to match production chrome.
2. Read **`docs/FIXES-LOG.md`** before debugging welcome rail / legacy record again.
3. When changing breakpoints, use **literal** `min-[NNNpx]:` classes only.
4. To re-enable billing/health: `api/lib/deployDeferred.ts` + `vercel.json` crons + env keys on Vercel.
5. For layout handoff: edit **`src/data/welcome-gate-canonical.json`** or **`beiza-layout-canonical.json`**, not one-off CSS, when Steve locks a design.

---

## 19. Product roadmap — not shipped yet (build order)

These are **planned** features. They are **not** on `main` at `ff4def7`. Build **after** current marketing/legacy/reels stabilization.

### Build order (Steve, May 2026)

| Priority | Feature | Status |
|----------|---------|--------|
| Earlier | Re-enable deferred APIs (Stripe Keeper, health, persona) when ready | Not started |
| Earlier | OpenAI record-station hero refresh (see below) | Not started |
| **Last** | **Concierge — Family Story page** ($5,000 done-for-you) | **Last feature to build** |

---

### A. OpenAI — record station image when family sends a photo

**Intent:** When a family uploads or provides a portrait/photo, use **OpenAI** (server-side) to refresh the **recording station** hero/scene imagery so the station feels personal to that family (not only the default Ghana/Marmah stock art).

**Touches (likely):**

| Layer | Notes |
|-------|--------|
| Upload | Existing tree/vault photo flows — `family_people` photos, legacy record context |
| API | New or extend `/api/*` — image gen/edit; **`VITE_AI_PROVIDER`** / `ANTHROPIC_API_KEY` pattern in `BEIZA_WEB_SUMMARY.md` (server env only) |
| UI | `RecordStationViewport`, `RecordHeroCta`, canonical record hero in `beiza-layout-canonical.json` |
| Storage | Supabase storage + URL on circle/person or family settings |

**Not built yet** — document for Prince so it is not confused with shipped work.

---

### B. Concierge — Family Story page (all memories “come alive”)

**Product:** A **done-for-you** service — Beiza produces a premium **Family Story** experience where **all memories** (recordings, photos, vault items, tree context) are woven into one living story surface.

| Item | Detail |
|------|--------|
| **Price** | **$5,000** concierge fee |
| **Positioning** | White-glove / concierge — not self-serve SaaS tier |
| **Experience** | Dedicated **Family Story** page: timeline or cinematic layout; audio/video playback; portraits; optional AI narration or chaptering (TBD) |
| **Ops** | Likely admin + manual QA pipeline before public URL; Stripe or invoice (reuse deferred Stripe when enabled) |

**Scope sketch for implementation (future):**

1. **Data model** — link vault recordings + tree people + uploaded media → one `family_story` or `concierge_project` record.
2. **Public page** — new route (e.g. `/story/:slug` or `/family-story/:circleId`) — full-bleed, memoir-quality typography (reuse Prince memoir templates where possible).
3. **Playback** — aggregate `LegacyVaultSequencePlayer`-style sequences + tributes audio (`AudioPlayer` from Prince’s work).
4. **Concierge workflow** — admin status: intake → production → review → publish; payment flag at $5k.
5. **AI assists (optional)** — OpenAI for copy/chapter titles; image treatment for station + story hero (ties to **A** above).

**Explicit:** This is the **last major feature** in the roadmap — after reels, welcome, legacy record, and tree are stable.

---

## 20. Open this file

Path on disk:

`docs/CHANGELOG-PRINCE-TO-MAIN.md`

In VS Code / Cursor: **Ctrl+P** → paste `CHANGELOG-PRINCE-TO-MAIN.md` → Enter.

---

*Questions or missing commits? Compare SHAs above or ping Steve with the route + screenshot.*
