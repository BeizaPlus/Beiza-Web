// Recovery is the most important feature in this product.
// It is the reason Heritage exists.
// It is the moment when a family realizes what Beiza is for.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { marketingContainer, marketingSection } from "@/lib/brandUi";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

type FormState = {
  deceasedName: string;
  deceasedContact: string;
  requesterRelation: string;
  requesterEmail: string;
  message: string;
};

const initialForm: FormState = {
  deceasedName: "",
  deceasedContact: "",
  requesterRelation: "",
  requesterEmail: "",
  message: "",
};

export default function RecoverPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Recover a voice · Beiza";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Recover recordings from a loved one who has passed. Beiza helps families retrieve voices and memories — no account required.",
      );
    }
  }, []);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let document_base64: string | undefined;
      let document_filename: string | undefined;
      let document_content_type: string | undefined;

      if (file) {
        const buffer = await file.arrayBuffer();
        document_base64 = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
        );
        document_filename = file.name;
        document_content_type = file.type;
      }

      const res = await fetch("/api/recovery-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deceased_name: form.deceasedName,
          deceased_contact: form.deceasedContact,
          requester_relation: form.requesterRelation,
          requester_email: form.requesterEmail,
          message: form.message,
          document_base64,
          document_filename,
          document_content_type,
        }),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Could not send your request.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className={`${marketingSection} border-t border-[#1a1a1a]`}>
        <div className={`${marketingContainer} max-w-xl`}>
          <p className="text-eyebrow text-primary">Heritage · Recovery</p>
          <h1 className="mt-4 font-manrope text-4xl font-bold tracking-tight text-white md:text-5xl">
            Recover a voice.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#aaaaaa]">
            If someone you loved recorded memories and is no longer here, we can help you retrieve
            what they left behind.
          </p>

          {submitted ? (
            <p className="mt-10 text-lg leading-relaxed text-primary">
              We&apos;ve received your request. A member of the Beiza team will reach out within 24
              hours.
            </p>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="mt-10 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deceasedName">Full name of the person who passed</Label>
                <Input
                  id="deceasedName"
                  required
                  value={form.deceasedName}
                  onChange={(e) => update("deceasedName", e.target.value)}
                  className="border-[#2a2a2a] bg-[#111111]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deceasedContact">
                  Their email address or phone number (used on Beiza)
                </Label>
                <Input
                  id="deceasedContact"
                  required
                  value={form.deceasedContact}
                  onChange={(e) => update("deceasedContact", e.target.value)}
                  className="border-[#2a2a2a] bg-[#111111]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requesterRelation">Your relationship to them</Label>
                <Input
                  id="requesterRelation"
                  required
                  value={form.requesterRelation}
                  onChange={(e) => update("requesterRelation", e.target.value)}
                  className="border-[#2a2a2a] bg-[#111111]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requesterEmail">Your email address (for us to reach you)</Label>
                <Input
                  id="requesterEmail"
                  type="email"
                  required
                  value={form.requesterEmail}
                  onChange={(e) => update("requesterEmail", e.target.value)}
                  className="border-[#2a2a2a] bg-[#111111]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">
                  Upload: death certificate or any identity document (optional)
                </Label>
                <Input
                  id="document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="border-[#2a2a2a] bg-[#111111] file:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Tell us what you&apos;re looking for</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className="border-[#2a2a2a] bg-[#111111]"
                />
              </div>

              {error ? <p className="text-sm text-[#CE1126]">{error}</p> : null}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-primary text-[#0a0a0a] hover:bg-primary/90"
              >
                {submitting ? "Sending…" : "Submit request"}
              </Button>
            </form>
          )}

          <p className="mt-12 text-sm text-[#555555]">
            No Beiza account required.{" "}
            <Link to={BEIZA_LINKS.farewell.heritage} className="text-[#888888] hover:text-white">
              Learn about Heritage →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
