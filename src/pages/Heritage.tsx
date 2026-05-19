import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Check,
  Film,
  Infinity,
  Users,
  UserRound,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FullBleedHero } from "@/components/FullBleedHero";
import {
  HeroLayoutStudioPanel,
  useHeroLayoutStudio,
} from "@/components/dev/HeroLayoutStudio";
import {
  HERITAGE_HERO_DEFAULTS,
  heritageHeroStudioCssVars,
} from "@/components/dev/heroLayoutStudioState";
import { BRAND_IMAGES } from "@/lib/brandImages";
import { CasketIcon } from "@/components/icons/CasketIcon";
import { cn } from "@/lib/utils";
import { legacyFormField, legacyGoldPanel, marketingContainer, marketingSection } from "@/lib/brandUi";
import { isWhiteSwanIncludedForUser } from "@/lib/legacy/heritage";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";

const FEATURES = [
  {
    icon: Film,
    title: "Cinematic tribute film",
    body: "A produced short film — voice, image, and music — that captures who they were. Delivered digitally and on archival media.",
  },
  {
    icon: BookOpen,
    title: "Heirloom book",
    body: "A printed, bound keepsake of memories, photos, and recorded stories. One copy per immediate family, more available.",
  },
  {
    icon: Users,
    title: "Cross-border family coordination",
    body: "We coordinate across time zones, languages, and borders so every branch of the family is present — in person or digitally.",
  },
  {
    icon: UserRound,
    title: "Dedicated legacy producer",
    body: "One person. Your family's point of contact from the first call through the final delivery. No handoffs.",
  },
  {
    icon: Infinity,
    title: "Unlimited vault storage",
    body: "Every recording, photo, and memory — stored in your family's vault with no cap, forever.",
  },
  {
    title: "White Swan — the gathering",
    body: "When a family member passes, we coordinate the memorial experience on the ground. Photography, tribute screening, and family gathering included.",
    featured: true,
    casket: true,
  },
] as const;

const WHITE_SWAN_INCLUDES = [
  "On-the-ground memorial coordination",
  "Tribute film screening at the gathering",
  "Family photography (ceremony + portraits)",
  "Programme design & print",
  "Cross-border attendance coordination",
  "Dedicated producer, day-of",
];

function scrollToConsultation() {
  document.getElementById("consultation")?.scrollIntoView({ behavior: "smooth" });
}

