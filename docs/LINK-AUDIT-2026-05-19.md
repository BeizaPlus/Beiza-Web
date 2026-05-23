# Link audit — 19 May 2026

**Scope:** Internal routes in `src/App.tsx` + `src/lib/beizaMasterLinks.ts`, cross-checked against grep of `href=`, `to=`, and `navigate()` in `src/**/*.tsx`.

**Automated checks run:** `npm run links:check` (passed).

**Live site note:** `HEAD https://www.beizaplus.com/*` returns `200` for unknown paths (`/booklet`, `/packet`, `/services`) because Vercel serves the SPA shell; the **client router** still resolves those to `NotFound`. Do not use HTTP status alone for SPA route validation.

---

## Router inventory (`App.tsx`)

| Path | Resolves to |
|------|-------------|
| `/`, `/welcome` | Welcome gate |
| `/home` | Education home (`Landing.tsx`) |
| `/education` | Redirect → `/home` |
| `/{locale}/education` | Redirect → `/home` |
| `/education/story-questions` | Story questions article |
| `/gallery` | Redirect → `/circle` |
| `/vault` | Redirect → `/legacy/vault` |
| `/record` | Redirect → `/legacy/record` or `/circle/:id/record` |
| `/family-trees` | Redirect → `/circle` |
| `/circle`, `/circle/:id/enter\|tree\|record` | Circle directory + flows |
| `/family-trees/:id/*` | Same enter/tree/record pages |
| `/contact`, `/recover`, `/events`, `/pricing` | Marketing pages |
| `/blog`, `/blog/:slug` | Blog |
| `/memoirs`, `/memoirs/:slug` | Memoirs |
| `/vault/explore`, `/download`, `/order-confirmation` | Vault explore, download, order |
| `/heritage` | Heritage legacy landing |
| `/farewell` | Farewell heritage |
| `/white-swan` | Redirect → `/farewell` |
| `/{in,la,zh,br,af,fr}/heritage\|farewell` | Regional wrappers |
| `/legacy`, `/legacy/circle\|record\|vault\|family` | Legacy app shell |
| `/memory/:token` | Memory share |
| `/admin/*` | Admin app |
| `*` | `NotFound` |

**Not registered (SPA → 404 content):** `/booklet`, `/packet`, `/services`, and any path not listed above.

---

## Specific checklist (requested)

| Item | Expected | Actual | Status |
|------|----------|--------|--------|
| Welcome · Education card | `/education` or education home | `/home` via `getWelcomeCardHref` | OK — `/education` redirects to `/home` |
| Welcome · Legacy card | `/heritage` or `/legacy` | **`/legacy/record`** (locked in mastersheet) | OK by product spec; not `/heritage` |
| Welcome · Farewell card | Farewell route | `/farewell` (locale: `/af/farewell`, etc.) | OK |
| Logo / mascot | `/welcome` | **`/`** via `BeizaLogoLink` (`BEIZA_LINKS.welcome.gate`) | OK — `/welcome` alias also routed |
| “Open Legacy →” (education) | Legacy entry | **`/heritage`** (`Education.tsx`) | OK |
| Circle “Open Legacy” / tree CTAs | Legacy tree | **`/legacy/circle`** | OK |
| Access code “/circle” | Circle directory | **`/circle`** (`enter.tsx`, `family.tsx`) | OK |
| Keeper upgrade | Stripe checkout | **`LegacyKeeperUpsellDialog`** → `POST /api/stripe/create-checkout-session` (runtime); **`LegacyVaultPlusUpsell`** → `/pricing` only | Partial — pricing link OK; checkout is API, not a route |
| “View full tree” | Family tree | **`/legacy/circle`** (button `onViewFullTree`) | OK |
| “Play full story” | Vault sequence | **In-page** `LegacyVaultSequencePlayer` (no navigation) | OK |
| Hamburger · farewell arm | Section anchors | `#plan-farewell`, `#vessels-caskets`, `#white-swan`, `#recover-voice`, `#farewell-faqs` on `Heritage.tsx` | OK |
| Hamburger · legacy arm | Anchors + routes | `#recording-station` on record station; routes OK; **`#faqs` missing on `/legacy/record`, `/legacy/vault`, etc.** | Partial |
| Hamburger · education arm (`/home`) | Section anchors | **`#symbols`, `#cultural-films`, `#your-language`, `#start-legacy` — no matching `id` on `Landing.tsx`** | **Broken anchors** |
| FAQ CTAs | Destinations | `FaqStaircaseSection` has **no CTA links** (accordion only) | N/A |
| Footer (static fallbacks) | Resolve | Most use `BEIZA_LINKS`; **`/#about` has no `#about` on `/home`** (`AboutSection` unused) | **Broken anchor** |
| Footer (CMS) | Resolve | `Footer.tsx` uses `<Link to={item.href}>` for all rows — **external URLs would break** if stored in CMS | Risk |

