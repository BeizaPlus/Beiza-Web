import { Link } from "react-router-dom";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CulturalImmersionHero } from "@/components/education/CulturalImmersionHero";
import { ADINKRA_SYMBOLS } from "@/lib/adinkra";
import { CTAButton } from "@/components/framer/CTAButton";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { marketingContainer, marketingSection } from "@/lib/brandUi";
import { PageLayoutStudioZone } from "@/components/dev/PageLayoutStudioZone";
import type { BeizaLocale } from "@/lib/locale/types";

type EducationPageProps = {
  locale?: BeizaLocale;
};

export default function EducationPage({ locale = "black-american" }: EducationPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <PageLayoutStudioZone pageId="education" applyMaxWidth={false} copyLiftTarget="children">
        <main>
          <CulturalImmersionHero locale={locale} />

          <section className={marketingSection}>
            <div className={`${marketingContainer} space-y-6 text-center`}>
              <p className="font-manrope text-xs uppercase tracking-[0.3em] text-[#E6A817]">
                Symbols & stories
              </p>
              <h2 className="legacy-display text-3xl font-light sm:text-4xl">
                The visual language of your people
              </h2>
              <p className="mx-auto max-w-2xl font-manrope text-sm leading-relaxed text-muted-foreground sm:text-base">
                After the film, explore Adinkra marks and family prompts — then bring what you
                learned into Legacy.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <CTAButton to={BEIZA_LINKS.legacy.recordStation} label="Record a memory" />
                <CTAButton to={BEIZA_LINKS.legacy.heritage} label="Start preserving stories" />
                <CTAButton
                  to={BEIZA_LINKS.welcome.gate}
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
                  <h2 className="legacy-display text-lg font-light">{symbol.name}</h2>
                  <p className="mt-2 font-manrope text-sm leading-relaxed text-white/70">
                    {symbol.meaning}
                  </p>
                </article>
              ))}
            </div>
            <p className={`${marketingContainer} mt-12 text-center font-manrope text-sm text-white/60`}>
              Ready to record a voice or build your tree?{" "}
              <Link
                to={BEIZA_LINKS.legacy.heritage}
                className="text-[#E6A817] underline underline-offset-4 hover:text-[#f0bc3a]"
              >
                Open Legacy →
              </Link>
            </p>
            <p className={`${marketingContainer} mt-4 text-center`}>
              <Link
                to={BEIZA_LINKS.education.storyQuestions}
                className="font-manrope text-sm text-[#E6A817] underline underline-offset-4 hover:text-[#f0bc3a]"
              >
                52 family story questions →
              </Link>
            </p>
          </section>
        </main>
      </PageLayoutStudioZone>
      <Footer />
    </div>
  );
}
