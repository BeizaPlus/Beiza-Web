# Beiza — Product Philosophy & UX Flow Brief

**For Cursor / dev handoff** · April 2026 · Talking Images LLC / [beizaplus.com](https://beizaplus.com)

---

## Contents

1. [What Beiza is](#what-beiza-is)
2. [The three paths](#the-three-paths--one-product-three-doors)
3. [Critical UX principle](#the-critical-ux-principle)
4. [Natural reveal — Farewell](#the-natural-reveal--how-farewell-surfaces)
5. [Monetization](#monetization--every-path-has-its-own-revenue)
6. [Recovery exception](#the-recovery-exception)
7. [What each page must never do](#what-each-page-must-never-do)
8. [Hero copy](#hero-copy--approved-options)
9. [Seedream — Relive History](#the-seedream-feature--relive-history-education-path)
10. [Summary](#summary-in-one-sentence)

---

## What Beiza is

Beiza is a family legacy platform for African and diaspora families. **Ghana-first, built global.**

**Core belief:** Legacy is intention, not loss.

Families should choose to preserve voices, stories, and cultural symbols while people are alive — not only in a rush after someone passes.

Think **Storyworth** (weekly questions → recorded answers → keepsake), extended with:

- A **voice vault** (replay forever, not just a printed book)
- A **family tree** (memories linked to real people)
- **Cultural education** (Adinkra symbols, language, film)
- A **farewell lane** — only when the time comes

| | |
|---|---|
| **Stack** | Vite + React + Tailwind · Supabase (data + auth) · Vercel serverless |
| **Repo** | `C:\Users\steve\BeizaPlus\Beiza-Web` |
| **Live** | https://beizaplus.com (auto-deploy from `main`) |

---

## The three paths — one product, three doors

The site has three lanes. Each is a complete product. They connect — they do not bleed into each other.

| Path | What it is | Routes |
|------|------------|--------|
| **1. Education** | Learn culture: symbols, films, language, story prompts | `/home`, `/education` |
| **2. Legacy (Record)** | Preserve a life: record, vault, family tree, circle | `/legacy/record`, `/legacy/vault`, `/circle` |
| **3. Farewell** | Plan memorial / homegoing: Heritage, White Swan | `/farewell`, `/heritage` |

Users land on the **welcome gate** (`/welcome`) and pick the door that fits them.

---

## The critical UX principle

### Education and Record are death-free zones. No exceptions.

This is product architecture, not a style preference.

**Education** is cultural pride — curiosity, celebration, identity. No loss in the story yet. Discovery language only.

**Legacy / Record** celebrates a **living** person. Active, forward, generative. The proudest thing a family can do.

**Neither path mentions death. Neither mentions farewell. Neither references what comes after.**

---

## The natural reveal — how Farewell surfaces

Education and Record do not push Farewell. They are so complete that the user asks:

> *"This is beautiful. What happens when I lose someone?"*  
> *"We have all these recordings. What do we do when they're gone?"*  
> *"My mother is ill. Is there something here when the time comes?"*

That question is the door. The user opens it. Beiza does not push.

### UI nudge (Legacy only)

At the bottom of **Record** and **Vault** (after value is felt), one quiet line:

> **When the time comes, Beiza walks with you.**

One line. No death language. No funeral language. Links to `/farewell`. That is all.

**Education has no such nudge.** Education is complete in itself.

*Implemented:* `LegacyFarewellNudge` · `src/lib/productPhilosophy.ts`

---

## Monetization — every path has its own revenue

Nothing is a loss leader. Every interaction can be a transaction.

### Path 1: Education

| Product | Format | Example |
|---------|--------|---------|
| Symbol library download | PDF | Full 96-symbol Adinkra PDF |
| Cultural print packs | Physical | Framed symbol sets, posters |
| Language guides | PDF / booklet | Regional immersion packs |
| Email list | Lead → upsell | "Send me the full symbol list" |
| Education membership | SaaS | Monthly symbol vault + films |

### Path 2: Legacy / Record

| Product | Format | Example |
|---------|--------|---------|
| Voice vault storage | SaaS | Free (3) → Keeper (unlimited + download) |
| Family circle access | Paid invite | 6-character code, paid seat |
| Memoir page publishing | One-time | Public story page |
| Family tree book | Print | Print-on-demand tree + photos |
| Voice download | Per-download | Keeper or one-time unlock |
| AI tree guide | Premium | Guided prompts, relationship mapping |

### Path 3: Farewell

| Product | Format | Example |
|---------|--------|---------|
| Heritage package | Service | Cultural homegoing, Adinkra, storytelling |
| White Swan package | Premium | Full dignified gathering |
| Memorial Instagram reels | Digital | Produced tribute video |
| Memorial print media | Physical | Programs, tribute books |
| Commissioned busts | Physical | Sculptural memorial |
| Coffins (pre-need) | Physical | Premium, culturally designed |
| Recovery service | Priority | `/recover` — voices after loss |

---

## The recovery exception

`/recover` lives **outside** the three-path structure.

For families who lost someone before they could record. They come in grief, seeking fragments — voice notes, videos, photos. Beiza helps compile what exists.

This page **may** acknowledge loss directly. It is the only one that can. Still dignified, not clinical.

---

## What each page must never do

| Page | Never |
|------|--------|
| `/education`, `/home` | Farewell, death, loss, grief, "when they're gone" |
| `/legacy/record`, `/legacy/vault`, `/circle` | Frame recording as something you do because people die |
| `/home` | Lead with loss, sadness, death-urgency |
| Any non-farewell page | funeral, memorial, coffin, burial, grief, mourning, passing |

---

## Hero copy — approved options

Current live copy ("Build Intentional Legacy") is acceptable but too abstract.

**Option A (implemented in code):**

> **This is where you come from.**  
> Learn your roots, record your family's voice, and carry the symbols of your people forward.

**Option B:**

> **Your history lives in you.**  
> Learn your roots, record your family's voice, and carry it forward — Ghana-first, open to families everywhere.

**Option C:**

> **Born from something older than you know.**  
> Learn your origins, record your family's voice, and keep your culture alive.

**Rules:** No em dashes in subhead. No death language. No urgency framing. CTA stays **Start Your Legacy.**

---

## The Seedream feature — Relive History (Education path)

**Status:** Spec only — not shipped.

### What it is

Premium Education: user uploads photos; Beiza fine-tunes a likeness model (fal.ai). Output: user **in** historical Ghanaian / African scenes — chiefs, Akan ceremonies, trade routes. Pride and wonder, not grief.

**Internal name:** Seedream · **Public:** *Relive History* or *Step Into Your Origins*

### Pipeline (summary)

1. Upload 5–15 face photos → Supabase storage  
2. LoRA fine-tune via fal.ai (`fal-ai/flux/dev/lora` or dreambooth)  
3. User picks curated scene → generate with user LoRA  
4. Deliver to vault; share link; optional archival print  

### fal.ai routing

- Image: `fal-ai/flux-lora` + user weights  
- Video (optional): `fal-ai/kling-video` or `fal-ai/seedance`  
- API key: Vercel env only  

### Monetization (planned)

| Tier | Model |
|------|--------|
| Trial | 1 watermarked scene free |
| Scenes pack | $9.99 / 5 scenes |
| Roots membership | Included in Education tier |
| Archival print | $29–79 framed |
| Animated clip | $4.99 or premium tier |

### UX constraints

- Lives in `/education` or `/relive` only  
- Zero farewell language  
- Historically grounded scenes — no fabricated culture  
- Clear consent for face/biometric-adjacent data at upload  

---

## Summary in one sentence

Beiza is a global family-legacy platform where you learn your culture, record and vault voices on a family tree, and plan a dignified farewell — Ghana at the heart, open to the world — and every step of that journey is a product someone can buy.

---

*See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for file-level mapping.*
