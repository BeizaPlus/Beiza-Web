export type VoiceTestimonial = {
  initials: string;
  name: string;
  relation: string;
  location: string;
  country: string;
  featured: boolean;
  quote: string;
};

export const VOICES_TESTIMONIALS: VoiceTestimonial[] = [
  {
    initials: "MR",
    name: "MadamRose",
    relation: "Daughter",
    location: "Accra",
    country: "Ghana 🇬🇭",
    featured: true,
    quote:
      "She was a good lady. How else can we describe her? Beiza gave us her voice on the day we needed it most — and every day after.",
  },
  {
    initials: "KW",
    name: "Kwakos",
    relation: "Friend",
    location: "Kumasi",
    country: "Ghana 🇬🇭",
    featured: false,
    quote: "She was always there for us. Now I press play and she still is.",
  },
  {
    initials: "YM",
    name: "Yaa Mante",
    relation: "Friend",
    location: "Lagos",
    country: "Nigeria 🇳🇬",
    featured: false,
    quote:
      "So Tina is really gone? But she isn't. I heard her laugh yesterday — in my phone, through Beiza.",
  },
  {
    initials: "JO",
    name: "James O.",
    relation: "Son",
    location: "London",
    country: "United Kingdom 🇬🇧",
    featured: false,
    quote:
      "My father's voice is the inheritance I didn't know I needed until it was the only thing I wanted.",
  },
];
