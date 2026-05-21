import type { NavigationLink, FooterLink } from "@/hooks/usePublicContent";
import { BEIZA_LINKS, BEIZA_REDIRECTS } from "@/lib/beizaMasterLinks";

export const FALLBACK_NAVIGATION_LINKS: NavigationLink[] = [
  { id: "fallback-nav-live", label: "Live Now", href: BEIZA_LINKS.welcome.gate, location: "primary", displayOrder: 1 },
  { id: "fallback-nav-events", label: "Events", href: BEIZA_LINKS.marketing.events, location: "primary", displayOrder: 2 },
  { id: "fallback-nav-gallery", label: "Gallery", href: BEIZA_REDIRECTS.gallery.from, location: "primary", displayOrder: 3 },
  { id: "fallback-nav-legacy", label: "Legacy", href: BEIZA_LINKS.legacy.app, location: "primary", displayOrder: 4 },
  // { id: "fallback-nav-memoirs", label: "Memoirs", href: BEIZA_LINKS.marketing.memoirs, location: "primary", displayOrder: 5 },
  { id: "fallback-nav-blog", label: "Blog", href: BEIZA_LINKS.marketing.blog, location: "primary", displayOrder: 5 },
  { id: "fallback-nav-contact", label: "Contact", href: BEIZA_LINKS.marketing.contact, location: "primary", displayOrder: 5, isCta: true },
];

export const FALLBACK_FOOTER_LINKS: FooterLink[] = [
  { id: "fallback-footer-about", label: "About Us", href: "/#about", groupLabel: "Sections", displayOrder: 1 },
  { id: "fallback-footer-events", label: "Events", href: BEIZA_LINKS.marketing.events, groupLabel: "Sections", displayOrder: 2 },
  { id: "fallback-footer-gallery", label: "Gallery", href: BEIZA_REDIRECTS.gallery.from, groupLabel: "Sections", displayOrder: 3 },
  { id: "fallback-footer-legacy", label: "Legacy Vault", href: BEIZA_LINKS.legacy.app, groupLabel: "Sections", displayOrder: 4 },
  { id: "fallback-footer-memoirs", label: "Memoirs", href: BEIZA_LINKS.marketing.memoirs, groupLabel: "Sections", displayOrder: 5 },
  { id: "fallback-footer-blog", label: "Blog", href: BEIZA_LINKS.marketing.blog, groupLabel: "Sections", displayOrder: 6 },
  { id: "fallback-footer-contact", label: "Contact", href: BEIZA_LINKS.marketing.contactHero, groupLabel: "Sections", displayOrder: 7 },
];

export const FALLBACK_SITE_SETTINGS = {
  businessName: "Beiza Plus",
  phonePrimary: "+233 55 900 0111",
  emailPrimary: "hello@beiza.tv",
  calendlyUrl: "https://calendly.com",
  heroHeading: "Build Intentional Legacy",
  heroSubheading:
    "It has never been about loss — it has always been about legacy. Every story, every voice, every design is our way of saying: their story, kept forever.",
  heroCtaLabel: "Start Your Legacy",
  heroCtaHref: BEIZA_LINKS.legacy.app,
  heroBackgroundImage: "/images/adinkra-hands-hero.png",
  heroBackgroundAlt: "Adinkra heritage — hands holding legacy",
  heroReviews: "100+ Families Preserved",
  footerTagline:
    "We design meaningful legacies — handcrafted records that celebrate life, culture, and family.",
  footerCopyrightSuffix: "Crafted with care, made to remember.",
  social: {
    instagram: "https://instagram.com/beizaplus",
    facebook: "https://facebook.com/beizaplus",
    tiktok: "https://tiktok.com/@beizaplus",
    youtube: "https://youtube.com/@beizaplus",
  },
} as const;

