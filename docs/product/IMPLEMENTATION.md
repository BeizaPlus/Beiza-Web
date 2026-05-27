# Philosophy brief → code map

How [PHILOSOPHY-UX-BRIEF.md](./PHILOSOPHY-UX-BRIEF.md) is enforced in `Beiza-Web`.

## Core belief & hero (Education `/home`)

| Brief rule | Code |
|------------|------|
| Hero Option A | `productPhilosophy.ts` → `EDUCATION_HERO_*` |
| CMS/fallback override | `educationPageCopy.ts` → `educationHeroHeading()`, `educationHeroSubheading()` |
| Wired on page | `pages/Landing.tsx` |
| Static fallback | `lib/fallbackContent.ts` → `FALLBACK_SITE_SETTINGS` |

## Death-free zones

| Zone | Guard |
|------|--------|
| `/home`, `/education` | `DEATH_FREE_ZONE_PATTERN` in `productPhilosophy.ts` |
| Non-farewell marketing | Extend pattern when adding new public copy helpers |

**Allowed loss language:** `/farewell`, `/heritage`, `/recover` only.

## Farewell reveal (natural, not pushed)

| Brief rule | Code |
|------------|------|
| One line, links to farewell | `FAREWELL_REVEAL_NUDGE` + `LegacyFarewellNudge.tsx` |
| Record path | `RecordMemoryView.tsx` → seal step |
| Vault | `pages/legacy/vault.tsx` |
| Legacy home | `pages/legacy/index.tsx` |
| **Not** on Education | No `LegacyFarewellNudge` in `Landing.tsx` |

## Three paths (welcome gate)

| Path | Routes | Welcome card |
|------|--------|----------------|
| Education | `/home`, `/education` | `WelcomeGate.tsx` + `getWelcomeCardHref()` |
| Legacy | `/legacy/*`, `/circle` | `beizaMasterLinks.ts` |
| Farewell | `/farewell`, `/heritage` | Regional routes in `welcomeRegionalRoutes` |

## Seedream / Relive History

Spec only in brief § Seedream — **not implemented** yet. Planned route: `/education/relive` or `/relive` (TBD).

## Monetization

Documented in brief tables; product surfaces:

- Education PDF lead: `CulturePdfLeadSection.tsx`
- Keeper tier: `LegacyKeeperUpsellDialog.tsx`, `useLegacyEntitlement`
- Farewell commerce: `pages/Heritage.tsx`, Shopify panels
