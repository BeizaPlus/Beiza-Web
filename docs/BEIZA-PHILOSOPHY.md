# Beiza philosophy

**Canonical brief:** [product/PHILOSOPHY-UX-BRIEF.md](./product/PHILOSOPHY-UX-BRIEF.md)  
**Code map:** [product/IMPLEMENTATION.md](./product/IMPLEMENTATION.md)

## Core belief

**Legacy is intention, not loss.**

Families preserve voices, rituals, and symbols *while people are alive* — not only in urgency after someone passes.

## Three doors (welcome gate)

| Door | Meaning | Routes |
|------|---------|--------|
| **Education** | Learn culture — films, Adinkra, prompts | `/home`, `/education` |
| **Legacy** | Preserve a life — record, tree, vault | `/legacy/*`, `/circle` |
| **Farewell** | Memorial dignity — White Swan, homegoing | `/farewell`, `/heritage` |

## Death-free zones

**Education** and **Legacy record/vault** never mention death, farewell, or grief. Farewell surfaces only when the user is ready — one quiet line on legacy surfaces links to `/farewell`.

**Exception:** `/recover` may acknowledge loss.

## For builders

- Read `docs/product/PHILOSOPHY-UX-BRIEF.md` before changing copy or lanes  
- Import tone constants from `src/lib/productPhilosophy.ts`  
- Read `docs/LINK-MASTERSHEET.md` before adding routes  
- Import images from `MEDIA_ASSETS`, not string paths  

## North star

> Their story, kept forever — in voice, in tree, in symbol, in language.