export const FALLBACK_HERO_LANDING = {
  slug: "landing-hero",
  heading: FALLBACK_SITE_SETTINGS.heroHeading,
  subheading: FALLBACK_SITE_SETTINGS.heroSubheading,
  ctaLabel: FALLBACK_SITE_SETTINGS.heroCtaLabel,
  ctaHref: FALLBACK_SITE_SETTINGS.heroCtaHref,
  backgroundMedia: {
    src: FALLBACK_SITE_SETTINGS.heroBackgroundImage,
    alt: FALLBACK_SITE_SETTINGS.heroBackgroundAlt,
  },
  reviews: FALLBACK_SITE_SETTINGS.heroReviews,
} as const;



export const FALLBACK_OFFERINGS = [
  {
    id: "fallback-offering-galleries",
    title: "Legacy Galleries",
    description: "Curated imagery of the people you love",
    icon_key: "image",
    display_order: 1,
  },
  {
    id: "fallback-offering-tributes",
    title: "Tributes",
    description:
      "Cinematic storytelling through video, photography, and written memoirs that capture every emotion.",
    icon_key: "heart",
    display_order: 2,
  },
  {
    id: "fallback-offering-brochures",
    title: "Printed Brochures & Keepsakes",
    description:
      "Elegant brochures, thank-you cards, and keepsakes crafted with premium paper and timeless finishes.",
    icon_key: "file-text",
    display_order: 3,
  },
  {
    id: "fallback-offering-screens",
    title: "Screens",
    description: "LED installations and stage visuals that turn family gatherings into immersive, high-definition experiences.",
    icon_key: "monitor",
    display_order: 4,
  },
  {
    id: "fallback-offering-coffins",
    title: "Coffins",
    description: "Signature handcrafted pieces that embody dignity, culture, and craftsmanship.",
    icon_key: "box",
    display_order: 5,
  },
  {
    id: "fallback-offering-legacy",
    title: "Legacy",
    description: "Legacy vaults, digital biographies, and preserved archives that keep every story alive forever.",
    icon_key: "cloud",
    display_order: 6,
  },
] as const;

export const FALLBACK_TESTIMONIALS = [
  {
    id: "fallback-testimonial-madamrose",
    quote: "She was a good lady. how else can we describe her?",
    author: "MadamRose",
    role: "Daughter",
    surfaces: ["landing"],
  },
  {
    id: "fallback-testimonial-1",
    quote: "Beiza captured every detail with empathy. Our celebration felt true to my mother’s spirit.",
    author: "Adwoa Mensah",
    role: "Daughter",
    surfaces: ["landing", "contact"],
  },
  {
    id: "fallback-testimonial-2",
    quote: "From the first call to the final celebration, the team handled everything with grace.",
    author: "Michael Ofori",
    role: "Brother",
    surfaces: ["landing"],
  },
  {
    id: "fallback-testimonial-3",
    quote: "The digital memoir meant relatives abroad could experience the tribute in full.",
    author: "Senam Amegashie",
    role: "Family Archivist",
    surfaces: ["landing"],
  },
  {
    id: "fallback-testimonial-4",
    quote: "Guests still talk about the stage design and live screens. It was breathtaking.",
    author: "Eunice Amponsah",
    role: "Event Partner",
    surfaces: ["landing", "services"],
  },
  {
    id: "fallback-testimonial-5",
    quote: "Their printed keepsakes are heirlooms we’ll share with future generations.",
    author: "Samuel Boateng",
    role: "Grandson",
    surfaces: ["landing"],
  },
  {
    id: "fallback-testimonial-6",
    quote: "The tribute film helped us laugh, cry, and remember together. It was healing.",
    author: "Vida Akua",
    role: "Family Friend",
    surfaces: ["landing"],
  },
  {
    id: "fallback-testimonial-7",
    quote: "They translated our ideas into a deeply personal remembrance. Every guest felt included and uplifted.",
    author: "Ama K. Boadu",
    role: "Celebration Planner",
    surfaces: ["contact"],
  },
  {
    id: "fallback-testimonial-8",
    quote: "Coordinating across continents felt effortless. Beiza handled the live stream and archive flawlessly.",
    author: "Kojo Adjei",
    role: "Family Historian",
    surfaces: ["contact"],
  },
  {
    id: "fallback-testimonial-9",
    quote: "Their team listened, created, and supported us like family. The tribute film still brings tears of joy.",
    author: "Naomi Afriyie",
    role: "Daughter",
    surfaces: ["contact"],
  },
] as const;

