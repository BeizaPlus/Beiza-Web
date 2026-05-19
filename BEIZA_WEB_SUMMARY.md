# Beiza Web — Product Summary

**Repo:** [BeizaPlus/Beiza-Web](https://github.com/BeizaPlus/Beiza-Web)  
**Live:** https://beizaplus.com  
**Stack:** Vite + React + Tailwind + Supabase · Vercel serverless API

Last updated: May 2026 · branch `main` · commit `771fb94`

---

## Product navigation (marketing site)

Primary nav — three core items only:

| Label | Route | Purpose |
|-------|--------|---------|
| **Vault** | `/vault` → `/legacy/vault` | Recordings, preserved memories (the past) |
| **Circle** | `/circle` | Family circle directory → access gate → private tree |
| **Heritage** | `/heritage` | White Swan, premium tier, recovery entry |

- **Contact** — white pill CTA (right), `/contact`
- **Pricing** — footer only: *Plans & pricing →* `/pricing`
- **Stories** — footer only: `/events`
- **Recover a voice** — `/recover` (linked from Heritage hero, footer, Circle directory, legacy home)

**Active nav:** `#ffffff` + centered `1.5px #E6A817` dot below  
**Inactive:** `#666666` · Vault/Circle hover white · Heritage hover gold (`#E6A817`)

**Mobile:** drawer with Playfair Display links; **+ Start recording →** (`/record`); **Pricing →** below.

Recording is **not** in the main nav — it is contextual on the Circle tree header: **+ Add memory →** → `/record`.

---

## Key routes

| URL | Purpose |
|-----|---------|
| `/` | Landing |
| `/vault` | Redirect → `/legacy/vault` (authenticated memory vault) |
| `/record` | Redirect → `/legacy/record` |
| `/circle` | Public directory of family circle covers |
| `/circle/:id/enter` | Access code gate (6-char, no auth required) |
| `/circle/:id/tree` | Private family tree canvas (token required) |
| `/family-trees` | Redirect → `/circle` (legacy URLs still work for enter/tree) |
| `/recover` | Voice recovery intake — no login (White Swan / Heritage) |
| `/heritage` | Heritage / White Swan experience |
| `/white-swan` | Redirect → `/heritage` |
| `/pricing` | Legacy curation pricing |
| `/vault/explore` | Public vault covers (browse only) |
| `/legacy` | Legacy app shell (home, record, vault, family, tree) |
| `/legacy/circle` | Family tree (member auth via Supabase) |
| `/legacy/record` | Voice recording flow |
| `/legacy/vault` | Memory vault playback |
| `/legacy/family` | Create/join circle · access code + invite code |
| `/events` | Live events + trending stories carousel |
| `/gallery` | Redirect → `/circle` |

---

## Circle & access code

**Model:** Public cover · private tree. You earn entry by belonging to the family.

1. **`/circle`** — grid of circle covers (name, member/memory counts, since year, Active / In memoriam badge, mini SVG tree preview).
2. Click cover → **`/circle/:id/enter`** — full-screen gate (`#0a0a0a`), 6-character code, gold **Enter circle →**.
3. **`POST /api/circle/verify-code`** — validates code, issues signed session token, creates `circle_members` row (`joined_via: 'code'`).
4. Token stored: `localStorage` key `beiza_circle_{id}_token`.
5. **`/circle/:id/tree`** — react-d3-tree canvas; biography panel; **+ Add memory →** → `/record?circle=…`.

**Admin:** On circle creation, DB trigger sets `family_circles.access_code` (6-char). Keeper copies from `/legacy/family` (separate app **invite code** for Legacy sign-in).

**APIs**

| Endpoint | Role |
|----------|------|
| `POST /api/circle/verify-code` | Validate code, return `{ valid, token }` |
| `GET /api/circle/tree-data?circle_id=` | Bearer token → people, recordings, links |

---

## Voice recovery (`/recover`)

Highest-priority Heritage flow — families retrieving recordings after a loss.

- Standalone page, no Beiza account required
- Form → **`POST /api/recovery-request`** → table `recovery_requests`
- Optional document upload → `recovery-documents` storage bucket
- Success: gold confirmation copy, no redirect

Fields: deceased name/contact, requester relation/email, optional document, message. Status: `pending` | `reviewing` | `resolved`.

---

## Family tree (data & UI)

**Tree nodes:** `family_people` (self-referential `parent_id`) — not a separate `tree_nodes` table.  
**Person fields:** `gender?: "male" | "female" | null`, `career_path?: string | null` on `family_people`; read via `GET /api/circle/tree-data` (`SELECT *`) — no read API changes. Migration: `20260519T200000_family_people_gender_career.sql`. Writes via `tree-person` when edit UI is added.  
**Tree edges:** `tree_edges` table — persists person-to-person connections with `relationship_type`.  
**Links:** `recording_person_links` (`about` | `by`).  
**Biography:** `get_person_biography()` RPC (fragments from recordings).  
**Canvas positions:** `family_people.canvas_x / canvas_y` — saved on drag-stop.

**UI:** `FamilyTreeCanvas` (`@xyflow/react` v12), `PersonFlowNode` (8 handles, 4 sides), `PersonBiographyPanel`, `RelationshipPickerModal`, `TreeEdgeContextMenu`.  
**Record flow:** “Who is this memory about?” on seal links person to recording.

**Edge connection flow:**
1. Drag from any gold handle → blue connection line appears
2. Release on target node handle → `onConnect` fires (uses `getNodes()` for live state — stale-closure fix)
3. `RelationshipPickerModal` opens → user picks type → `confirmConnection` calls `saveTreeEdge`
4. API path (`persistViaApi=true`): `POST /api/circle/tree-edge` → inserts to `tree_edges` via service role key
5. Right-click an edge → `TreeEdgeContextMenu` → `DELETE /api/circle/tree-edge`
6. Edges reload on mount via `fetchTreeEdges` (called in `useEffect` on `circleId` change)

**Key files:**
- `src/components/legacy/family-tree/FamilyTreeCanvas.tsx` — main canvas, connection logic
- `src/components/legacy/family-tree/flow/PersonFlowNode.tsx` — handles outside content div (no overflow clipping)
- `src/lib/legacy/treeCanvasPersistence.ts` — Supabase + API I/O for edges and positions
- `src/lib/legacy/treeEdgeHandles.ts` — picks source/target handle IDs based on relative node position
- `api/circle/tree-edge.ts` — POST (create) + DELETE (remove) edge via bearer token
- `supabase/migrations/20260519T180000_tree_edges_canvas_positions.sql` — `tree_edges` table + RLS

---

## Events & stories

**`/events`**

- Hero (Ernestina portrait)
- **Live events** row — featured productions (`is_live`, `useLiveEvents`)
- **Trending** carousel — MasterClass-style vertical cards (`event_stories` table + fallbacks)

**Carousel UX:** `useDraggableScroll()` hook + `[data-draggable]` CSS — mouse drag on desktop; touch scroll native; snap + arrow buttons unchanged.

---

## Landing & brand

| Area | Details |
|------|---------|
| **Voices that stayed** | Horizontal scroll; equal-height cards (`min-h-[280px]`, `items-stretch`, quote `flex-1`, footer `mt-auto`); country line = name only (`11px #555`, no flag/code) |
| **What We Do** | Locale toggle: Global · Ghana · Twi · Spanish · French — inline SVG flags (`FlagIcon.tsx`), no CDN/emoji |
| **Hero images** | See asset map below |
| **Design tokens** | `src/lib/brandUi.ts` — `marketingSection`, `segmentToggleShell`, `carouselControlButton`, `legacySurface`, etc. |

### Asset map (heroes)

| Image | Where |
|-------|--------|
| `beiza-elder-gye-nyame-hero.png` | `/heritage` only |
| `beiza-ernestina-portrait-bw.png` | Homepage Events hero, `/events` |
| `adinkra-hands-hero.png` | Homepage top hero (CMS fallback) |

Shared overlay: `linear-gradient(to right, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.15) 100%)` via `FullBleedHero`.

---

## `/heritage` — White Swan experience

- Route: **`/heritage`** · **`/white-swan` → `/heritage`**
- Hero, features, White Swan callout, pricing comparison, consultation form
- SEO: *Beiza Heritage · Memorial & Legacy Coordination*
- Links: pricing, footer, **Recover a voice →** `/recover`

---

## Legacy app (`/legacy`)

| Tier | Recording | Rename | Delete | Share | Storage |
|------|-----------|--------|--------|-------|---------|
| **Circle** (free) | Unlimited length | Yes | Locked (upsell) | No | 5 GB |
| **Keeper** ($4.99/mo) | Yes | Yes | Yes | Yes | 500 MB |
| **Heritage** ($200/yr) | Yes | Yes | Yes | Yes | Unlimited |

- No duration cap for Circle; blob capture; **Done** while recording; 5 GB gate on upload
- Delete upsell → Keeper → `/pricing`
- Dev tier: `VITE_LEGACY_TIER=keeper|heritage`
- Bottom nav: Home · Tree · Record · Vault · Invite (legacy shell; marketing nav is separate)

---

## APIs & database

### Vercel API routes

| Route | Table / action |
|-------|----------------|
| `POST /api/heritage-inquiry` | `heritage_inquiries` |
| `POST /api/recovery-request` | `recovery_requests` + optional storage upload |
| `POST /api/circle/verify-code` | `circle_access_tokens`, `circle_members` |
| `GET /api/circle/tree-data` | Service-role read of tree data (token validated) |

**Env (Vercel):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` · optional `CIRCLE_ACCESS_SECRET`

### Supabase migrations (apply in order)

| Migration | Contents |
|-----------|----------|
| `20260519T120000_legacy_family_vault.sql` | `family_circles`, `family_members`, `recordings` |
| `20260522T100000_family_tree.sql` | `family_people`, `recording_person_links`, biography RPC |
| `20260523T100000_event_stories_trending.sql` | `event_stories`, live event fields |
| `20260524T100000_recovery_access_family_trees.sql` | `access_code`, `circle_members`, `circle_access_tokens`, `recovery_requests`, public directory RPCs |

**RPCs:** `list_public_family_circles()`, `get_public_circle_cover(uuid)`

---

## Shared hooks & components

| Path | Role |
|------|------|
| `src/hooks/useDraggableScroll.ts` | Mouse drag-to-scroll for all horizontal carousels |
| `src/hooks/useFamilyTreesDirectory.ts` | Public circles, cover, verify code, tree fetch |
| `src/hooks/useFamilyTree.ts` | `family_people` CRUD, recording links |
| `src/config/productNav.ts` | Vault · Circle · Heritage + footer links |
| `src/components/ui/FlagIcon.tsx` | Inline SVG flags (GH, ES, FR, GLOBAL) |

---

## Hero image controls (Layout Studio)

- **Dev:** panel bottom-right · **Any env:** `?studio=1`
- **Zoom:** 70%–160%; pan X/Y
- **Keys:** `beiza-landing-layout-studio`, `beiza-hero-studio:events`, `beiza-hero-studio:heritage`

---

## Deploy checklist

1. Push to `main` — Vercel auto-deploys  
2. Run Supabase migrations (see table above — especially `20260522`, `20260523`, `20260524`)  
3. Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` on Vercel  
4. Optional: `CIRCLE_ACCESS_SECRET` for circle session tokens  
5. Hard-refresh after deploy for hero CDN cache  

---

## Recent commits (reference)

- `771fb94` — Circle flows, recovery, access gate, events trending, nav (Vault/Circle/Heritage), draggable carousels, FlagIcon, migrations  
- `c7ce7b4` — Voices section design alignment  
- `a739aba` — Hero zoom on Events & Heritage  
- `3c2ee8d` — What We Do four-locale toggle  

---

## Docs elsewhere

- `LEGACY.md` — `/legacy` deploy (update: includes `/legacy/circle`)  
- `docs/HERITAGE_PAGE.md` — Heritage hero + SEO  
- `public/images/ASSETS.md` — image naming  

---

## Code comments (product intent)

Recovery is the most important feature — the reason Heritage exists.  
The access code is the moat; the tree is private, the cover is public.  
The recordings are the inheritance; recovery ensures they are not lost.
