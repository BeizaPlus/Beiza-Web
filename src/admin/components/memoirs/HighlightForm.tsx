import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import {
  useUpsertMemoirHighlightMutation,
  type MemoirHighlightInput,
} from "../../hooks/useAdminMutations";
import type { MemoirHighlightAdminEntry } from "../../hooks/useMemoirHighlightsAdmin";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";
import { useImageUpload } from "@/hooks/use-image-upload";

const highlightSchema = z
  .object({
    id: z.string().optional(),
    memoir_id: z.string().min(1, "Missing memoir reference."),
    caption: z.string().optional(),
    media_src: z.string().url("Upload an image first.").min(1, "Image is required."),
    media_alt: z.string().min(3, "Provide descriptive alt text."),
    media_placeholder: z.string().optional(),
    display_order: z.number().int().positive().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.media_src) {
      ctx.addIssue({
        path: ["media_src"],
        code: z.ZodIssueCode.custom,
        message: "Upload an image to continue.",
      });
    }
  });

type HighlightFormValues = z.infer<typeof highlightSchema>;

type HighlightFormProps = {
  memoirId: string;
  memoirSlug?: string;
  trigger: ReactNode;
  highlight?: MemoirHighlightAdminEntry;
  defaultOrder?: number;
};

const mapDefaults = (
  memoirId: string,
  highlight?: MemoirHighlightAdminEntry,
  defaultOrder?: number,
): HighlightFormValues => ({
  id: highlight?.id,
  memoir_id: memoirId,
  caption: highlight?.caption ?? "",
  media_src: highlight?.media.src ?? "",
  media_alt: highlight?.media.alt ?? "",
  media_placeholder: highlight?.media.placeholder ?? "",
  display_order: highlight?.display_order ?? defaultOrder ?? undefined,
});

export const HighlightForm = ({ memoirId, memoirSlug, trigger, highlight, defaultOrder }: HighlightFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertHighlight = useUpsertMemoirHighlightMutation();

  const defaultValues = useMemo(() => mapDefaults(memoirId, highlight, defaultOrder), [memoirId, highlight, defaultOrder]);

  const form = useForm<HighlightFormValues>({
    resolver: zodResolver(highlightSchema),
    defaultValues,
  });

  // Watch media_src to keep initialUrl in sync with form state
  const mediaSrc = form.watch("media_src");

  const {
    previewUrl,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    fileInputRef,
    uploading,
    error: uploadError,
  } = useImageUpload({
    folder: memoirSlug ? `memoirs/${memoirSlug}/highlights` : "memoirs/highlights",
    onUpload: ({ url }) => {
      form.setValue("media_src", url, { shouldValidate: true });
    },
    onRemove: () => {
      form.setValue("media_src", "", { shouldValidate: true });
    },
    initialUrl: mediaSrc || highlight?.media.src || null,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: MemoirHighlightInput = {
      id: values.id,
      memoir_id: values.memoir_id,
      caption: values.caption?.trim() || null,
      media: {
        src: values.media_src,
        alt: values.media_alt.trim(),
        placeholder: values.media_placeholder?.trim() || null,
      },
      display_order: values.display_order ?? defaultOrder ?? undefined,
    };

    await upsertHighlight.mutateAsync(payload);
    setOpen(false);
  });

  const mutationError = upsertHighlight.isError ? extractSupabaseErrorMessage(upsertHighlight.error) : null;

  return (
    <CrudFormDrawer
      title={highlight ? "Edit gallery image" : "Add gallery image"}
      description="Upload imagery that captures moments from this memoir."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={upsertHighlight.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button
            onClick={handleSubmit}
            disabled={upsertHighlight.isPending || uploading}
            className="rounded-full bg-white text-black hover:bg-white/90"
          >
            {upsertHighlight.isPending ? "Saving…" : highlight ? "Save changes" : "Add image"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}
        <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-100 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:w-1/2">
              {previewUrl ? (
                <img src={previewUrl} alt="Highlight preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">No image selected</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-200"
                  onClick={handleThumbnailClick}
                  disabled={uploading}
                >
                  {uploading ? "Uploading…" : "Choose image"}
                </Button>
                {previewUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full border border-slate-300 text-slate-600 hover:text-slate-900"
                    onClick={handleRemove}
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              {uploadError ? <p className="text-xs text-rose-200">{uploadError}</p> : null}
              <p className="text-xs text-slate-500">
                Upload a high-resolution image (minimum 1600px wide). Files are stored in Supabase storage and shared on
                the public memoir gallery.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="highlight-alt">Alt text</Label>
            <Input id="highlight-alt" {...form.register("media_alt")} />
            <p className="text-xs text-rose-200">{form.formState.errors.media_alt?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="highlight-caption">Caption</Label>
            <Input id="highlight-caption" placeholder="Optional caption displayed under the image" {...form.register("caption")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="highlight-placeholder">Placeholder</Label>
          <Textarea
            id="highlight-placeholder"
            placeholder="Optional base64 blur placeholder"
            rows={2}
            {...form.register("media_placeholder")}
          />
        </div>
      </form>
    </CrudFormDrawer>
  );
};