export const FALLBACK_FAQS = [
  {
    id: "fallback-faq-1",
    question: "What do I need to start preserving my family's legacy?",
    answer:
      "Start with your loved one’s story. We’ll guide you through gathering photos, milestones, and the voices of family and friends to build a meaningful narrative.",
    display_order: 1,
  },
  {
    id: "fallback-faq-2",
    question: "When is the right time to start?",
    answer:
      "If you’re seeking a celebration that feels personal and thoughtfully produced, we’ll meet you where you are, even if all you have is a desire to honor their legacy.",
    display_order: 2,
  },
  {
    id: "fallback-faq-3",
    question: "Can I use Beiza Legacy from outside Ghana?",
    answer:
      "Yes. Our team works across time zones with remote production, live streaming, and digital Keepsakes so every relative can participate.",
    display_order: 3,
  },
  {
    id: "fallback-faq-4",
    question: "How long does the process take?",
    answer:
      "Most tributes take 10 to 21 days depending on the scope. We adjust timelines to align with the family’s schedule and rites.",
    display_order: 4,
  },
  {
    id: "fallback-faq-5",
    question: "What kind of experiences do you create?",
    answer:
      "We support legacy gatherings, celebration services, family archives, and legacy unveilings — from intimate circles to multi-day productions.",
    display_order: 5,
  },
] as const;

export const FALLBACK_PRICING = [
  {
    id: "fallback-pricing-lite",
    name: "Lite",
    tagline: "Starting at",
    price_label: "GHS 8,500",
    description:
      "Story consultation, tribute film up to 5 minutes, on-site media crew, legacy vault microsite, and 30-day streaming replay.",
    badge_label: null,
    is_recommended: false,
    display_order: 1,
    features: ["Single location coverage", "Digital guestbook setup", "Keepsake highlight reel"],
  },
  {
    id: "fallback-pricing-signature",
    name: "Signature",
    tagline: "Starting at",
    price_label: "GHS 15,000",
    description:
      "Everything in Lite plus full ceremony direction, multi-camera broadcast, LED visual design, and printed keepsakes.",
    badge_label: "Featured",
    is_recommended: true,
    display_order: 2,
    features: ["Program design & printing", "Live stream with moderation", "Personalised stage backdrop"],
  },
  {
    id: "fallback-pricing-legacy",
    name: "Legacy",
    tagline: "Starting at",
    price_label: "Custom",
    description:
      "For multi-day celebrations, cross-border coordination, and archival projects that preserve decades of family history.",
    badge_label: null,
    is_recommended: false,
    display_order: 3,
    features: ["Ancestral archive production", "Heritage documentary series", "Heirloom book & gallery installation"],
  },
] as const;

export const FALLBACK_FEATURED_EVENT = {
  id: "fallback-event-monica-manu",
  slug: "monica-manu",
  memoir_slug: "monica-manu",
  title: "The Life of Madam Monica Manu",
  location: "Accra, Ghana",
  occurs_on: "2025-06-18",
  description: "A full-scale celebration blending live performances, immersive visuals, and digital archives.",
  subtitle: "A cinematic homegoing celebration",
  duration_label: "Live archive · Full memoir",
  hero_media: {
    src: "https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823",
    alt: "Joyful woman with smartphone",
  },
} as const;

