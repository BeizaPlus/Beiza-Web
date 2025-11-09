import { type FormEvent, useState } from "react";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { CTAButton } from "@/components/framer/CTAButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Events = () => {
  const [query, setQuery] = useState("");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

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
          <div className="glass-panel overflow-hidden rounded-[32px] border border-white/10">
            <div className="space-y-8 p-8 md:p-12">
              <div className="space-y-3">
                <p className="text-eyebrow">Search Events</p>
                <h2 className="text-display-sm leading-tight text-white">
                  Find a celebration that mirrors your vision
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="event-search" className="sr-only">
                  Search events
                </label>
                <div className="relative flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="event-search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search by family, location, or theme"
                      className="h-14 rounded-full border-white/10 bg-white/5 px-14 text-base text-white placeholder:text-white/60"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled
                    className="h-14 rounded-full bg-white/90 px-8 text-base font-medium text-primary hover:bg-white"
                  >
                    Coming Soon
                  </Button>
                </div>
              </form>

              <p className="text-sm text-white/60">
                We&apos;ll notify you as soon as tailored search results are live.
              </p>
            </div>
          </div>
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

