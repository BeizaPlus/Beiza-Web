import { useMemo, useState, type FormEvent } from "react";
import { ArrowDown, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { EDUCATION_RESOURCE_GUIDES } from "@/lib/educationResourceGuides";
import { cn } from "@/lib/utils";
import { LAYOUT_TW } from "@/lib/layoutBreakpoints";

const EMAIL_KEY = "beiza-lead-email";
const MARKETING_KEY = "beiza-lead-marketing-opt-in";

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ResourceGuideCover({
  guide,
  className,
}: {
  guide: (typeof EDUCATION_RESOURCE_GUIDES)[number];
  className?: string;
}) {
  const isGold = guide.cover === "gold";

  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-[min(100%,11.5rem)] overflow-hidden rounded-md shadow-[0_24px_48px_-20px_rgba(0,0,0,0.45)]",
        isGold
          ? "bg-gradient-to-br from-[#2a2418] via-[#1a1816] to-[#0f0e0c] text-white"
          : "bg-gradient-to-br from-[#1e2a3a] via-[#141c28] to-[#0a0e14] text-white",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-40",
          isGold
            ? "bg-[radial-gradient(circle_at_20%_0%,#E6A817_0%,transparent_55%)]"
            : "bg-[radial-gradient(circle_at_80%_20%,#4a6a8a_0%,transparent_50%)]",
        )}
        aria-hidden
      />
      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-manrope text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
            Beiza Education
          </p>
          <span className="shrink-0 rounded border border-white/20 px-1.5 py-0.5 font-manrope text-[9px] font-medium uppercase tracking-wider text-white/80">
            {guide.badge}
          </span>
        </div>
        <div>
          <p className="font-manrope text-lg font-semibold leading-tight tracking-tight sm:text-xl">
            {guide.title}
          </p>
          <p className="mt-1 font-manrope text-xs text-white/65">{guide.subtitle}</p>
        </div>
        <div
          className={cn(
            "mt-4 h-16 rounded-sm border border-white/10",
            isGold ? "bg-[#E6A817]/15" : "bg-white/5",
          )}
          aria-hidden
        >
          <div className="grid h-full grid-cols-3 gap-1 p-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-[2px]",
                  isGold ? "bg-[#E6A817]/35" : "bg-white/15",
                  i === 1 && "col-span-2",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CulturePdfLeadSection() {
  const [email, setEmail] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem(EMAIL_KEY) ?? "",
  );
  const [marketingOptIn, setMarketingOptIn] = useState(() =>
    typeof window === "undefined" ? false : localStorage.getItem(MARKETING_KEY) === "1",
  );
  const [submitted, setSubmitted] = useState(() =>
    typeof window === "undefined" ? false : isEmailValid(localStorage.getItem(EMAIL_KEY) ?? ""),
  );
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => isEmailValid(email), [email]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Enter a valid email address.");
      return;
    }
    localStorage.setItem(EMAIL_KEY, email.trim());
    localStorage.setItem(MARKETING_KEY, marketingOptIn ? "1" : "0");
    setSubmitted(true);
    setError("");
  };

  const [primaryGuide, secondaryGuide] = EDUCATION_RESOURCE_GUIDES;

  return (
    <section
      id="culture-symbol-pdfs"
      className="mx-auto mt-8 w-full max-w-6xl px-6 md:mt-12 lg:mt-14"
      aria-labelledby="culture-resource-heading"
    >
      <div className="overflow-hidden rounded-[1.75rem] bg-[#eceae4] text-[#1a1816]">
        <div
          className={cn(
            "grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12",
            "min-[768px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] min-[768px]:gap-14 min-[768px]:py-14",
          )}
        >
          {/* Resource pad — stacked guides */}
          <div
            className={cn(
              "relative mx-auto flex min-h-[16rem] w-full max-w-md items-center justify-center",
              "min-[768px]:mx-0 min-[768px]:max-w-none",
            )}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,18rem)] w-[min(100%,18rem)] -translate-x-1/2 -translate-y-[45%] rounded-full bg-[radial-gradient(circle,#E6A817_0%,#f5c51855_45%,transparent_70%)] opacity-90"
              aria-hidden
            />
            <div className="relative flex w-full max-w-[15rem] items-end justify-center sm:max-w-[17rem]">
              <ResourceGuideCover
                guide={secondaryGuide}
                className="absolute bottom-0 left-0 z-0 w-[78%] -rotate-6 opacity-95"
              />
              <ResourceGuideCover guide={primaryGuide} className="relative z-10 ml-auto w-[82%]" />
            </div>
          </div>

          {/* Email + subscribe */}
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-eyebrow text-[#666666]">Free resources</p>
            <h2
              id="culture-resource-heading"
              className="mt-2 font-manrope text-2xl font-semibold leading-tight tracking-tight text-[#1a1816] sm:text-[1.65rem]"
            >
              Get the cultural symbols library
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#444444]">
              Subscribe and we&apos;ll send the full Adinkra starter guide and cultural story
              prompts — curated for families learning their roots, Ghana-first and open to the
              world.
            </p>

            <form className="mt-6" onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <label className="sr-only" htmlFor="lead-email">
                  Email address
                </label>
                <input
                  id="lead-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="h-12 min-w-0 flex-1 rounded-xl border border-[#c8c4bc] bg-white px-4 font-manrope text-sm text-[#1a1816] outline-none transition placeholder:text-[#999999] focus:border-[#E6A817] focus:ring-2 focus:ring-[#E6A817]/25"
                  autoComplete="email"
                  required
                />
                <button
                  type="submit"
                  disabled={!canSubmit && !submitted}
                  className="h-12 shrink-0 rounded-xl bg-[#1a1816] px-6 font-manrope text-sm font-semibold text-white transition hover:bg-[#2a2622] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[9.5rem]"
                >
                  {submitted ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 text-left">
                <Checkbox
                  checked={marketingOptIn}
                  onCheckedChange={(v) => setMarketingOptIn(v === true)}
                  className="mt-0.5 border-[#b8b4ac] data-[state=checked]:border-[#E6A817] data-[state=checked]:bg-[#E6A817]"
                />
                <span className="text-xs leading-relaxed text-[#555555]">
                  I want to receive Beiza education updates — new symbol guides, films, and
                  story prompts. Unsubscribe anytime.
                </span>
              </label>

              {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
            </form>

            {submitted ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-[#1a1816]">
                  You&apos;re in — download your guides now:
                </p>
                <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {EDUCATION_RESOURCE_GUIDES.map((guide) => (
                    <li key={guide.id}>
                      <a
                        href={guide.href}
                        download
                        className="inline-flex items-center gap-2 rounded-full border border-[#1a1816]/15 bg-white px-4 py-2 font-manrope text-sm font-medium text-[#1a1816] transition hover:border-[#E6A817]/50 hover:text-[#8a6a12]"
                      >
                        <Download className="h-4 w-4 shrink-0 text-[#E6A817]" aria-hidden />
                        {guide.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <a
              href={primaryGuide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 font-manrope text-sm font-semibold text-[#1a1816] underline-offset-4 transition hover:text-[#8a6a12] hover:underline"
            >
              Preview the guides
              <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