export const FALLBACK_LIVE_EVENTS = [
  FALLBACK_FEATURED_EVENT,
  {
    id: "fallback-event-ernestina",
    slug: "madam-ernestina",
    memoir_slug: "madam-ernestina",
    title: "The Life of Madam Ernestina",
    location: "Kumasi, Ghana",
    occurs_on: "2026-03-15",
    description:
      "An intimate legacy gathering — voices, archive, and family presence preserved for generations.",
    subtitle: "Live production in progress",
    duration_label: "Streaming soon",
    hero_media: {
      src: "/images/beiza-ernestina-portrait-bw.png",
      alt: "Madam Ernestina — portrait in black and white",
    },
  },
] as const;

export const FALLBACK_EVENT_STORIES = [
  {
    id: "fallback-story-monica",
    slug: "monica-manu-story",
    title: "Madam Monica Manu",
    subtitle: "A matriarch whose faith and generosity shaped a community",
    duration_label: "2 hours 18 minutes",
    memoir_slug: "monica-manu",
    is_new: true,
    display_order: 1,
    hero_media: {
      src: "https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151",
      alt: "Celebration of Madam Monica Manu",
    },
  },
  {
    id: "fallback-story-kwame",
    slug: "kwame-osei-legacy",
    title: "Kwame Osei",
    subtitle: "Teaches preserving family trade stories across generations",
    duration_label: "1 hour 42 minutes",
    memoir_slug: null,
    is_new: true,
    display_order: 2,
    hero_media: {
      src: "https://framerusercontent.com/images/hOuECFey8F4ua6LAYVX7DHPnQ.png?width=1684&height=1140",
      alt: "Family gathered in celebration",
    },
  },
  {
    id: "fallback-story-ama",
    slug: "ama-darko-voices",
    title: "Ama Darko",
    subtitle: "Teaches recording elders before the stories fade",
    duration_label: "58 minutes",
    memoir_slug: null,
    is_new: false,
    display_order: 3,
    hero_media: {
      src: "https://framerusercontent.com/images/xsBNx9mI9Ew3pAqs1HZ9ywLrp0.png?width=1741&height=1153",
      alt: "Moments of song and remembrance",
    },
  },
  {
    id: "fallback-story-homegoing",
    slug: "homegoing-series",
    title: "Homegoing",
    subtitle: "Original series · Three families, one archive",
    duration_label: "3 episodes",
    memoir_slug: null,
    is_new: true,
    display_order: 4,
    hero_media: {
      src: "https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823",
      alt: "Joyful family remembrance",
    },
  },
  {
    id: "fallback-story-efua",
    slug: "efua-mensah-tribute",
    title: "Efua Mensah",
    subtitle: "Teaches designing a tribute that feels like them",
    duration_label: "1 hour 21 minutes",
    memoir_slug: null,
    is_new: false,
    display_order: 5,
    hero_media: {
      src: "https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151",
      alt: "Tribute film still",
    },
  },
  {
    id: "fallback-story-annan",
    slug: "kofi-annan-circle",
    title: "The Annan Circle",
    subtitle: "How a diaspora family rebuilt their vault from Accra to London",
    duration_label: "2 hours 4 minutes",
    memoir_slug: null,
    is_new: false,
    display_order: 6,
    hero_media: {
      src: "https://framerusercontent.com/images/hOuECFey8F4ua6LAYVX7DHPnQ.png?width=1684&height=1140",
      alt: "Family circle archive",
    },
  },
  {
    id: "fallback-story-yaa",
    slug: "yaa-asantewaa-wisdom",
    title: "Yaa Asantewaa",
    subtitle: "Teaches passing wisdom to grandchildren in Twi and English",
    duration_label: "47 minutes",
    memoir_slug: null,
    is_new: true,
    display_order: 7,
    hero_media: {
      src: "https://framerusercontent.com/images/xsBNx9mI9Ew3pAqs1HZ9ywLrp0.png?width=1741&height=1153",
      alt: "Elder sharing wisdom",
    },
  },
  {
    id: "fallback-story-white-swan",
    slug: "beiza-white-swan",
    title: "White Swan",
    subtitle: "On-the-ground memorial coordination — a Beiza Heritage film",
    duration_label: "1 hour 12 minutes",
    memoir_slug: null,
    is_new: false,
    display_order: 8,
    hero_media: {
      src: "https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823",
      alt: "Memorial gathering",
    },
  },
  {
    id: "fallback-story-nana",
    slug: "nana-yaw-archive",
    title: "Nana Yaw",
    subtitle: "Building a vault when the family is spread across four countries",
    duration_label: "1 hour 35 minutes",
    memoir_slug: null,
    is_new: false,
    display_order: 9,
    hero_media: {
      src: "https://framerusercontent.com/images/YRsXM0Ss8CIUK02VdEkSJYDNdHU.png?width=1658&height=1151",
      alt: "Archive production",
    },
  },
  {
    id: "fallback-story-voices",
    slug: "voices-that-stayed",
    title: "Voices That Stayed",
    subtitle: "Families on Beiza share what preservation changed for them",
    duration_label: "6 stories",
    memoir_slug: null,
    is_new: false,
    display_order: 10,
    hero_media: {
      src: "/images/beiza-ernestina-portrait-bw.png",
      alt: "Portrait — legacy preserved",
    },
  },
] as const;

