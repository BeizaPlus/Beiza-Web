import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { FeatureCard } from "@/components/framer/FeatureCard";
import { TestimonialsCarousel, type Testimonial } from "@/components/framer/TestimonialsCarousel";
import { CTAButton } from "@/components/framer/CTAButton";
import { Archive, BookHeart, Box, Calendar, Camera, Monitor, Video } from "lucide-react";

const services = [
  {
      title: "Memorial Tributes",
    description: "Immersive narrative films, interactive biographies, and live storytelling that honour a life with cinematic detail.",
    icon: <BookHeart className="h-5 w-5" strokeWidth={1.5} />,
    },
    {
      title: "Photo Books",
    description: "Curated coffee-table keepsakes, hand bound with archival paper and personalised layouts for every chapter.",
    icon: <Camera className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Legacy Archives",
    description: "Digital vaults, family trees, and oral history repositories that preserve lineage for future generations.",
    icon: <Archive className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Event Direction",
    description: "Full-service planning, rehearsal, and execution – from venue styling to program flow and guest experience.",
    icon: <Calendar className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Stage & Screens",
    description: "LED installations, live camera feeds, and bespoke visuals that immerse guests in every moment.",
    icon: <Monitor className="h-5 w-5" strokeWidth={1.5} />,
  },
  {
    title: "Signature Pieces",
    description: "Custom coffins, memory tables, and ceremonial accessories handcrafted with dignified finishes.",
    icon: <Box className="h-5 w-5" strokeWidth={1.5} />,
  },
];

const processSteps = [
  {
    step: "01",
    title: "Discovery",
    copy: "We listen, research, and collect the milestones, artefacts, and sentiments that define your loved one's journey.",
  },
  {
    step: "02",
    title: "Design",
    copy: "Our team maps the narrative, visuals, and guest experience with storyboards, moodboards, and production cues.",
  },
  {
    step: "03",
    title: "Production",
    copy: "Cinematographers, editors, designers, and stage directors craft the tribute, keeping families looped in every stage.",
  },
  {
    step: "04",
    title: "Celebration",
    copy: "We stage, stream, archive, and support on the day — ensuring the farewell feels seamless and unforgettable.",
  },
];

const servicesTestimonials: Testimonial[] = [
  {
    quote: "The Beiza team orchestrated every moment — from the prelude visuals to the final blessing — with stunning precision.",
    author: "Pastor Samuel Owusu",
    role: "Officiant",
  },
  {
    quote: "Their stage design and live screen direction made a 400-seat cathedral feel intimate for our family.",
    author: "Harriet Twum",
    role: "Head of Protocol",
  },
  {
    quote: "Relatives overseas watched live, signed the digital tribute wall, and felt present thanks to Beiza's streaming team.",
    author: "Daniel Osei",
    role: "Cousin",
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="space-y-24 pb-24 pt-28 lg:space-y-32 lg:pb-32">
        <section className="mx-auto max-w-6xl px-6 text-center">
          <SectionHeader
            eyebrow="Services"
            title="Concierge production for unforgettable farewells"
            description="From intimate vigils to stadium-scale celebrations, we design and deliver experiences that feel worthy of the life being honoured."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <FeatureCard key={service.title} title={service.title} description={service.description} icon={service.icon} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <div className="glass-panel grid gap-10 rounded-[32px] border border-white/10 p-8 md:grid-cols-[0.8fr_1.2fr] md:p-12">
            <div className="space-y-6">
              <SectionHeader
                eyebrow="Process"
                title="How we bring stories to life"
                description="A collaborative journey led by producers, designers, and storytellers dedicated to translating love into ceremony."
              />
              <CTAButton to="/contact#hero" label="Start planning" icon={<Video className="h-4 w-4" />} />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {processSteps.map((step) => (
                <div key={step.step} className="glass-panel rounded-lg border border-white/10 p-6">
                  <span className="text-xs uppercase tracking-[0.3em] text-subtle">{step.step}</span>
                  <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-subtle text-sm leading-relaxed">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Testimonials"
            title="Production that families trust"
            description="We combine empathy, technology, and artistry. Here’s how that feels from the front row."
            align="center"
          />
          <TestimonialsCarousel testimonials={servicesTestimonials} className="mt-12" />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;