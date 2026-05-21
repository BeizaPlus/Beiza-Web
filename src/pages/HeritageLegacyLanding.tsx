import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, Mail, Mic, Sparkles, Star } from "lucide-react";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { cn } from "@/lib/utils";
import { legacyBody, legacyDisplay } from "@/lib/legacyLandingFonts";
import {
  LEGACY_FAQ,
  LEGACY_HERO,
  LEGACY_PRICING,
  MEMOIR_STEPS,
  SAMPLE_QUESTIONS,
  TESTIMONIALS,
} from "@/lib/heritageLegacyLandingContent";

const CREAM = "bg-[#f7f4ef] text-[#2c2824]";
const MUTED = "text-[#6b6560]";
const DARK = "bg-[#231f1c] text-[#f7f4ef]";

function OutlineCta({ href, children }: { href: string; children: string }) {
  return (
    <Link
      to={href}
      className={cn(
        legacyBody,
        "inline-block rounded-full border border-[#2c2824] px-8 py-3 text-sm font-light tracking-wide transition hover:bg-[#2c2824] hover:text-[#f7f4ef]",
      )}
    >
      {children}
    </Link>
  );
}

function SolidCta({ href, children, light }: { href: string; children: string; light?: boolean }) {
  return (
    <Link
      to={href}
      className={cn(
        legacyBody,
        "inline-block rounded-full px-8 py-3 text-sm font-light tracking-wide transition",
        light
          ? "border border-white/40 text-white hover:bg-white hover:text-[#231f1c]"
          : "bg-[#2c2824] text-[#f7f4ef] hover:bg-[#3d3834]",
      )}
    >
      {children}
    </Link>
  );
}

const stepIcons = {
  mail: Mail,
  mic: Mic,
  book: BookOpen,
} as const;

