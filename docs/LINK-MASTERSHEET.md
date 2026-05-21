# Beiza link mastersheet

**Do not hardcode product paths in new code.** Import from `src/lib/beizaMasterLinks.ts`.

| Artifact | Purpose |
|----------|---------|
| `src/lib/beizaMasterLinks.ts` | Code source of truth |
| `docs/LINK-MASTERSHEET.md` | This spreadsheet (human) |
| `npm run links:check` | Fails CI/dev if invariants break |

Production reference: welcome **Education** card → **education home** at `/home` (`Landing.tsx` — Build Intentional Legacy).

---

## Locked rules (never stray)

| Rule | Path | Why |
|------|------|-----|
| Welcome **Education** card | `/home` (all locales) | Education home — intentional legacy landing |
| Welcome **Legacy** card | `/legacy/record` | Record tab (landscape hero + station below) |
| Welcome **Farewell** card | Locale farewell (see below) | Memorial / White Swan heritage |
| Legacy cultural immersion URL | `/education`, `/af/education`, … | **Redirects** to `/home` (bookmarks) |
| Same product all regions | Only Legacy **photo** + farewell **copy** change | US/IN/LA/CN/BR toggle |

---

## Welcome gate cards (`/` · `/welcome`)

DOM order: **Education · Legacy · Farewell**

| Card | EN title | Href (EN) | Page |
|------|----------|-----------|------|
| Education | Learn your culture | `/home` | `Landing.tsx` — education home |
| Legacy | Preserve a life story | `/legacy/record` | `legacy/record.tsx` |
| Farewell | Craft a memorial | See regional table | `Heritage.tsx` |

```ts
import { getWelcomeCardHref, WELCOME_CARD_TARGETS } from "@/lib/beizaMasterLinks";
// education → regionalEducationWrapperPath(locale)  (always /home)
// legacy    → WELCOME_CARD_TARGETS.legacy           (/legacy/record)
```

### Farewell card by locale

| Locale | Toggle | Farewell href |
|--------|--------|---------------|
| black-american | US | `/farewell` |
| indian | IN | `/in/farewell` |
| latina | LA | `/la/farewell` |
| chinese | ZH | `/zh/farewell` |
| brazilian | BR | `/br/farewell` |
| africa | AF | `/af/farewell` |
| french | FR | `/fr/farewell` |

### Education card by locale

| Locale | Education href |
|--------|----------------|
| All (GH, EN, ES, FR, CN, …) | `/home` |

**Region toggle** — language/copy switches with US/IN/LA/CN/BR (native tongue in `welcomeCopy.ts`). **Pin** (`beiza-locale-pinned`): locks language on reload; unpinned uses browser detection. Legacy photo still follows selected region. Pin does not block live toggle switches.

---

## Education funnel

| Step | Path | Component | Notes |
|------|------|-----------|-------|
| Welcome card | `/home` | `Landing.tsx` | **Education home** — Build Intentional Legacy |
| Story questions | `/education/story-questions` | `StoryQuestionsArticle.tsx` | SEO article; back link → `/home` |
| Legacy cultural immersion | `/education`, `/af/education`, … | redirect → `/home` | Old URLs only |

---

## Legacy product

| Path | Component | Use |
|------|-----------|-----|
| `/legacy` | `legacy/index.tsx` | App shell home |
| `/legacy/record` | `legacy/record.tsx` | **Welcome Legacy card** → record station; hero uses `beiza-legacy-record-tab-landscape.png` |
| `/legacy/vault` | `legacy/vault.tsx` | Voice vault |
| `/legacy/family` | `legacy/family.tsx` | Family / circles |
| `/legacy/circle` | `legacy/circle.tsx` | In-app tree |
| `/heritage` | `HeritageLegacyLanding.tsx` | Memoir marketing (MyStories style) |
| `/record` | `RecordRedirect.tsx` | → `/legacy/record` or circle record |

---

