# Beiza image assets (local / SEO)

**Rule:** All production images live here. Import paths from `src/lib/mediaAssets.ts` only.

## Naming pattern

`beiza-storyworth-{product}-{subject}-{usage}.{ext}`

- **storyworth** — signals family interview / memoir positioning for SEO & AEO  
- **product** — home, welcome, record, farewell, heritage, events, circle, brand  
- **subject** — who or what is in frame  
- **usage** — hero, portrait, mockup, poster, scene  

## Inventory

| File | Usage |
|------|--------|
| `beiza-storyworth-brand-mascot-head.png` | Logo mascot, favicon, welcome |
| `beiza-storyworth-home-intentional-legacy-adinkra-hero.png` | Homepage / education hero fallback |
| `beiza-storyworth-home-product-leader-mockup.png` | What We Do mockup |
| `beiza-storyworth-welcome-legacy-*` | Welcome Legacy card per locale |
| `beiza-storyworth-record-hero-*` | Record tab hero |
| `beiza-storyworth-farewell-*` | Farewell / White Swan |
| `beiza-storyworth-heritage-*` | Heritage landing + ancestry scenes |
| `beiza-storyworth-events-ernestina-portrait-bw.png` | Events hero |
| `beiza-storyworth-event-live-tribute-performance.png` | Event stories |
| `beiza-storyworth-offering-legacy-family-galleries.png` | Offerings / featured event |
| `beiza-storyworth-circle-adinkra-stamp-hand.png` | Circle directory cards |
| `beiza-storyworth-testimonial-family-voice-avatar.png` | Testimonials |

## Deprecated paths (do not use in new code)

| Old | Replacement |
|-----|-------------|
| `adinkra-hands-hero.png` | `beiza-storyworth-home-intentional-legacy-adinkra-hero.png` |
| `/assets/legacy-hero.jpg` | `beiza-storyworth-heritage-memoir-legacy-hero.jpg` |
| `framerusercontent.com/...` | Local files above |
| `/Beiza-head.png` | `beiza-storyworth-brand-mascot-head.png` |

## Check

```bash
npm run media:check
```
