# Beiza site summary

## What Beiza is

Beiza is a **family legacy platform** that combines:

1. **Storyworth-style recording** — interview prompts, magic-link sign-in, private voice vault  
2. **Cultural education** — immersion films and Adinkra symbols by region  
3. **Family tree & circles** — people, biographies, recordings linked to nodes  
4. **Farewell & heritage** — memorial dignity (White Swan, Gye Nyame, homegoing)

## Primary user journeys

| Journey | Entry | Outcome |
|---------|--------|---------|
| Discover | `/` welcome gate | Pick Education, Legacy, or Farewell |
| Build legacy | `/home` → `/legacy/record` | Record and vault a voice |
| Grow tree | `/legacy/circle` | Sign in → family tree |
| Honor farewell | `/farewell` | Heritage memorial experience |
| Read prompts | `/education/story-questions` | SEO article + links to vault |

## Technical stack

- **Frontend:** React, Vite, Tailwind, React Router  
- **Content:** Supabase when configured; static fallbacks in `src/lib/fallbackContent.ts`  
- **SEO/AEO:** `src/lib/seo/siteSeo.ts`, `SeoManager`, JSON-LD (WebSite, Organization, SoftwareApplication, FAQPage)  
- **Assets:** Local only under `/public/images/` — `src/lib/mediaAssets.ts` (no Framer CDN in fallbacks)

## Key files

| Area | File |
|------|------|
| Routes & links | `src/lib/beizaMasterLinks.ts` |
| Images | `src/lib/mediaAssets.ts` |
| Welcome copy | `src/lib/locale/welcomeCopy.ts` |
| Layout studio | `src/lib/pageLayoutStudio.ts`, `src/lib/legacyNavStudio.ts` |
| Philosophy | `docs/BEIZA-PHILOSOPHY.md` |

## Deploy checklist

1. `npm run build`  
2. `npm run links:check`  
3. `npm run media:check`  
4. Confirm `public/sitemap.xml` and `robots.txt`  
5. Hard-refresh CDN after asset renames
