import { VOICES_TESTIMONIALS } from "@/lib/legacy/voicesTestimonials";
import { cn } from "@/lib/utils";

const GOLD = "#E6A817";

function ChainMotif() {
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            {i > 0 ? <span className="h-px w-6 bg-[#222] sm:w-8" aria-hidden /> : null}
            <span
              className={cn(
                "block h-2.5 w-2.5 shrink-0 rounded-full border",
                i === 2
                  ? "border-[#2a2a2a] bg-[#0d0d0d]"
                  : "border-[#E6A817] bg-[#E6A817]",
              )}
              style={
                i !== 2
                  ? { boxShadow: "0 0 8px rgba(230,168,23,0.3)" }
                  : undefined
              }
              aria-hidden
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#444]">
        The chain doesn&apos;t break. It remembers.
      </p>
    </div>
  );
}

function VoiceCard({
  initials,
  name,
  relation,
  location,
  country,
  featured,
  quote,
}: (typeof VOICES_TESTIMONIALS)[number]) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-[#1e1e1e] bg-[#111111] px-6 py-7",
        featured &&
          "border-[#3a2800] bg-[#0e0c00] border-l-2 border-l-[#E6A817] rounded-l-none pl-7",
      )}
    >
      <span
        className="font-display text-5xl leading-none text-[#E6A817]/60"
        aria-hidden
      >
        &ldquo;
      </span>
      <span className="mt-3 inline-block rounded-full border border-[#222] bg-[#1a1a1a] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#555]">
        {relation} · {location}
      </span>
      <p className="mt-4 font-display text-[15px] italic leading-[1.7] text-[#cccccc]">
        {quote}
      </p>
      <div className="mt-5 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#2e2200] bg-[#1e1800] text-[11px] font-medium text-[#E6A817]"
        >
          {initials}
        </span>
        <div>
          <p className="font-sans text-[13px] font-medium text-white">{name}</p>
          <p className="font-sans text-[11px] text-[#555555]">{country}</p>
        </div>
      </div>
    </article>
  );
}

export function VoicesThatStayedSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("bg-[#0a0a0a] py-24 text-white", className)}
      aria-labelledby="voices-heading"
    >
      <div className="mx-auto max-w-2xl px-6">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-[#888]">
          From families who trusted Beiza
        </p>
        <h2
          id="voices-heading"
          className="mt-3 text-center font-display text-3xl font-normal text-white md:text-4xl"
        >
          Voices that stayed.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center font-sans text-base leading-relaxed text-[#888]">
          A farewell is just one moment in a longer chain. Their stories travel forward.
        </p>

        <div className="mt-12 flex flex-col gap-4">
          {VOICES_TESTIMONIALS.map((item) => (
            <VoiceCard key={item.name} {...item} />
          ))}
        </div>

        <ChainMotif />
      </div>
    </section>
  );
}