---

## Broken or placeholder links (fix in Task 1+)

### 1. Missing routes (404 in client router)

| Source | Link | Issue |
|--------|------|--------|
| `LegacyHomeDrawer.tsx` | `/booklet` | No route |
| `LegacyHomeDrawer.tsx` | `/packet` | No route |

### 2. Orphan page (no route, unreachable)

| File | Issue |
|------|--------|
| `src/pages/Services.tsx` | Never imported in `App.tsx`; `/services` → `NotFound` |

### 3. Dead hash anchors (same-tab scroll targets missing)

| Page | Links | Missing `id` |
|------|-------|----------------|
| `/home` (`Landing.tsx`) | `EDUCATION_ARM_ANCHORS` | `symbols`, `cultural-films`, `your-language`, `start-legacy` |
| `/home` (footer fallback + CMS seed) | `/#about` | `about` (component exists but is not mounted on Landing) |
| `/legacy/record`, `/legacy/vault`, `/legacy/family`, `/legacy/circle` | `LEGACY_ARM_ANCHORS` → `#faqs` | `faqs` only on `/legacy` index (`LegacyHomePage`) |

### 4. Intentional redirects (not broken)

- Nav “Vault” → `/vault` → `/legacy/vault`
- Footer “Gallery” → `/gallery` → `/circle`
- Welcome Education → `/home` (not `/education` page component)

### 5. Placeholders

- **None found:** no `href="#"` or `to=""` in `src/**/*.tsx`.

### 6. External link hygiene (sample)

| Location | `target="_blank"` | `rel="noopener noreferrer"` |
|----------|-------------------|---------------------------|
| `Footer.tsx` socials | Yes | Yes |
| `ProductCard.tsx` Shopify | Yes | Yes |
| `AdZone.tsx` | Yes | Yes |
| `Memoirs.tsx` live stream | Yes | Yes |
| `Contact.tsx` tel/mailto | N/A | N/A |
| `CTAButton` external | Yes | Yes when `external` prop set |

---

## Verified OK (sample)

- Welcome cards (EN): `/home`, `/legacy/record`, `/farewell` — `npm run links:check`
- `LEGACY_TAB_LINKS`: `/legacy`, `/legacy/circle`, `/legacy/record`, `/legacy/vault`, `/legacy/family`
- `BeizaLogoLink` → `/` (welcome gate)
- `RecordRedirect`, circle dynamic paths, admin nested routes
- `HeritageLegacyLanding` CTAs → `/legacy/family`, `/pricing`, `/farewell`
- `TributesSection` → `/legacy`
- `LegacyOutro` → `/legacy/family`, `/vault/explore`

---

## Fixes applied (post-audit)

- `/booklet` → `/memoirs`, `/packet` → `/legacy/family`, `/services` → `/contact` (redirects in `App.tsx`)
- Home drawer + legacy hamburger use `BEIZA_LINKS` (no bare `/booklet` / `/packet`)
- Logo → `/welcome` (`BeizaLogoLink`)
- Education home: section ids `#symbols`, `#cultural-films`, `#your-language`, `#start-legacy`, `#about`
- Legacy FAQs hamburger → `/legacy#faqs`
- Footer: internal vs external link handling; CMS `/#about` normalized to `/home#about`

---

*Generated for BEIZA implementation audit · Task 0. Updated after link fixes.*