export const FALLBACK_CONTACT_CHANNELS = [
  {
    id: "fallback-contact-phone",
    channel_type: "phone",
    label: "Phone",
    value: "+233 55 900 0111",
    display_order: 1,
  },
  {
    id: "fallback-contact-email",
    channel_type: "email",
    label: "Email",
    value: "hello@beiza.tv",
    display_order: 2,
  },
  {
    id: "fallback-contact-calendly",
    channel_type: "external",
    label: "Book a discovery call",
    value: "https://calendly.com",
    display_order: 3,
  },
] as const;

export const FALLBACK_MEMOIR_TRIBUTES = [
  {
    id: "fallback-tribute-1",
    memoir_id: "fallback-memoir-monica",
    memoir_slug: "monica-manu",
    name: "Mercy Asiwbour",
    relationship: "Daughter",
    message: "You held our family together with grace. Your prayers continue to light the way for us all.",
    display_order: 1,
  },
  {
    id: "fallback-tribute-2",
    memoir_id: "fallback-memoir-monica",
    memoir_slug: "monica-manu",
    name: "Samuel & Georgina",
    relationship: "Grandchildren",
    message: "Grandma, your songs still echo in the house. We promise to keep your storytelling alive.",
    display_order: 2,
  },
  {
    id: "fallback-tribute-3",
    memoir_id: "fallback-memoir-monica",
    memoir_slug: "monica-manu",
    name: "Teacher Asiwbour",
    relationship: "Husband",
    message: "For five decades you stood by me. Rest, my love, knowing your legacy lives on in every heart you touched.",
    display_order: 3,
  },
  {
    id: "fallback-tribute-4",
    memoir_id: "fallback-memoir-monica",
    memoir_slug: "monica-manu",
    name: "Grace and family",
    relationship: "Family Friend",
    message: "Your hospitality welcomed us at every celebration. We cherish the memories of your radiant smile.",
    display_order: 4,
  },
  {
    id: "fallback-tribute-5",
    memoir_id: "fallback-memoir-monica",
    memoir_slug: "monica-manu",
    name: "Kwadwo & Afua",
    relationship: "In-law",
    message: "Thank you for showing us what humility, strength, and unwavering faith truly look like.",
    display_order: 5,
  },
  {
    id: "fallback-tribute-6",
    memoir_id: "fallback-memoir-monica",
    memoir_slug: "monica-manu",
    name: "The All Nations Choir",
    relationship: "Choir",
    message: "We will sing your favourite hymns in your honour, as you always requested with joyful tears.",
    display_order: 6,
  },
] as const;