export default function HeritageLegacyLanding() {
  useEffect(() => {
    document.title = "Beiza Legacy · Reminisce now. Treasure forever.";
  }, []);

  return (
    <div className={cn("heritage-legacy-page min-h-screen", CREAM, legacyBody)}>
      <header className="border-b border-[#e8e2d8]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to={BEIZA_LINKS.welcome.gate} className={cn(legacyDisplay, "text-xl tracking-[0.2em] text-[#2c2824]")}>
            BEIZA
          </Link>
          <nav className={cn(legacyBody, "flex gap-6 text-sm font-light", MUTED)}>
            <Link to={BEIZA_LINKS.education.storyQuestions} className="hover:text-[#2c2824]">
              Questions
            </Link>
            <Link to={BEIZA_LINKS.marketing.pricing} className="hover:text-[#2c2824]">
              Pricing
            </Link>
            <Link
              to={LEGACY_HERO.ctaHref}
              className="rounded-full border border-[#2c2824] px-5 py-2 text-sm font-light hover:bg-[#2c2824] hover:text-[#f7f4ef]"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* §1 Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <h1
            className={cn(
              legacyDisplay,
              "text-[2.75rem] font-light leading-[1.15] tracking-tight sm:text-5xl",
            )}
          >
            {LEGACY_HERO.headline}
          </h1>
          <p className={cn(legacyBody, "mt-6 max-w-md text-base font-light leading-relaxed", MUTED)}>
            {LEGACY_HERO.subtext}
          </p>
          <div className="mt-8">
            <OutlineCta href={LEGACY_HERO.ctaHref}>{LEGACY_HERO.cta}</OutlineCta>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-[0_24px_60px_-20px_rgba(44,40,36,0.25)]">
          <img
            src={LEGACY_HERO.image}
            alt={LEGACY_HERO.imageAlt}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </section>

      {/* §2 Anyone can write */}
      <section className="border-t border-[#e8e2d8] px-6 py-20">
        <p className={cn(legacyDisplay, "text-center text-2xl italic", MUTED)}>
          Anyone can write a memoir
        </p>
        <div className="mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-3">
          {MEMOIR_STEPS.map((step) => {
            const Icon = stepIcons[step.icon];
            return (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ebe6dc]">
                  <Icon className="h-6 w-6 text-[#5c5348]" strokeWidth={1.25} />
                </div>
                <p className={cn(legacyDisplay, "mt-4 text-3xl font-light text-[#c4bdb2]")}>
                  {step.number}
                </p>
                <p className={cn(legacyBody, "mt-3 text-sm font-light leading-relaxed", MUTED)}>
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* §3 You talk */}
      <section className={cn("mx-6 rounded-2xl px-6 py-16 text-center md:mx-12 lg:mx-auto lg:max-w-5xl", DARK)}>
        <Mic className="mx-auto h-8 w-8 text-[#c9a962]/80" strokeWidth={1.25} aria-hidden />
        <h2 className={cn(legacyDisplay, "mt-6 text-4xl italic font-light")}>
          You talk, we&apos;ll type.
        </h2>
        <p className={cn(legacyBody, "mx-auto mt-5 max-w-xl text-[15px] font-light leading-relaxed text-[#d4cfc8]")}>
          Simply record your story in your own words. Beiza transcribes it for you using AI,
          capturing your voice for future generations.
        </p>
      </section>

      {/* §4 Testimonials */}
      <section className="px-6 py-20">
        <h2 className={cn(legacyDisplay, "text-center text-2xl font-light")}>
          What customers are saying
        </h2>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="rounded-xl border border-[#e8e2d8] bg-white/60 p-6"
            >
              <div className="mb-4 h-12 w-12 rounded-full bg-[#ebe6dc]" aria-hidden />
              <p className={cn(legacyBody, "text-sm font-light leading-relaxed", MUTED)}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className={cn(legacyDisplay, "mt-4 text-lg")}>{t.name}</p>
              <p className={cn(legacyBody, "text-xs font-light", MUTED)}>{t.role}</p>
            </article>
          ))}
        </div>
      </section>

      {/* §5 FAQ */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <Accordion type="single" collapsible className="space-y-2">
          {LEGACY_FAQ.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`} className="border-0 border-b border-[#e8e2d8]">
              <AccordionTrigger
                className={cn(
                  legacyBody,
                  "py-5 text-left text-base font-normal hover:no-underline [&[data-state=open]]:text-[#2c2824]",
                  MUTED,
                )}
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent className={cn(legacyBody, "pb-5 text-sm font-light leading-relaxed", MUTED)}>
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* §6 Finest home */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-2xl">
          <img src={LEGACY_HERO.image} alt="Printed memoir book" className="w-full object-cover" />
        </div>
        <div>
          <p className={cn(legacyDisplay, "text-sm italic", MUTED)}>
            Special memories deserve the finest home
          </p>
          <h2 className={cn(legacyDisplay, "mt-2 text-[2rem] font-light")}>A lifetime of stories.</h2>
          <p className={cn(legacyBody, "mt-4 text-sm font-light leading-relaxed", MUTED)}>
            Turn a lifetime of memories into a keepsake book. Full color, high-quality materials,
            crafted to stand the test of time.
          </p>
          <p className={cn(legacyBody, "mt-4 flex items-center gap-2 text-sm font-light", MUTED)}>
            <Star className="h-4 w-4 text-[#c9a962]" aria-hidden />
            Thoughtful questions to inspire the stories
          </p>
        </div>
      </section>

      {/* §7 Sample questions */}
      <section className="bg-[#ebe6dc]/50 py-14">
        <div className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-thin">
          {SAMPLE_QUESTIONS.map((q) => (
            <div
              key={q}
              className="min-w-[240px] shrink-0 rounded-xl bg-[#f7f4ef] px-6 py-8 shadow-sm"
            >
              <p className={cn(legacyDisplay, "text-lg italic leading-snug text-[#4a443c]")}>
                &ldquo;{q}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* §8 Timeless gift */}
      <section className={cn("px-6 py-20 text-center", DARK)}>
        <h2 className={cn(legacyDisplay, "text-4xl font-light text-white")}>A timeless gift.</h2>
        <p className={cn(legacyBody, "mx-auto mt-5 max-w-lg text-[15px] font-light text-[#d4cfc8]")}>
          For a birthday, Mother&apos;s Day, Father&apos;s Day — give someone a gift that keeps growing.
          A story they&apos;ll cherish forever.
        </p>
        <div className="mt-8">
          <SolidCta href={LEGACY_HERO.ctaHref} light>
            Get started
          </SolidCta>
        </div>
      </section>

      {/* §9 Ancestry teaser */}
      <section className="px-6 py-20 text-center">
        <h2 className={cn(legacyDisplay, "mx-auto max-w-2xl text-[2rem] italic font-light leading-snug")}>
          Then we show you where you come from.
        </h2>
        <p className={cn(legacyBody, "mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed", MUTED)}>
          Answer enough questions and Beiza reconstructs the world your ancestors lived in. Not a
          document. A scene. Your grandmother walking through the city her people built.
        </p>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          {["/assets/ancestry-scene-1.jpg", "/assets/ancestry-scene-2.jpg"].map((src, i) => (
            <div
              key={src}
              className="aspect-[4/3] overflow-hidden rounded-xl bg-[#3d3834]"
            >
              <img
                src={src}
                alt={`Ancestry scene preview ${i + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  el.parentElement!.classList.add("flex", "items-center", "justify-center");
                  if (!el.parentElement!.querySelector("[data-fallback]")) {
                    const span = document.createElement("span");
                    span.dataset.fallback = "1";
                    span.className = cn(legacyBody, "px-4 text-sm font-light text-[#d4cfc8]");
                    span.textContent = "Scene preview coming soon";
                    el.parentElement!.appendChild(span);
                  }
                }}
              />
            </div>
          ))}
        </div>
        <Link
          to={BEIZA_LINKS.education.storyQuestions}
          className={cn(legacyDisplay, "mt-8 inline-block text-lg italic underline underline-offset-4")}
        >
          Learn how it works →
        </Link>
      </section>

      {/* §10 Pricing */}
      <section className="border-t border-[#e8e2d8] px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {LEGACY_PRICING.map((tier) => (
            <article
              key={tier.id}
              className={cn(
                "rounded-2xl border p-8 text-center",
                tier.featured ? "border-[#c9a962] bg-white shadow-md" : "border-[#e8e2d8] bg-white/50",
              )}
            >
              <h3 className={cn(legacyDisplay, "text-2xl font-light")}>{tier.name}</h3>
              <p className={cn(legacyDisplay, "mt-2 text-xl", MUTED)}>{tier.price}</p>
              <p className={cn(legacyBody, "mt-4 text-sm font-light leading-relaxed", MUTED)}>
                {tier.body}
              </p>
              <div className="mt-6">
                <OutlineCta href={tier.href}>{tier.cta}</OutlineCta>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* §11 Footer CTA */}
      <section className={cn("px-6 py-24 text-center", DARK)}>
        <Sparkles className="mx-auto h-6 w-6 text-[#c9a962]/60" aria-hidden />
        <h2 className={cn(legacyDisplay, "mt-6 text-[2.5rem] font-light leading-tight text-white")}>
          Write your stories today.
          <br />
          Cherish them forever.
        </h2>
        <div className="mt-10">
          <SolidCta href={LEGACY_HERO.ctaHref} light>
            Get started
          </SolidCta>
        </div>
        <p className={cn(legacyBody, "mt-12 text-xs font-light text-[#8a847c]")}>
          <Link to={BEIZA_LINKS.welcome.gate} className="underline underline-offset-2 hover:text-white">
            Welcome gate
          </Link>
          {" · "}
          <Link to={BEIZA_LINKS.farewell.heritage} className="underline underline-offset-2 hover:text-white">
            Plan a farewell
          </Link>
          {" · "}
          <Link to={BEIZA_LINKS.home.educationHome} className="underline underline-offset-2 hover:text-white">
            Education
          </Link>
        </p>
      </section>
    </div>
  );
}
