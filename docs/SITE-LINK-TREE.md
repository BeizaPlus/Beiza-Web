# Beiza site link tree

Human-readable map of public routes. Code source of truth: `src/lib/beizaMasterLinks.ts` · `docs/LINK-MASTERSHEET.md`.

```
beizaplus.com
├── / ........................... Welcome gate (Education · Legacy · Farewell cards)
├── /welcome .................... Alias → welcome gate
├── /home ....................... Education home — Build Intentional Legacy (Landing)
├── /education .................. Redirect → /home (legacy URL)
├── /education/story-questions .. 52 family story questions (Storyworth-style SEO)
├── /legacy ..................... Legacy app shell
│   ├── /legacy/record .......... Record station (voice vault)
│   ├── /legacy/circle .......... Family tree (sign-in → tree)
│   ├── /legacy/vault ........... Voice vault
│   └── /legacy/family .......... Invite / family circles
├── /heritage ................... Memoir marketing (MyStories style)
├── /farewell ................... Farewell heritage · White Swan
├── /white-swan ................. Redirect → /farewell
├── /circle ..................... Family trees directory
│   └── /circle/:id/enter|tree|record
├── /vault ...................... Redirect → /legacy/vault
├── /gallery .................... Redirect → /circle
├── /events ..................... Events & stories
├── /memoirs/:slug? ............. Memoir pages
├── /blog ....................... Blog
├── /pricing .................... Plans
├── /contact .................... Contact
├── /record ..................... Redirect → record or circle record
└── Regional (locale wrappers)
    ├── /af/heritage · /af/farewell · /af/education → /home
    ├── /fr/heritage · /fr/farewell · /fr/education → /home
    ├── /in/ · /la/ · /zh/ · /br/ … (same pattern)
```

## Header nav (locked)

| Label | Path |
|-------|------|
| Vault | `/vault` → `/legacy/vault` |
| Circle | `/circle` |
| Heritage | `/heritage` |
| Contact (CTA) | `/contact` |

## Welcome cards (all locales)

| Card | Path |
|------|------|
| Education | `/home` |
| Legacy | `/legacy/record` |
| Farewell | `/farewell` or `/af/farewell`, etc. |

## Media

All raster images: `/public/images/beiza-storyworth-*` — see `src/lib/mediaAssets.ts` and `public/images/ASSETS.md`.

## Validation

```bash
npm run links:check
npm run media:check
```