export default function HeritagePage() {
  const studioPanel = isLayoutStudioEnabled();
  const studio = useHeroLayoutStudio("heritage");
  const heroFrame = studioPanel ? studio.frame : HERITAGE_HERO_DEFAULTS;
  const setHeroFrame = studio.setFrame;
  const whiteSwanIncluded = isWhiteSwanIncludedForUser();
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    planning_for: "",
    message: "",
    referral_source: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Beiza Heritage · Memorial & Legacy Coordination";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Full legacy curation for families — cinematic tribute films, heirloom books, cross-border coordination, and memorial experiences.",
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/heritage-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={heritageHeroStudioCssVars(heroFrame) as CSSProperties}
    >
      <style>{`
        .heritage-hero-overlay {
          background: var(--heritage-overlay-mobile);
        }
        @media (min-width: 768px) {
          .heritage-hero-overlay {
            background: var(--heritage-overlay-md);
          }
        }
      `}</style>
      <Navigation />

      {/* 1. Hero */}
      <FullBleedHero
        imageSrc={BRAND_IMAGES.heritageHero}
        imageAlt="Elder at peace with the Gye Nyame Adinkra symbol — except God, nothing is greater"
        frame={heroFrame}
        overlayClassName="heritage-hero-overlay"
        contentStyle={{ paddingBottom: 0 }}
        contentClassName={cn(
          "!flex !items-end px-8 pb-8 pt-28 md:!items-center md:px-0 md:pb-0 md:pt-32",
          heroFrame.textSide === "right" ? "md:!justify-end" : "md:!justify-start",
        )}
      >
          <div
            className={cn(
              "w-full max-w-[520px]",
              heroFrame.textSide === "right" ? "text-right" : "text-left",
              heroFrame.textSide === "right"
                ? "md:ml-auto md:py-20 md:pr-16 md:pl-10"
                : "md:mr-auto md:py-20 md:pl-16 md:pr-10",
            )}
            style={{ paddingTop: `calc(${heroFrame.copyRaiseVh} * 1vh)` }}
          >
            <p className="text-eyebrow text-primary">Beiza Legacy · Heritage</p>
            <h1 className="mt-4 text-display-xl text-white">
              Some stories are larger than one life.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/90 md:text-xl">
              The White Swan. For when the time comes — and it always comes.
            </p>
            <p
              className={cn(
                "mt-3 max-w-[420px] text-sm leading-relaxed text-subtle",
                heroFrame.textSide === "right" ? "ml-auto" : "",
              )}
            >
              The Gye Nyame symbol — &ldquo;except God, nothing is greater&rdquo; — has guided
              Ghanaian families through loss for centuries. Beiza Heritage carries that spirit into
              how we preserve, gather, and remember.
            </p>
            <button
              type="button"
              onClick={scrollToConsultation}
              className="mt-8 rounded-full bg-white px-6 py-3 text-[13px] font-medium text-background transition hover:bg-white/90"
            >
              Plan your Heritage experience →
            </button>
            <p className="mt-3 text-[11px] text-subtle">Or call us — we answer.</p>
            <p className="mt-6 text-[13px] text-[#555555]">
              Already lost someone?{" "}
              <Link to="/recover" className="text-[#888888] hover:text-primary">
                Recover a voice →
              </Link>
            </p>
          </div>
      </FullBleedHero>

      {/* 2. What's included */}
      <section className={cn(marketingSection, "px-[5%]")}>
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-eyebrow">What&apos;s included</p>
          <h2 className="mt-3 text-display-lg text-white">A farewell worth remembering.</h2>
          <p className="mx-auto mt-4 max-w-[560px] text-sm leading-relaxed text-subtle">
            Heritage is full-service legacy curation. Everything Beiza does, done for you —
            coordinated across continents, delivered to your family.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-border md:grid md:grid-cols-2 md:gap-px md:bg-border">
          {FEATURES.map((item) => {
            const Icon = "icon" in item ? item.icon : null;
            return (
              <div
                key={item.title}
                className={cn(
                  "border-border bg-card p-7 md:border-r md:border-b md:p-8",
                  "featured" in item && item.featured && "bg-primary/5 md:border-primary/30",
                )}
              >
                {"casket" in item && item.casket ? (
                  <CasketIcon size={24} />
                ) : Icon ? (
                  <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden />
                ) : null}
                <h3
                  className={cn(
                    "mt-4 text-[15px] font-medium",
                    "featured" in item && item.featured ? "text-primary" : "text-white",
                  )}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.7] text-subtle">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. White Swan callout */}
      <section className={cn("border-y border-border bg-secondary/30", marketingSection, "px-[5%]")}>
        <div className={cn(marketingContainer, "grid gap-12 lg:grid-cols-2 lg:gap-16")}>
          <div>
            <div className="flex items-center gap-2.5">
              <CasketIcon size={24}  />
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                White Swan
              </span>
            </div>
            <h2 className="mt-4 text-display-lg italic leading-[1.3] text-white">
              When the time comes, we&apos;re already there.
            </h2>
            <div className="mt-6 max-w-[480px] space-y-4 text-sm leading-[1.9] text-subtle">
              <p>
                The White Swan is Beiza&apos;s on-the-ground memorial experience. When a family
                member passes, we coordinate everything — so your family can grieve, not manage
                logistics.
              </p>
              <p>
                Photography of the gathering. A cinematic tribute screening. Coordination of family
                members across borders. Flowers, programme design, and the quiet details that matter.
              </p>
              <p>
                Named after the Nassim Taleb idea of the rare, transformative event that changes
                everything — except ours is not a surprise. It is prepared for. It is held.
              </p>
            </div>
            <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
              White Swan is included for Heritage subscribers after 12 consecutive months. Available
              standalone at $950.
            </p>
          </div>

          <div className={cn(legacyGoldPanel, "rounded-[20px]")}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] tracking-wide text-primary">
              <CasketIcon size={20}  />
              White Swan
            </span>
            <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Standalone
            </p>
            {whiteSwanIncluded ? (
              <p className="mt-1 text-5xl text-primary">Included ✓</p>
            ) : (
              <p className="mt-1 text-5xl text-white">$950</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {whiteSwanIncluded ? "Your Heritage subscription" : "with 1 year Heritage subscription"}
            </p>
            <div className="my-5 h-px bg-border" />
            <ul className="space-y-2.5 text-[13px] text-subtle">
              {WHITE_SWAN_INCLUDES.map((line) => (
                <li key={line} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={scrollToConsultation}
              className="mt-6 w-full rounded-full bg-primary py-3 text-[13px] font-medium text-primary-foreground transition hover:opacity-90"
            >
              Book a White Swan consultation →
            </button>
            <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
              Or include it free with Heritage —{" "}
              <Link to="/pricing" className="underline hover:text-muted-foreground">
                $200/yr
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Two ways in */}
      <section className={cn(marketingSection, "px-[5%]")}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-display-lg text-white">Two ways in.</h2>
          <p className="mt-3 text-sm text-subtle">
            Whether you&apos;re planning ahead or responding to loss — Heritage meets you where you
            are.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className={cn(legacyGoldPanel, "rounded-2xl")}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">
              Annual plan
            </p>
            <h3 className="mt-2 text-2xl text-white">Heritage</h3>
            <p className="mt-2 text-xl font-medium text-white">$200 / yr</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Full legacy curation all year. White Swan included after 12 months. Cinematic films,
              heirloom books, unlimited vault.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-subtle">
              {FEATURES.map((f) => (
                <li key={f.title}>· {f.title}</li>
              ))}
            </ul>
            <Link
              to="/pricing#legacy-curation"
              className="mt-6 flex w-full items-center justify-center rounded-full bg-white py-3 text-center text-sm font-medium text-background"
            >
              Start Heritage →
            </Link>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10 p-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              One-time
            </p>
            <h3 className="mt-2 text-2xl text-white">White Swan</h3>
            <p className="mt-2 text-xl font-medium text-white">$950</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              For families who need it now. On-the-ground memorial coordination, tribute film,
              photography, and family gathering.
            </p>
            <button
              type="button"
              onClick={scrollToConsultation}
              className="mt-6 w-full rounded-full border border-border bg-card py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary"
            >
              Book now →
            </button>
          </div>
        </div>
      </section>

      {/* 5. Consultation */}
      <section id="consultation" className={cn("border-t border-border bg-background", marketingSection, "px-[5%]")}>
        <div className="mx-auto max-w-lg text-center">
          <h2 className="text-display-lg italic text-white">Tell us about your family.</h2>
          <p className="mt-3 text-sm text-subtle">
            No pressure. No sales call. Just a conversation about what your family needs and when.
          </p>
        </div>

        {submitted ? (
          <p className="mx-auto mt-12 max-w-md text-center text-base text-primary">
            Thank you. Someone from Beiza will reach out within 24 hours.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-12 flex max-w-[480px] flex-col gap-4"
          >
            <input
              required
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={legacyFormField}
            />
            <input
              required
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={legacyFormField}
            />
            <select
              name="country"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className={legacyFormField}
            >
              <option value="">Where is your family based?</option>
              <option value="Ghana">Ghana</option>
              <option value="Nigeria">Nigeria</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Other">Other</option>
            </select>
            <select
              required
              name="planning_for"
              value={form.planning_for}
              onChange={(e) => setForm((f) => ({ ...f, planning_for: e.target.value }))}
              className={legacyFormField}
            >
              <option value="">What are you planning for?</option>
              <option value="memorial">A memorial — someone has passed</option>
              <option value="ahead">Planning ahead for a loved one</option>
              <option value="own">My own legacy</option>
              <option value="unsure">Not sure yet</option>
            </select>
            <textarea
              name="message"
              rows={4}
              placeholder="Any details that would help us prepare for the conversation."
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className={legacyFormField}
            />
            <input
              name="referral_source"
              placeholder="How did you hear about Heritage? (optional)"
              value={form.referral_source}
              onChange={(e) => setForm((f) => ({ ...f, referral_source: e.target.value }))}
              className={legacyFormField}
            />
            {formError ? (
              <p className="text-center text-sm text-red-400">{formError}</p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send — we'll be in touch within 24 hours →"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Or email us directly at{" "}
          <a href="mailto:heritage@beizalegacy.com" className="underline hover:text-subtle">
            heritage@beizalegacy.com
          </a>
        </p>
      </section>

      {/* 6. Closing */}
      <section className={cn("bg-secondary/30 px-[5%] py-20 text-center", marketingSection)}>
        <blockquote className="mx-auto max-w-[560px] text-[22px] italic leading-relaxed text-muted-foreground">
          Gye Nyame. Except God, nothing is greater — not even forgetting.
        </blockquote>
      </section>

      <Footer />
      {studioPanel ? (
        <HeroLayoutStudioPanel page="heritage" frame={heroFrame} onChange={setHeroFrame} />
      ) : null}
    </div>
  );
}