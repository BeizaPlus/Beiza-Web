import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { FeatureCard } from "@/components/framer/FeatureCard";
import { TributeStack } from "@/components/framer/TributeStack";
import { TestimonialsCarousel } from "@/components/framer/TestimonialsCarousel";
import { CTAButton } from "@/components/framer/CTAButton";
import { Palette, Heart, FileText, Monitor, Box, Cloud, Sparkles } from "lucide-react";

const heroBackgroundImage = "https://framerusercontent.com/images/ZwPzi3XEJV1BavrysIhb7QSOE0.jpg?width=4680&height=3120";

const offerings = [
  {
    title: "Branding",
    description: "Visual identity, themes, and full coordination — from color palette to ceremony flow, designed for distinction.",
    icon: <Palette className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Tributes",
    description: "Cinematic storytelling through video, photography, and written memoirs that capture every emotion.",
    icon: <Heart className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Printed Brochures & Keepsakes",
    description: "Elegant brochures, thank-you cards, and keepsakes crafted with premium paper and timeless finishes.",
    icon: <FileText className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Screens",
    description: "LED installations and stage visuals that turn farewells into immersive, high-definition experiences.",
    icon: <Monitor className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Coffins",
    description: "Signature handcrafted pieces that embody dignity, culture, and craftsmanship.",
    icon: <Box className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Legacy",
    description: "Online memorials, digital biographies, and preserved archives that keep every story alive forever.",
    icon: <Cloud className="h-5 w-5" strokeWidth={1.5} />,
  },
];

const tributes = [
  {
    name: "Mercy",
    relationship: "In-Law",
    message: "Mercy and the family honor the beautiful life of our beloved mother-in-law.",
  },
  {
    name: "Kwadwo",
    relationship: "Son",
    message: "Mom, God be with you. Amen.",
  },
  {
    name: "Mr David Acheampong",
    relationship: "Family Friend",
    message: "My sincerest condolences to you and the family.",
  },
  {
    name: "Pirlo Wan",
    relationship: "Friend",
    message: "Rest in perfect peace. Your light stays with us forever.",
  },
  {
    name: "Shary-Han N. Mustapha, CBG",
    relationship: "Colleague",
    message: "Thank you for the compassion you showed our community.",
  },
  {
    name: "Stephanie",
    relationship: "Granddaughter",
    message: "Your stories and songs are the soundtrack of our family.",
  },
];

const testimonials = [
  {
    quote: "Beiza captured every detail with empathy. Our celebration felt true to my mother’s spirit.",
    author: "Adwoa Mensah",
    role: "Daughter",
  },
  {
    quote: "From the first call to the final farewell, the team handled everything with grace.",
    author: "Michael Ofori",
    role: "Brother",
  },
  {
    quote: "The digital memoir meant relatives abroad could experience the tribute in full.",
    author: "Senam Amegashie",
    role: "Family Archivist",
  },
  {
    quote: "Guests still talk about the stage design and live screens. It was breathtaking.",
    author: "Eunice Amponsah",
    role: "Event Partner",
  },
  {
    quote: "Their printed keepsakes are heirlooms we’ll share with future generations.",
    author: "Samuel Boateng",
    role: "Grandson",
  },
  {
    quote: "The tribute film helped us laugh, cry, and remember together. It was healing.",
    author: "Vida Akua",
    role: "Family Friend",
  },
];

const faqs = [
  {
    question: "What do I need to begin planning a Beiza TV farewell?",
    answer: "Start with your loved one’s story. We’ll guide you through gathering photos, milestones, and the voices of family and friends to build a meaningful narrative.",
  },
  {
    question: "How do I know if I’m ready to plan with Beiza TV?",
    answer: "If you’re seeking a celebration that feels personal and thoughtfully produced, we’ll meet you where you are, even if all you have is a desire to honor their legacy.",
  },
  {
    question: "Can I plan with Beiza TV if I’m not in Ghana?",
    answer: "Yes. Our team works across time zones with remote production, live streaming, and digital Keepsakes so every relative can participate.",
  },
  {
    question: "How long does the planning process take?",
    answer: "Most tributes take 10 to 21 days depending on the scope. We adjust timelines to align with the family’s schedule and rites.",
  },
  {
    question: "What kind of events do you curate?",
    answer: "We support memorials, celebration services, homegoings, and legacy unveilings — from intimate gatherings to multi-day productions.",
  },
];

