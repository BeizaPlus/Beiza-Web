import { useMemo, useState, type FormEvent } from "react";
import { SectionHeader } from "@/components/framer/SectionHeader";

const EMAIL_KEY = "beiza-lead-email";

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function CulturePdfLeadSection() {
  const [email, setEmail] = useState(() =>
    typeof window === "undefined" ? "" : localStorage.getItem(EMAIL_KEY) ?? "",
  );
  const [submitted, setSubmitted] = useState(() =>
    typeof window === "undefined" ? false : isEmailValid(localStorage.getItem(EMAIL_KEY) ?? ""),
  );
  const [error, setError] = useState("");

  const canUnlock = useMemo(() => isEmailValid(email), [email]);

  const onUnlock = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canUnlock) {
      setError("Enter a valid email to unlock the PDF downloads.");
      return;
    }
    localStorage.setItem(EMAIL_KEY, email.trim());
    setSubmitted(true);
    setError("");
  };

  return (
    <section id="culture-symbol-pdfs" className="mx-auto mt-8 w-full max-w-6xl px-6 md:mt-10">
      <div className="rounded-2xl border border-border/70 bg-card/60 p-5 md:p-7">
        <SectionHeader
          eyebrow="Learn More"
          title="Want to learn more?"
          description="We can send you the full cultural symbols list and story prompts."
        />

        <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={onUnlock}>
          <label className="sr-only" htmlFor="lead-email">
            Email
          </label>
          <input
            id="lead-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none ring-offset-background transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            autoComplete="email"
            required
          />
          <button
            type="submit"
            className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Send me the full list
          </button>
        </form>

        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        {submitted ? (
          <p className="mt-4 text-sm text-primary">
            Thanks. You are in — we will send the full symbols list to this email.
          </p>
        ) : null}
      </div>
    </section>
  );
}

