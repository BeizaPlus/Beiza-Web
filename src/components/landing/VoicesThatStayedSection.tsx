import { VOICES_TESTIMONIALS } from "@/lib/legacy/voicesTestimonials";
import { cn } from "@/lib/utils";

function ChainMotif() {
  return (
    <div className="mt-10 flex flex-col items-center">
      <div className="flex items-center" role="presentation">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            {i > 0 ? <span className="h-px w-8 bg-[#1e1e1e]" aria-hidden /> : null}
            <span
              className={cn(
                "block h-2 w-2 shrink-0 rounded-full",
                i === 2
                  ? "border border-[#2a2a2a] bg-[#0d0d0d]"
                  : "bg-[#E6A817]",
              )}
              style={
                i !== 2 ? { boxShadow: "0 0 6px rgba(230,168,23,0.25)" } : undefined
              }
              aria-hidden
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-[#333333]">
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
  flag,
  country,
  featured,
  quote,
}: (typeof VOICES_TESTIMONIALS)[number]) {
  return (
    <article
      className={cn(
        "mb-px border border-[#1e1e1e] bg-[#111111] px-5 py-6",
        featured
          ? "rounded-none border-l-2 border-l-[#E6A817] bg-[#0e0c00] pl-[18px]"
          : "rounded-xl",
      )}
    >
      <span
        className="mb-2 block text-[28px] leading-none text-[#E6A817]/50"
        aria-hidden
      >
        &ldquo;
      </span>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#555555]">
        {relation} · {location}
      </p>
      <p className="my-2.5 mb-[18px] text-sm italic leading-[1.75] text-[#cccccc]">
        {quote}
      </p>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#2e2200] bg-[#1e1800] text-[11px] font-medium text-[#E6A817]">
          {initials}
        </span>
        <div>
          <p className="text-[13px] font-medium text-white">{name}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-[#555555]">
            <span
              className="leading-none"
              style={{
                fontFamily:
                  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
              }}
              aria-hidden
            >
              {flag}
            </span>
            <span>{country}</span>
          </p>
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
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-[#888888]">
          From families who trusted Beiza
        </p>
        <h2 id="voices-heading" className="mt-3 text-center text-display-lg text-white">
          Voices that stayed.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-center text-base leading-relaxed text-[#888888]">
          A farewell is just one moment in a longer chain. Their stories travel forward.
        </p>

        <div className="mt-12 flex flex-col">
          {VOICES_TESTIMONIALS.map((item) => (
            <VoiceCard key={item.name} {...item} />
          ))}
        </div>

        <ChainMotif />
      </div>
    </section>
  );
}