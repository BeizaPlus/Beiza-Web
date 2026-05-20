import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ADINKRA_SYMBOLS } from "@/lib/adinkra";
import { CTAButton } from "@/components/framer/CTAButton";
import { marketingContainer, marketingSection } from "@/lib/brandUi";

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <section className={marketingSection}>
          <div className={`${marketingContainer} space-y-6 text-center`}>
            <p className="font-manrope text-xs uppercase tracking-[0.3em] text-[#E6A817]">
              Education
            </p>
            <h1 className="welcome-gate-serif text-3xl font-medium sm:text-4xl">
              The visual language of your people
            </h1>
            <p className="mx-auto max-w-2xl font-manrope text-sm leading-relaxed text-muted-foreground sm:text-base">
              Adinkra symbols carry meaning across generations — patience, unity, remembrance,
              and return. Learn the marks, then bring your family&apos;s story into Legacy.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <CTAButton to="/legacy" label="Start preserving stories" />
              <CTAButton
                to="/"
                label="Welcome gate"
                className="border border-white/20 bg-transparent text-white hover:bg-white/5"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0a0a0a] py-20 text-white lg:py-28">
          <div className={`${marketingContainer} grid gap-6 sm:grid-cols-2 lg:grid-cols-4`}>
            {ADINKRA_SYMBOLS.map((symbol) => (
              <article
                key={symbol.id}
                className="rounded-xl border border-white/10 bg-[#141414] p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e1800] font-manrope text-xs font-semibold uppercase tracking-wider text-[#E6A817]">
                  {symbol.name.slice(0, 2)}
                </div>
                <h2 className="welcome-gate-serif text-lg font-medium">{symbol.name}</h2>
                <p className="mt-2 font-manrope text-sm leading-relaxed text-white/70">
                  {symbol.meaning}
                </p>
              </article>
            ))}
          </div>
          <p className={`${marketingContainer} mt-12 text-center font-manrope text-sm text-white/60`}>
            Ready to record a voice or build your tree?{" "}
            <Link to="/legacy" className="text-[#E6A817] underline underline-offset-4 hover:text-[#f0bc3a]">
              Open Legacy →
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
