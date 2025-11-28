import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { TributeForm } from "@/components/tribute/TributeForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMemoirSummaries } from "@/hooks/useMemoirs";
import { useSiteSettings } from "@/hooks/usePublicContent";
import { useSubmitTribute } from "@/hooks/useSubmitTribute";
import type { MemoirSummary } from "@/types/memoir";

type TributeFormValues = {
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  message: string;
  memoirId: string;
};

const TributePage = () => {
  const [useMailto, setUseMailto] = useState(false);
  const { data: memoirs = [], isLoading: memoirsLoading } = useMemoirSummaries();
  const { data: siteSettings } = useSiteSettings();
  const submitTribute = useSubmitTribute();

  const handleMailtoSubmit = (values: TributeFormValues) => {
    const selectedMemoir = memoirs.find((m) => m.id === values.memoirId);
    const memoirTitle = selectedMemoir?.title || "Selected Memoir";

    const emailBody = [
      `Tribute Submission for: ${memoirTitle}`,
      "",
      "---",
      "",
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      values.phone ? `Phone: ${values.phone}` : "",
      values.relationship ? `Relationship: ${values.relationship}` : "",
      "",
      "Message:",
      values.message,
    ]
      .filter(Boolean)
      .join("\n");

    const subject = encodeURIComponent(`Tribute Submission for ${memoirTitle}`);
    const body = encodeURIComponent(emailBody);
    const to = siteSettings?.emailPrimary || "hello@beiza.tv";

    window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleSupabaseSubmit = async (values: TributeFormValues): Promise<boolean> => {
    try {
      await submitTribute.mutateAsync({
        memoirId: values.memoirId,
        name: values.name,
        relationship: values.relationship || null,
        message: values.message,
      });
      return true; // Success
    } catch (error) {
      return false; // Error - form should not reset
    }
  };

  const handleSubmit = async (values: TributeFormValues): Promise<boolean> => {
    if (useMailto) {
      handleMailtoSubmit(values);
      // Don't reset form for mailto - user might want to make changes
      return false;
    } else {
      return await handleSupabaseSubmit(values);
    }
  };

  const publishedMemoirs = useMemo(() => {
    return memoirs.filter((m) => m.id); // Filter out any invalid memoirs
  }, [memoirs]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="space-y-24 pb-24 pt-32 lg:space-y-32 lg:pb-32">
        <section className="mx-auto max-w-4xl px-6">
          <SectionHeader
            eyebrow="Tribute"
            title="Share a Tribute"
            description="Honor a loved one by sharing your memories, thoughts, or words of tribute. Your message will be reviewed and added to their memoir."
            align="center"
          />

          <div className="mt-12 glass-panel rounded-[32px] border border-white/10 p-6 shadow-glass md:p-10">
            {/* Submission Mode Toggle */}
            <div className="mb-8 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="space-y-1">
                <Label htmlFor="submission-mode" className="text-sm font-medium text-white">
                  Submission Method
                </Label>
                <p className="text-xs text-subtle">
                  {useMailto
                    ? "Submit via email (mailto link)"
                    : "Submit directly to database (default)"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-subtle">Mailto</span>
                <Switch
                  id="submission-mode"
                  checked={useMailto}
                  onCheckedChange={setUseMailto}
                />
                <span className="text-xs text-subtle">Supabase</span>
              </div>
            </div>

            {memoirsLoading ? (
              <div className="py-12 text-center text-subtle">Loading memoirs...</div>
            ) : publishedMemoirs.length === 0 ? (
              <div className="py-12 text-center text-subtle">
                No published memoirs available at this time.
              </div>
            ) : (
              <TributeForm
                memoirs={publishedMemoirs}
                onSubmit={handleSubmit}
                isSubmitting={submitTribute.isPending}
              />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TributePage;
