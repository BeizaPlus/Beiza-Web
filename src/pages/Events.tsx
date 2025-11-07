import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { CTAButton } from "@/components/framer/CTAButton";

const Events = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="space-y-24 pb-24 pt-28 lg:space-y-32 lg:pb-32">
        <section className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Events"
            title="Curated farewells that feel cinematic"
            description="Explore the full Monica Manu celebration to see how we choreograph stages, tributes, and live experiences for families across the globe."
            align="center"
          />
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <div className="glass-panel grid overflow-hidden rounded-[32px] border border-white/10 md:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-between gap-6 p-8 md:p-12">
              <div className="space-y-4">
                <p className="text-eyebrow">Featured Tribute</p>
                <h2 className="text-display-lg leading-[1.05] text-white">The Life of Madam Monica Manu</h2>
                <p className="text-subtle text-base leading-relaxed">
                  A full-scale celebration that blended live performances, immersive visuals, and digital archives. Walk through the memoir to experience how we bring stories to life.
                </p>
              </div>
              <CTAButton to="/memoirs/monica-manu" label="Observe" />
            </div>
            <div className="relative h-full">
              <img
                src="https://framerusercontent.com/images/hOxvbbCIefKg5M5GXOo8yBqATo.png?width=799&height=823"
                alt="Joyful woman with smartphone"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;

