# Beiza Web — Product Summary

**Repo:** [BeizaPlus/Beiza-Web](https://github.com/BeizaPlus/Beiza-Web)  
**Live:** https://beizaplus.com  
**Stack:** Vite + React + Tailwind + Supabase · Vercel serverless API

Last updated: 20 May 2026 · branch `main`

---

## Product status (where things sit now)

### Shipped and testable locally (`npm run dev` → http://localhost:8080)

| Area | Routes | Notes |
|------|--------|--------|
| **Marketing** | `/`, `/pricing`, `/heritage`, `/recover`, `/events` | Nav: Vault · Circle · Heritage |
| **Circle directory** | `/circle` → `/circle/:id/enter` → `/circle/:id/tree` | 6-char access code gate; bearer token in `localStorage` |
| **Freeform tree** | `/circle/:id/tree` | React Flow canvas — drag nodes, gold handles, edges, grouping (**G**), leader pin, light/dark, persona chat |
| **Record** | `/legacy/record`, `/circle/:id/record` | Tap-to-record; circle path uses bearer token API |
| **Vault** | `/legacy/vault` | Playback, rename, **share via link (free)**; delete/download → Keeper upsell |
| **Legacy shell** | `/legacy`, `/legacy/family` | Create/join circle, invite codes |

**Local tier override:** `VITE_LEGACY_TIER=keeper|heritage` in `.env` (billing not live yet).

**Layout studio:** `?studio=1` on landing/heritage for hero framing edits.

### Spec’d / not in repo yet

| Feature | Status |
|---------|--------|
| **Stripe Keeper checkout** | Not wired — needs currency + Price ID confirmation |
| **Weekly health questions** | Architecture locked (52-week cycle, idempotent sends, HMAC opt-out) — **no migrations/API yet** |
| **Patterns tab (full)** | UI exists; needs sustained health data + `health-patterns` API in prod |

### Production deploy

- **Live:** https://beizaplus.com (auto-deploy from `main`)
- **Vercel env required for circle gate:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Apply Supabase migrations** through `20260527` (tree edges, canvas positions, share tokens, profile fields, sibling order)

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
5. **`/circle/:id/tree`** — full-screen React Flow canvas (`@xyflow/react`); biography side panel; **+ Add memory →** → `/circle/:id/record`.

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

### Schema
**Tree nodes:** `family_people` (self-referential `parent_id`) — not a separate `tree_nodes` table.  
**Person fields on `family_people`:** `gender`, `career_path`, `nickname`, `birth_year`, `birth_date`, `death_year`, `birthplace`, `religion`, `education`, `languages`, `short_bio` — all nullable. Added via migrations `20260519T200000`, `20260521T100000`, `20260522T200000`.  
**Tree edges:** `tree_edges` (circle_id, source_person_id, target_person_id, relationship_type). Unique pair constraint per circle.  
**Health:** `person_health_conditions` (circle_id, person_id, category, condition, age_of_onset, still_active). Categories: cardiovascular, metabolic, neurological, mental_health, cancer, autoimmune, respiratory, musculoskeletal, hereditary, addiction, other. Migration: `20260522T100000`.  
**Traits:** `person_traits` (circle_id, person_id, category, trait). Categories: physical, personality, skills, known_for. Migration: `20260521T110000`.  
**Canvas positions:** `family_people.canvas_x / canvas_y` — saved on drag-stop. New nodes placed at viewport centre via `getViewport()`.  
**Links:** `recording_person_links` (about | by).  
**Tree edges:** `tree_edges` — persisted relationships; disconnect via edge menu or person right-click.  
**Sibling order:** `family_people.sibling_order` (1 = eldest) for auto-layout.  
**Share tokens:** `recordings.share_token` → `/memory/:token` public player.

**Weekly health questions (planned, not migrated):** explicit `week_number` counter per circle; 52-question bank by stable `id` (append-only, `retired` flag); after week 52, week 1’s dimension repeats — ~156 answers by year 3. Idempotent `(circle_id, week_number)` + per-email send log; HMAC unsubscribe table; keeper-approved custom question queue.

### Node types (canvas)
- `person` — default square card (PersonFlowNode)
- `circlePerson` — circular photo node (CirclePersonFlowNode)  
- `squarePerson` — square variant (SquarePersonFlowNode)
- `memory` — audio memory linked to person
- `group` — GroupFlowNode wraps selected nodes (G key or BoxSelect toolbar)

### API routes (`api/circle/`)
| Route | Method | Purpose |
|-------|--------|---------|
| `tree-data` | GET | All people, edges, traits, health, recordings for a circle |
| `tree-edge` | POST/DELETE | Create or remove a tree edge |
| `tree-edge-disconnect` | DELETE | Remove all edges for a person |
| `tree-person` | PATCH/POST | Update or create a family_people row |
| `tree-person-photo` | POST | Upload photo → Storage → set photo_url |
| `tree-person-duplicate` | POST | Clone a person node with offset position |
| `tree-position` | PATCH | Save canvas_x/y for a person |
| `persona-chat` | POST | AI tree guide + chat (Ollama local / Claude prod) |
| `record-memory` | POST | Upload audio + link to person (bearer-token path) |
| `health-patterns` | POST | AI pattern analysis across circle health data |

### Edge connection flow
1. Drag from gold handle (40px hit area, 10px visible dot) → connection line
2. `inferConnectionDirection()` reads source handle + position delta → direction
3. `labelToRole()` reads source/target `relation_label` → role
4. `inferRelationshipType(sourceRole, targetRole, direction)`:
   - HIGH confidence (both roles match) → auto-save, skip modal, toast
   - MEDIUM (one role) → modal opens with type pre-selected
   - NONE → modal, direction-based priority pills shown first
5. `confirmConnection()` → `saveTreeEdge()` → API or Supabase
6. Right-click edge → `TreeEdgeContextMenu` → delete
7. Right-click node → `TreeNodeContextMenu` → disconnect all / duplicate / gender / career / photo

### Canvas features
- **Auto-layout:** dagre TB (vertical) or LR (horizontal) via toolbar — saves positions to DB
- **Grouping:** G key or toolbar BoxSelect — wraps selected nodes in a group node; double-click to ungroup
- **Edge style toggle:** orthogonal (smoothstep) ↔ curved (bezier) via toolbar
- **Flicker fix:** `prevNodeSnapshotRef` guards `setNodes` from running on every render; `positionOverrides` as plain object not Map
- **fitView:** fires once via `hasFittedRef` after first person nodes appear
- **Leader:** `TREE_LEADER_PIN` centres auto-layout on the tree leader node
- **Inline recorder:** `InlineMemoryRecorder` in PersonNodePanel → records audio → `POST /api/circle/record-memory` → linked to person
- **Voice input:** `VoiceInputButton` (WebSpeech API) in tree guide chat
- **Tree guide:** `PersonaChat` → `POST /api/circle/persona-chat` → Ollama (local) or Claude (prod). Defaults to Ollama when no `ANTHROPIC_API_KEY`. Builds tree via tool calls.

### PersonNodePanel tabs
Profile · Health · Memories · Traits · Talk · Patterns  
- **Profile:** inline-edit all person fields, autosave on blur with “Saved ✓” flash  
- **Health:** toggle conditions per category, age_of_onset inline  
- **Memories:** recordings list + `InlineMemoryRecorder` (no page nav needed)  
- **Traits:** physical / personality / skills / known_for tag pills  
- **Talk:** AI chat with the person using their recordings as context  
- **Patterns:** locked until 3+ members have health data; unlocks AI pattern analysis

### AI providers
- `VITE_AI_PROVIDER=ollama` (default when no Anthropic key) → `OLLAMA_BASE_URL:11434`, `OLLAMA_MODEL=llama3.2`
- `VITE_AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` → Claude Opus 4.7 (production)
- Auto-fallback: if provider=anthropic but key missing → falls back to Ollama silently

### Key files
- `src/components/legacy/family-tree/FamilyTreeCanvas.tsx` — main canvas
- `src/lib/legacy/treeConnectionInference.ts` — direction + label → relationship inference
- `src/lib/legacy/autoLayoutTree.ts` — dagre layout (TB/LR) with leader pinning
- `src/lib/legacy/layoutGroupNodes.ts` — group/ungroup logic
- `src/lib/legacy/treeCanvasPersistence.ts` — all Supabase + API I/O
- `api/lib/personaAgent.ts` — AI agentic loop (Anthropic + Ollama paths)
- `api/lib/personaTools.ts` — add_person, connect_people, update_person, add_health_condition

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

| Tier | Recording | Rename | Delete | Share link | Download raw | Storage |
|------|-----------|--------|--------|------------|--------------|---------|
| **Circle** (free) | Unlimited length | Yes | Locked (upsell) | **Yes (free)** | Locked | 5 GB |
| **Keeper** ($4.99/mo) | Yes | Yes | Yes | Yes | Yes | 500 MB |
| **Heritage** ($white-glove) | Yes | Yes | Yes | Yes | Yes | Unlimited |

- No duration cap for Circle; tap-to-record toggle; 5 GB gate on upload
- Delete + download upsell → Keeper → `/pricing` (Stripe checkout **pending**)
- Dev tier: `VITE_LEGACY_TIER=keeper|heritage`
- Bottom nav: Home · Tree · Record · Vault · Invite (legacy shell; marketing nav is separate)

### AI persona (planned / API routes)

- **`VITE_AI_PROVIDER`** — server env only (`process.env` in `/api/*`); `vercelApiDevPlugin` injects `.env` for local dev. Not available in client bundles.
- **Local:** `ollama serve` + `ollama pull llama3.2`
- **Persona context:** System prompt quality matters most. Recordings linked **`by`** the person (their own voice prompts) are the persona foundation; use those before `about` memories from others.

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
| `20260519T180000_tree_edges_canvas_positions.sql` | `tree_edges`, `canvas_x` / `canvas_y` on `family_people` |
| `20260525T100000_recordings_share_token.sql` | Public memory share tokens |
| `20260526T100000_family_people_profile_fields.sql` | Extended profile columns |
| `20260527T100000_sibling_order.sql` | `sibling_order` for layout |

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

- `3cbd4c9` — Freeform family tree canvas (React Flow), vault recording flow, circle UX, tree edges, grouping, persona API  
- `e11d130` — Person gender, career, photo upload, duplicate on tree  
- `fa59b5f` — Circle directory Adinkra stamp cards  
- `771fb94` — Circle flows, recovery, access gate, events trending, nav (Vault/Circle/Heritage)  

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