const pricingTiers = [
  {
    name: "Lite",
    price: "GHS 8,500",
    description: "Story consultation, tribute film up to 5 minutes, on-site media crew, memorial microsite, and 30-day streaming replay.",
    features: [
      "Single location coverage",
      "Digital guestbook setup",
      "Keepsake highlight reel",
    ],
  },
  {
    name: "Signature",
    price: "GHS 15,000",
    description: "Everything in Lite plus full ceremony direction, multi-camera broadcast, LED visual design, and printed keepsakes.",
    features: [
      "Program design & printing",
      "Live stream with moderation",
      "Personalised stage backdrop",
    ],
    recommended: true,
  },
  {
    name: "Legacy",
    price: "Custom",
    description: "For multi-day celebrations, cross-border coordination, and archival projects that preserve decades of family history.",
    features: [
      "Ancestral archive production",
      "Heritage documentary series",
      "Heirloom book & gallery installation",
    ],
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero
        headline="Crafting Meaningful Farewells"
        paragraph="We believe farewells are not the end — they're the final chapter of love. Every ceremony, every detail, every design is our way of saying: Thank you for a life well lived!"
        ctaText="Create a Memoir"
        ctaLink="/contact#hero"
        reviews="100+ Positive Client Reviews"
        backgroundImage={heroBackgroundImage}
      />

      <main className="flex flex-col pb-24 lg:pb-32">
        <section className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <SectionHeader
            eyebrow="Offerings"
            title="Our Signature Concierge Services"
            description="Every detail is handcrafted — from storytelling and staging to the keepsakes families will hold for generations."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {offerings.map((feature) => (
              <FeatureCard key={feature.title} title={feature.title} description={feature.description} icon={feature.icon} />
            ))}
          </div>
        </section>

        {/* Tributes Section */}
        <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-start">
          <div className="lg:w-1/3">
            <SectionHeader
              eyebrow="Tributes"
              title="Loved by Families"
              description="Notes of comfort and celebration from the people whose stories we helped preserve."
            />
          </div>
          <div className="lg:w-2/3">
            <TributeStack tributes={tributes} className="mt-4" />
          </div>
        </section>

        <section className="bg-white py-24 text-black">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeader
              eyebrow="Stories"
              title="What Families Say"
              description="Kind words from the people who trusted us to honour a life well lived."
              align="center"
              variant="light"
            />
            <TestimonialsCarousel testimonials={testimonials} className="mt-10" variant="light" />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-24 text-black">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHeader
              eyebrow="FAQ"
              title="Questions We Hear Often"
              description="We blend broadcast-quality production with the intimacy families deserve. If you don’t see your question please reach out."
              align="center"
              variant="light"
            />
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-glass transition hover:shadow-lg"
                >
                  <summary className="cursor-pointer list-none text-left text-lg font-medium text-black">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="glass-panel flex flex-col overflow-hidden rounded-[30px] border border-white/10 md:flex-row">
            <div className="flex-1 space-y-4 px-8 py-10 md:px-12">
              <SectionHeader
                eyebrow="Events"
                title="Because the last goodbye should be unforgettable."
                description="Explore the Monica Manu celebration to see how we transform memories into immersive experiences."
              />
              <CTAButton to="/memoirs/monica-manu" label="Observe" />
            </div>
            <div className="relative aspect-[4/5] w-full overflow-hidden md:w-1/3">
              <img
                src="https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823"
                alt="Joyful woman with smartphone"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-black py-24 text-white">
          <div className="mx-auto max-w-6xl space-y-12 px-6">
            <SectionHeader
              eyebrow="Pricing"
              title="Choose the experience that fits your celebration"
              description="Transparent offerings with the production support families rely on. Every package can be tailored with add-ons and cultural rituals."
              align="center"
              variant="dark"
            />

            <div className="grid gap-6 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-3xl border p-8 shadow-glass transition hover:-translate-y-1 hover:shadow-xl ${tier.recommended ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-white">{tier.name}</h3>
                    {tier.recommended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white">
                        <Sparkles className="h-3.5 w-3.5" /> Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm uppercase tracking-[0.3em] text-subtle">Starting at</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{tier.price}</p>
                  <p className="mt-4 text-sm leading-relaxed text-subtle">{tier.description}</p>
                  <ul className="mt-6 space-y-2 text-sm text-subtle">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/80" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <CTAButton
                    to="/contact#hero"
                    label="Plan with us"
                    className={`mt-8 w-full justify-center ${tier.recommended ? "bg-white text-black" : "bg-white/15 text-white"}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
