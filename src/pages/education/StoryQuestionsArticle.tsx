import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAdinkraById } from "@/lib/adinkra";
import { legacyBody, legacyDisplay } from "@/lib/legacyLandingFonts";
import {
  ARTICLE_FAQ,
  QUESTION_CATEGORIES,
  RELATED_ARTICLES,
  STORY_QUESTIONS_SEO,
} from "@/lib/educationStoryQuestionsContent";
import { cn } from "@/lib/utils";

const MUTED = "text-[#6b6560]";

function FaqJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ARTICLE_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function StoryQuestionsArticle() {
  useEffect(() => {
    document.title = STORY_QUESTIONS_SEO.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", STORY_QUESTIONS_SEO.description);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = STORY_QUESTIONS_SEO.description;
      document.head.appendChild(meta);
    }
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = STORY_QUESTIONS_SEO.canonical;
  }, []);

  return (
    <div className={cn("min-h-screen bg-[#f7f4ef] text-[#2c2824]", legacyBody)}>
      <FaqJsonLd />
      <header className="border-b border-[#e8e2d8]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link to="/" className={cn(legacyDisplay, "text-lg tracking-[0.15em]")}>
            BEIZA
          </Link>
          <Link to="/education" className={cn("text-sm font-light", MUTED)}>
            Education
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className={cn(legacyBody, "text-center text-xs font-light uppercase tracking-[0.2em]", MUTED)}>
          Culture First
        </p>
        <h1
          className={cn(
            legacyDisplay,
            "mt-4 text-center text-[2.75rem] font-light leading-tight sm:text-[2.75rem]",
          )}
        >
          52 Questions to Unlock Your Family&apos;s Story
        </h1>
        <p className={cn(legacyBody, "mt-5 text-center text-base font-light", MUTED)}>
          The stories your family carries are irreplaceable. These questions open the door.
        </p>
        <p className={cn(legacyBody, "mt-3 text-center text-sm font-light", MUTED)}>
          By Beiza · {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>

        <div className={cn(legacyBody, "prose-beiza mt-14 space-y-5 text-base font-light leading-[1.8]", MUTED)}>
          <p>
            Most families wait until a funeral to say what should have been said years earlier. Not
            because they do not care — because no one knew which question to ask on a random Tuesday
            afternoon. The right prompt at the right time turns a kitchen table into an archive.
          </p>
          <p>
            These fifty-two questions are grouped so you can start anywhere: childhood, elders,
            culture, love, work, hardship, and legacy. Use them in weekly letters, voice notes, or
            Sunday calls. African and diaspora families especially carry stories in proverb, song,
            and gesture — this list makes room for that richness, not only dates and places.
          </p>
        </div>

        {QUESTION_CATEGORIES.map((cat, idx) => {
          const symbol = getAdinkraById(cat.symbolId);
          return (
            <section key={cat.title} className="mt-16">
              {idx > 0 ? (
                <div className="mb-8 flex justify-center" aria-hidden>
                  <span className={cn(legacyDisplay, "text-sm tracking-widest text-[#c9a962]")}>
                    {symbol?.name ?? "·"}
                  </span>
                </div>
              ) : null}
              <h2 className={cn(legacyDisplay, "text-2xl italic font-light")}>{cat.title}</h2>
              <ol className="mt-6 list-decimal space-y-4 pl-5">
                {cat.questions.map((q) => (
                  <li key={q} className={cn(legacyBody, "text-[15px] font-light leading-relaxed pl-1")}>
                    {q}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}

        <blockquote
          className={cn(
            legacyDisplay,
            "mt-20 rounded-2xl bg-[#231f1c] px-8 py-14 text-center text-[1.75rem] italic font-light leading-snug text-[#f7f4ef]",
          )}
        >
          The stories your grandmother never wrote down are still alive. You just have to ask.
        </blockquote>

        <section className="mt-20">
          <h2 className={cn(legacyDisplay, "text-2xl font-light")}>Beyond questions</h2>
          <p className={cn(legacyBody, "mt-4 text-base font-light leading-[1.8]", MUTED)}>
            Answers deserve more than a camera roll. Beiza links voice to your family tree, compiles
            chapters into a memoir, and — for Heritage families — reconstructs visual ancestry scenes
            and physical keepsakes. You are not filling a form. You are building something your
            grandchildren can hold.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-[#e8e2d8] bg-white/70 p-10 text-center">
          <h2 className={cn(legacyDisplay, "text-2xl font-light")}>Start with one question this week.</h2>
          <Link
            to="/heritage"
            className={cn(
              legacyBody,
              "mt-6 inline-block rounded-full bg-[#2c2824] px-8 py-3 text-sm font-light text-[#f7f4ef] transition hover:bg-[#3d3834]",
            )}
          >
            Begin for free →
          </Link>
        </section>

        <section className="mt-20">
          <h2 className={cn(legacyDisplay, "text-xl font-light")}>Related reading</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {RELATED_ARTICLES.map((a) => (
              <Link
                key={a.title}
                to={a.href}
                className="rounded-xl border border-[#e8e2d8] bg-white/50 p-5 transition hover:border-[#c9a962]/40"
              >
                <p className={cn(legacyDisplay, "text-lg leading-snug")}>{a.title}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className={cn(legacyDisplay, "mb-6 text-xl font-light")}>Frequently asked</h2>
          <Accordion type="single" collapsible>
            {ARTICLE_FAQ.map((item, i) => (
              <AccordionItem key={item.q} value={`a-faq-${i}`} className="border-[#e8e2d8]">
                <AccordionTrigger
                  className={cn(legacyBody, "text-left font-normal hover:no-underline", MUTED)}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className={cn(legacyBody, "text-sm font-light leading-relaxed", MUTED)}>
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </article>
    </div>
  );
}
