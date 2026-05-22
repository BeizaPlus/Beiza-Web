# Beiza volume slider + plans UI (deferred)

**Status:** Saved for later — **not in scope** for the current layout/legacy baseline.  
**Saved:** 22 May 2026  
**Visual reference:** Resend “Plans” modal (transactional email pricing) — use as pattern only, not a copy of their product.

---

## What we liked (keep for Beiza)

### Overall look

- Dark canvas (`#000` / near-black), white primary type, muted gray secondary copy  
- Centered modal-style panel with clear title and close control  
- Calm, product-grade spacing — cards breathe, nothing cramped  
- Green checkmarks for included features; restrained borders on cards  

### Volume slider (hero control)

- **Thin horizontal track** (gray line) full width above the tier grid  
- **White circular thumb** on the track — snaps or slides between volume steps  
- **Step labels under the track:** `3,000` · `50,000` · `100,000` … up to `3,000,000+`  
- Moving the thumb **updates which plan column is “active”** and likely price copy on cards below  
- Feels like “pick your scale first, then choose tier” — good for Beiza **storage minutes**, **circle size**, or **Keeper/Heritage** pricing later  

### Tier cards (four-up grid)

| Pattern | Detail |
|--------|--------|
| Card shell | Rounded rect, 1px gray border, same height row |
| Price | Large `$X / mo` or **Custom** for enterprise |
| Subline | Volume included per month + optional overage line (`Extra emails: $0.90 / 1,000`) |
| CTA | One primary action per card (implied; Resend uses selection via slider + plan highlight) |
| Features | Short checklist under price block |

### Top toggle (optional for Beiza)

- Pill toggle: e.g. **Transactional** vs **Marketing** (for us: **Circle** vs **Heritage** or **Monthly** vs **Annual**)  
- Selected segment: filled dark gray pill; inactive: text only  

---

## Beiza mapping (when we build this)

| Resend pattern | Possible Beiza use |
|----------------|-------------------|
| Volume slider | Vault storage tiers, recording minutes, or family-circle size |
| Free / Pro / Scale / Enterprise | **Circle** (free) · **Keeper** · **Heritage** · **Custom / White Swan** |
| `3,000+` steps | Discrete steps in canonical JSON (like layout studio), not infinite drag |
| Dark modal | `/pricing` overhaul or in-app upgrade modal from vault/legacy |

Wire to existing product language: `docs/BEIZA-PHILOSOPHY.md`, Stripe Keeper/Heritage in `BEIZA_WEB_SUMMARY.md`.

---

## Implementation notes (later)

1. **Slider:** discrete stops (not free-form) — align with `layoutBreakpoints`-style stepped UX  
2. **State:** selected volume index drives highlighted card + price strings from JSON/CMS  
3. **Canonical file (future):** e.g. `src/data/pricing-volume-canonical.json` — do not add until product confirms tiers  
4. **A11y:** arrow keys between stops; visible focus ring on thumb; `aria-valuenow` per step  
5. **Mobile:** stack cards vertically; slider stays horizontal with scrollable labels or fewer stops  

---

## Do not do now

- No new routes, components, or Stripe changes in the current sprint  
- No Resend branding or copy — **interaction + visual tone only**

---

## Reference screenshot

Store a capture under `docs/progress-snapshots/` when ready, e.g. `pricing-slider-reference-resend-YYYY-MM-DD.png` (user-provided Resend Plans UI, May 2026).
