import { CTAButton } from "@/components/framer/CTAButton";

export function LegacyOutro() {
  return (
    <section className="studio-outro border-t border-border bg-[hsl(var(--surface))] py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Beiza Legacy</p>
        <h2 className="mt-4 font-heading text-3xl font-semibold text-primary md:text-4xl">
          Some things you hold. Some things you hear.
        </h2>
        <div className="mt-6 text-center font-sans text-base leading-[1.7] text-[#888888]">
          <p className="mb-1">Beiza makes sure neither disappears.</p>
          <p className="mt-0">Free to begin, built to last for generations.</p>
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CTAButton to="/legacy/family" label="Start your circle — free" />
          <CTAButton to="/vault/explore" label="Explore the vault" className="bg-secondary text-foreground" />
        </div>
      </div>
    </section>
  );
}