## Farewell & redirects

| Path | Target | Notes |
|------|--------|-------|
| `/farewell` | `Heritage.tsx` | Farewell heritage |
| `/white-swan` | redirect → `/farewell` | Legacy URL |
| `/education` | redirect → `/home` | Legacy cultural immersion |
| `/af/education`, `/in/education`, … | redirect → `/home` | Regional legacy URLs |
| `/gallery` | redirect → `/circle` | Nav label “Gallery” |
| `/vault` | redirect → `/legacy/vault` | |
| `/family-trees` | redirect → `/circle` | Alias |

---

## Circle / family trees

| Path | Component |
|------|-----------|
| `/circle` | `family-trees/index.tsx` |
| `/circle/:id/enter` | `family-trees/enter.tsx` |
| `/circle/:id/tree` | `family-trees/tree.tsx` |
| `/circle/:id/record` | `family-trees/record.tsx` |

---

## Marketing & content

| Path | Component |
|------|-----------|
| `/pricing` | `Pricing.tsx` |
| `/contact` | `Contact.tsx` |
| `/events` | `Events.tsx` |
| `/blog` | `BlogPosts.tsx` |
| `/blog/:slug` | `BlogPost.tsx` |
| `/memoirs/:slug?` | `Memoirs.tsx` |
| `/vault/explore` | `VaultExplore.tsx` |
| `/tribute/:id?` | `TributePage.tsx` |
| `/memory/:token` | `MemoryShare.tsx` |
| `/recover` | `Recover.tsx` |
| `/download` | `Download.tsx` |
| `/order-confirmation` | `OrderConfirmation.tsx` |

---

## Regional wrappers (`RegionalRoutePage`)

| Prefix | Locales | Heritage | Farewell |
|--------|---------|----------|----------|
| (none) | US | `/heritage` | `/farewell` |
| `/in` | indian | `/in/heritage` | `/in/farewell` |
| `/la` | latina | `/la/heritage` | `/la/farewell` |
| `/zh` | chinese | `/zh/heritage` | `/zh/farewell` |
| `/br` | brazilian | `/br/heritage` | `/br/farewell` |
| `/af` | africa | `/af/heritage` | `/af/farewell` |
| `/fr` | fr | `/fr/heritage` | `/fr/farewell` |

Education regional paths (`/af/education`, etc.) redirect to `/home` — not rendered by `RegionalRoutePage`.

---

## Header nav (locked)

`Navigation.tsx` always uses `PRODUCT_NAV_LINKS` from `src/config/productNav.ts` — CMS `navigation_links` rows do **not** replace the header (prevents Vault/Circle/Heritage flash).

| Label | Path |
|-------|------|
| Vault | `/vault` → redirects to `/legacy/vault` |
| Circle | `/circle` |
| Heritage | `/heritage` |

Contact CTA: pill button → `/contact`.

Hero CTA on `/home`: **Start Your Legacy** → `/legacy` (fallback settings).

---

## Studio & storage

| Key / query | Purpose |
|-------------|---------|
| `?studio=1` | Welcome layout studio (localhost) |
| `welcome-gate-studio` | Saved card crops |
| `beiza-locale` | Character region |
| `beiza-welcome-theme` | `dark` \| `light` |

---

## Change checklist

1. Edit `src/lib/beizaMasterLinks.ts`
2. Update this mastersheet
3. Wire any new UI links via `BEIZA_LINKS` / `getWelcomeCardHref`
4. Run `npm run links:check`
5. Run `node scripts/welcome-smoke-test.mjs` if welcome gate touched

---

## Files already wired to mastersheet

- `src/pages/WelcomeGate.tsx` — `getWelcomeCardHref`
- `src/App.tsx` — redirects
- `src/pages/Landing.tsx` — education home
- `src/lib/fallbackContent.ts`
- `src/lib/educationStoryQuestionsContent.ts`
- `src/pages/RecordRedirect.tsx`
