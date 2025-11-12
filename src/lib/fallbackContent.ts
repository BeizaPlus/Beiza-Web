export const FALLBACK_NAVIGATION_LINKS = [
  { id: "fallback-nav-live", label: "Live Now", href: "/", location: "primary", display_order: 1 },
  { id: "fallback-nav-events", label: "Events", href: "/events", location: "primary", display_order: 2 },
  { id: "fallback-nav-gallery", label: "Gallery", href: "/gallery", location: "primary", display_order: 3 },
  { id: "fallback-nav-memoirs", label: "Memoirs", href: "/memoirs", location: "primary", display_order: 4 },
  { id: "fallback-nav-contact", label: "Contact", href: "/contact", location: "primary", display_order: 5, is_cta: true },
] as const;

export const FALLBACK_FOOTER_LINKS = [
  { id: "fallback-footer-about", label: "About Us", href: "/#about", group_label: "Sections", display_order: 1 },
  { id: "fallback-footer-memoirs", label: "Memoirs", href: "/memoirs", group_label: "Sections", display_order: 2 },
  { id: "fallback-footer-tributes", label: "Tributes", href: "/gallery", group_label: "Sections", display_order: 3 },
  { id: "fallback-footer-contact", label: "Contact", href: "/contact#hero", group_label: "Sections", display_order: 4 },
] as const;

export const FALLBACK_SITE_SETTINGS = {
  businessName: "Beiza Plus",
  phonePrimary: "+233 55 900 0111",
  emailPrimary: "hello@beiza.tv",
  calendlyUrl: "https://calendly.com",
  social: {
    instagram: "https://instagram.com/beizaplus",
    facebook: "https://facebook.com/beizaplus",
    tiktok: "https://tiktok.com/@beizaplus",
    youtube: "https://youtube.com/@beizaplus",
  },
} as const;



export const FALLBACK_OFFERINGS = [
  {
    id: "fallback-offering-branding",
    title: "Branding",
    description:
      "Visual identity, themes, and full coordination — from color palette to ceremony flow, designed for distinction.",
    icon_key: "palette",
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
    description: "LED installations and stage visuals that turn farewells into immersive, high-definition experiences.",
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
    description: "Online memorials, digital biographies, and preserved archives that keep every story alive forever.",
    icon_key: "cloud",
    display_order: 6,
  },
] as const;

export const FALLBACK_TESTIMONIALS = [
  {
    id: "fallback-testimonial-1",
    quote: "Beiza captured every detail with empathy. Our celebration felt true to my mother’s spirit.",
    author: "Adwoa Mensah",
    role: "Daughter",
    surfaces: ["landing", "contact"],
  },
  {
    id: "fallback-testimonial-2",
    quote: "From the first call to the final farewell, the team handled everything with grace.",
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
    question: "What do I need to begin planning a Beiza TV farewell?",
    answer:
      "Start with your loved one’s story. We’ll guide you through gathering photos, milestones, and the voices of family and friends to build a meaningful narrative.",
    display_order: 1,
  },
  {
    id: "fallback-faq-2",
    question: "How do I know if I’m ready to plan with Beiza TV?",
    answer:
      "If you’re seeking a celebration that feels personal and thoughtfully produced, we’ll meet you where you are, even if all you have is a desire to honor their legacy.",
    display_order: 2,
  },
  {
    id: "fallback-faq-3",
    question: "Can I plan with Beiza TV if I’m not in Ghana?",
    answer:
      "Yes. Our team works across time zones with remote production, live streaming, and digital Keepsakes so every relative can participate.",
    display_order: 3,
  },
  {
    id: "fallback-faq-4",
    question: "How long does the planning process take?",
    answer:
      "Most tributes take 10 to 21 days depending on the scope. We adjust timelines to align with the family’s schedule and rites.",
    display_order: 4,
  },
  {
    id: "fallback-faq-5",
    question: "What kind of events do you curate?",
    answer:
      "We support memorials, celebration services, homegoings, and legacy unveilings — from intimate gatherings to multi-day productions.",
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
      "Story consultation, tribute film up to 5 minutes, on-site media crew, memorial microsite, and 30-day streaming replay.",
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
  hero_media: {
    src: "https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823",
    alt: "Joyful woman with smartphone",
  },
} as const;

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

