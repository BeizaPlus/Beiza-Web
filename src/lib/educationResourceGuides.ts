/** Education lead magnets — PDFs in /public/downloads */

export const EDUCATION_RESOURCE_GUIDES = [
  {
    id: "adinkra-starter",
    title: "Adinkra symbols",
    subtitle: "Starter guide",
    badge: "Guide 01",
    href: "/downloads/adinkra-symbols-starter-guide.pdf",
    cover: "gold" as const,
  },
  {
    id: "story-prompts",
    title: "Story prompts",
    subtitle: "Cultural symbols",
    badge: "Guide 02",
    href: "/downloads/cultural-symbols-story-prompts.pdf",
    cover: "ink" as const,
  },
] as const;

export type EducationResourceGuide = (typeof EDUCATION_RESOURCE_GUIDES)[number];
