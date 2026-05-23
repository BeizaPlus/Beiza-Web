import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { RECORDING_HOME_FAQ } from "@/lib/auditFaqContent";

export const LEGACY_HERO = {
  headline: "Reminisce now. Treasure forever.",
  subtext:
    "Preserve a life story in a beautiful book — yours or someone you love. Celebrate a loved one's legacy for generations to come.",
  cta: "Get started",
  ctaHref: BEIZA_LINKS.legacy.family,
  image: "/images/beiza-storyworth-heritage-memoir-legacy-hero.jpg",
  imageAlt: "Hands holding a My Life Story memoir book",
};

export const MEMOIR_STEPS = [
  {
    number: "1",
    icon: "mail" as const,
    text: "Every week, we'll send you a thoughtful question to begin the writing.",
  },
  {
    number: "2",
    icon: "mic" as const,
    text: "You or your loved one can speak the story, write it, or reply by email and add photos.",
  },
  {
    number: "3",
    icon: "book" as const,
    text: "Review the stories, and when you're ready, turn them into a beautiful printed book.",
  },
];

export const TESTIMONIALS = [
  {
    quote: "My father never wrote anything down. After twelve weeks, we had a book our children fight over at Christmas.",
    name: "Amara Osei",
    role: "Daughter · Accra",
  },
  {
    quote: "I recorded my mother in Twi and English. Beiza kept her phrasing — it still sounds like her when I read it.",
    name: "James Mensah",
    role: "Son · London",
  },
  {
    quote: "We started with one question about her village. It opened forty years of stories we had never heard.",
    name: "Priya Naidoo",
    role: "Granddaughter · Toronto",
  },
];

export const LEGACY_FAQ = RECORDING_HOME_FAQ.map((item) => ({
  q: item.q,
  a: item.a,
}));

export const SAMPLE_QUESTIONS = [
  "What are you most proud of in your life?",
  "What's one of the earliest memories you have?",
  "What took your breath away?",
  "When you think of the word home, what do you see?",
  "What is most memorable for you?",
  "Who taught you what kindness looks like?",
  "What song still carries you back?",
  "What would you want your grandchildren to never forget?",
];

export const LEGACY_PRICING = [
  {
    id: "circle",
    name: "Circle",
    price: "Free",
    body: "Family tree, voice recording, weekly questions, 50MB storage.",
    cta: "Start free",
    href: "/legacy/family",
  },
  {
    id: "keeper",
    name: "Keeper",
    price: "$4.99/mo",
    body: "Unlimited storage, memoir compilation, downloadable and printed book.",
    cta: "Upgrade",
    href: BEIZA_LINKS.marketing.pricing,
    featured: true,
  },
  {
    id: "heritage",
    name: "Heritage",
    price: "Custom",
    body: "Visual ancestry scene, legacy vessel, statue, white glove service.",
    cta: "Plan with us",
    href: BEIZA_LINKS.farewell.heritage,
  },
];
