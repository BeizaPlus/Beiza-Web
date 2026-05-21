# Beiza link mastersheet

**Do not hardcode product paths in new code.** Import from `src/lib/beizaMasterLinks.ts`.

| Artifact | Purpose |
|----------|---------|
| `src/lib/beizaMasterLinks.ts` | Code source of truth |
| `docs/LINK-MASTERSHEET.md` | This spreadsheet (human) |
| `npm run links:check` | Fails CI/dev if invariants break |

Production reference: [beizaplus.com/home](https://www.beizaplus.com/home) = welcome **Education** lead-in.

---

## Locked rules (never stray)

| Rule | Path | Why |
|------|------|-----|
| Welcome **Education** card | `/home` | Build Intentional Legacy marketing home |
| Welcome **Legacy** card | `/legacy/record` | Record tab (landscape hero + station below) |
| Welcome **Farewell** card | Locale farewell (see below) | Memorial / White Swan heritage |
| Education **hub** (nav/footer) | `/education` | Adinkra symbols — not the welcome card |
| Same product all regions | Only Legacy **photo** changes | US/IN/LA/CN/BR toggle |

---

## Welcome gate cards (`/` · `/welcome`)

DOM order: **Education · Legacy · Farewell**

| Card | EN title | Href (all character locales) | Page | Production URL |
|------|----------|------------------------------|------|----------------|
| Education | Learn your culture | `/home` | `Landing.tsx` | https://www.beizaplus.com/home |
| Legacy | Preserve a life story | `/legacy/record` | `legacy/record.tsx` | /legacy/record |
| Farewell | Craft a memorial | See regional table | `Heritage.tsx` | /farewell or /in/farewell … |

```ts
import { getWelcomeCardHref, WELCOME_CARD_TARGETS } from "@/lib/beizaMasterLinks";
// education → WELCOME_CARD_TARGETS.education  (/home)
// legacy    → WELCOME_CARD_TARGETS.legacy     (/legacy/record)
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

Education is **always** `/home` — no `/in/home`.

**Region toggle** — language/copy switches with US/IN/LA/CN/BR (native tongue in `welcomeCopy.ts`). **Pin** (`beiza-locale-pinned`): locks language on reload; unpinned uses browser detection. Legacy photo still follows selected region. Pin does not block live toggle switches.

---

## Education funnel

| Step | Path | Component | Notes |
|------|------|-----------|-------|
| Welcome card | `/home` | `Landing.tsx` | **Lead-in** — intentional legacy hero |
| Symbols hub | `/education` | `Education.tsx` | Adinkra grid; nav links here |
| Story questions | `/education/story-questions` | `StoryQuestionsArticle.tsx` | SEO article |
| Regional wrapper | `/in/education` etc. | `RegionalRoutePage` | Sets locale; still `Education.tsx` — **not** used by welcome card |

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

| Prefix | Locales | Heritage | Farewell | Education wrapper |
|--------|---------|----------|----------|-------------------|
| (none) | US | `/heritage` | `/farewell` | `/education` |
| `/in` | indian | `/in/heritage` | `/in/farewell` | `/in/education` |
| `/la` | latina | `/la/heritage` | `/la/farewell` | `/la/education` |
| `/zh` | chinese | `/zh/heritage` | `/zh/farewell` | `/zh/education` |
| `/br` | brazilian | `/br/heritage` | `/br/farewell` | `/br/education` |
| `/af` | africa | `/af/heritage` | `/af/farewell` | `/af/education` |
| `/fr` | fr | `/fr/heritage` | `/fr/farewell` | `/fr/education` |

---

## Fallback nav (when CMS empty)

Defined in `src/lib/fallbackContent.ts` using `BEIZA_LINKS`:

| Label | Path |
|-------|------|
| Live Now | `/` (welcome gate) |
| Events | `/events` |
| Gallery | `/gallery` → redirects to `/circle` |
| Legacy | `/legacy` |
| Blog | `/blog` |
| Contact | `/contact` |

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
- `src/pages/Education.tsx`
- `src/lib/fallbackContent.ts`
- `src/lib/educationStoryQuestionsContent.ts`
- `src/pages/RecordRedirect.tsx`
