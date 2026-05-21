import { CTAButton } from "@/components/framer/CTAButton";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

export function LegacyOutro() {
  return (
    <section className="studio-outro border-t border-border bg-[hsl(var(--surface))] py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-eyebrow">Beiza Legacy</p>
        <h2 className="mt-4 text-display-lg text-primary">
          Some things you hold. Some things you hear.
        </h2>
        <div className="mt-6 text-center text-base leading-[1.7] text-subtle">
          <p className="mb-1">Beiza makes sure neither disappears.</p>
          <p className="mt-0">Free to begin, built to last for generations.</p>
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CTAButton to={BEIZA_LINKS.legacy.family} label="Start your circle — free" />
          <CTAButton to={BEIZA_LINKS.marketing.vaultExplore} label="Explore the vault" className="bg-secondary text-foreground" />
        </div>
      </div>
    </section>
  );
}
