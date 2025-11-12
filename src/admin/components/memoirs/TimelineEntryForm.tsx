import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import { useUpsertMemoirTimelineMutation, type MemoirTimelineInput } from "../../hooks/useAdminMutations";
import type { MemoirTimelineAdminEntry } from "../../hooks/useMemoirTimelineAdmin";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";
import { useImageUpload } from "@/hooks/use-image-upload";
import { getSupabaseClient } from "@/lib/supabaseClient";

type TimelineEntryFormProps = {
  memoirSlug: string;
  trigger: ReactNode;
  entry?: MemoirTimelineAdminEntry;
  defaultOrder?: number;
};

const timelineEntrySchema = z
  .object({
    id: z.string().optional(),
    memoir_slug: z.string().min(1),
    title: z.string().min(2, "Title is required."),
    excerpt: z.string().min(20, "Excerpt should be at least 20 characters long."),
    timestamp: z.string().min(1, "A start timestamp is required."),
    end_timestamp: z.string().optional(),
    era_label: z.string().optional(),
    location: z.string().optional(),
    story_url: z
      .string()
      .url("Enter a valid URL.")
      .optional()
      .or(z.literal("")),
    audio_clip_url: z
      .string()
      .url("Enter a valid URL.")
      .optional()
      .or(z.literal("")),
    tags: z.string().optional(),
    participants: z.string().optional(),
    image_src: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === "") return true;
          // Allow URLs (http/https) or blob URLs (for preview)
          return val.startsWith("http") || val.startsWith("blob:");
        },
        "Image must be uploaded or be a valid URL."
      )
      .or(z.literal("")),
    image_alt: z.string().optional(),
    image_placeholder: z.string().optional(),
    is_published: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.image_src && !values.image_alt?.trim()) {
      ctx.addIssue({
        path: ["image_alt"],
        code: z.ZodIssueCode.custom,
        message: "Provide alt text when adding an image.",
      });
    }
  });

type TimelineEntryFormValues = z.infer<typeof timelineEntrySchema>;

const toLocalDateTimeInput = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const normaliseList = (value?: string) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const mapEntryToDefaults = (memoirSlug: string, entry?: MemoirTimelineAdminEntry): TimelineEntryFormValues => ({
  id: entry?.id,
  memoir_slug: memoirSlug,
  title: entry?.title ?? "",
  excerpt: entry?.excerpt ?? "",
  timestamp: toLocalDateTimeInput(entry?.timestamp),
  end_timestamp: toLocalDateTimeInput(entry?.end_timestamp),
  era_label: entry?.era_label ?? "",
  location: entry?.location ?? "",
  story_url: entry?.story_url ?? "",
  audio_clip_url: entry?.audio_clip_url ?? "",
  tags: entry?.tags?.join(", ") ?? "",
  participants: entry?.participants?.join(", ") ?? "",
  image_src: entry?.image?.src ?? "",
  image_alt: entry?.image?.alt ?? "",
  image_placeholder: entry?.image?.placeholder ?? "",
  is_published: entry?.is_published ?? false,
});

export const TimelineEntryForm = ({ memoirSlug, trigger, entry, defaultOrder }: TimelineEntryFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertTimeline = useUpsertMemoirTimelineMutation();

  const defaultValues = useMemo(() => mapEntryToDefaults(memoirSlug, entry), [memoirSlug, entry]);

  const form = useForm<TimelineEntryFormValues>({
    resolver: zodResolver(timelineEntrySchema),
    defaultValues,
  });

  // Watch image_src to sync with image upload
  const imageSrc = form.watch("image_src");

  const getInitialUrl = () => {
    // If form has a value, use it (could be from upload or existing)
    if (imageSrc) {
      return imageSrc;
    }
    // Otherwise, use entry's image if available
    if (!entry?.image?.src) return null;
    // If it's already a full URL, return it
    if (entry.image.src.startsWith("http")) {
      return entry.image.src;
    }
    // If it's a storage path, get the public URL
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = client.storage.from("public-assets").getPublicUrl(entry.image.src);
    return data.publicUrl;
  };

  const {
    previewUrl,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    fileInputRef,
    uploading,
    error: uploadError,
  } = useImageUpload({
    folder: `memoirs/${memoirSlug}/timeline`,
    onUpload: ({ url }) => {
      form.setValue("image_src", url, { shouldValidate: true });
    },
    onRemove: () => {
      form.setValue("image_src", "", { shouldValidate: true });
      form.setValue("image_alt", "", { shouldValidate: true });
    },
    initialUrl: getInitialUrl(),
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: MemoirTimelineInput = {
      id: values.id,
      memoir_slug: values.memoir_slug,
      title: values.title.trim(),
      excerpt: values.excerpt.trim(),
      timestamp: new Date(values.timestamp).toISOString(),
      end_timestamp: values.end_timestamp ? new Date(values.end_timestamp).toISOString() : null,
      era_label: values.era_label?.trim() || null,
      location: values.location?.trim() || null,
      story_url: values.story_url?.trim() ? values.story_url.trim() : null,
      audio_clip_url: values.audio_clip_url?.trim() ? values.audio_clip_url.trim() : null,
      tags: normaliseList(values.tags),
      participants: normaliseList(values.participants),
      image: values.image_src?.trim()
        ? {
            src: values.image_src.trim(),
            alt: values.image_alt?.trim() || "",
            placeholder: values.image_placeholder?.trim() || null,
          }
        : null,
      display_order: entry?.display_order ?? defaultOrder ?? null,
      is_published: values.is_published,
    };

    await upsertTimeline.mutateAsync(payload);
    setOpen(false);
  });

  const mutationError = upsertTimeline.isError ? extractSupabaseErrorMessage(upsertTimeline.error) : null;

  return (
    <CrudFormDrawer
      title={entry ? "Edit timeline entry" : "Add timeline entry"}
      description="Control how this memory appears in the public timeline."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={upsertTimeline.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={upsertTimeline.isPending || uploading} className="bg-white text-black hover:bg-white/90">
            {upsertTimeline.isPending ? "Saving…" : uploading ? "Uploading…" : "Save entry"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="timeline-title">Title</Label>
            <Input id="timeline-title" {...form.register("title")} />
            <p className="text-xs text-rose-200">{form.formState.errors.title?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline-era">Era label</Label>
            <Input id="timeline-era" {...form.register("era_label")} placeholder="e.g., Early Years" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="timeline-timestamp">Start timestamp</Label>
            <Input id="timeline-timestamp" type="datetime-local" {...form.register("timestamp")} />
            <p className="text-xs text-rose-200">{form.formState.errors.timestamp?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline-end-timestamp">End timestamp</Label>
            <Input id="timeline-end-timestamp" type="datetime-local" {...form.register("end_timestamp")} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="timeline-location">Location</Label>
            <Input id="timeline-location" {...form.register("location")} placeholder="Kumasi, Ghana" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline-story-url">Story URL</Label>
            <Input id="timeline-story-url" type="url" {...form.register("story_url")} placeholder="https://…" />
            <p className="text-xs text-rose-200">{form.formState.errors.story_url?.message}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeline-excerpt">Excerpt</Label>
          <Textarea id="timeline-excerpt" rows={4} {...form.register("excerpt")} />
          <p className="text-xs text-rose-200">{form.formState.errors.excerpt?.message}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="timeline-tags">Tags</Label>
            <Input id="timeline-tags" {...form.register("tags")} placeholder="family, celebration" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline-participants">Participants</Label>
            <Input id="timeline-participants" {...form.register("participants")} placeholder="Parents, Siblings" />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-100 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Timeline Image</p>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:w-1/2">
              {previewUrl ? (
                <img src={previewUrl} alt="Timeline entry preview" className="h-full w-full object-cover" />
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
                Upload an image for this timeline entry. Images are stored in Supabase storage.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="timeline-image-alt">Alt text</Label>
            <Input id="timeline-image-alt" {...form.register("image_alt")} placeholder="Describe the image" />
            <p className="text-xs text-rose-200">{form.formState.errors.image_alt?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline-image-placeholder">Placeholder</Label>
            <Textarea
              id="timeline-image-placeholder"
              rows={2}
              {...form.register("image_placeholder")}
              placeholder="Optional base64 blur placeholder"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeline-audio-url">Audio clip URL</Label>
          <Input id="timeline-audio-url" type="url" {...form.register("audio_clip_url")} placeholder="https://…" />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100 px-4 py-3">
          <div>
            <Label htmlFor="timeline-is-published">Publish entry</Label>
            <p className="text-xs text-slate-500">Only published entries appear on the public timeline.</p>
          </div>
          <Switch id="timeline-is-published" checked={form.watch("is_published")} onCheckedChange={(checked) => form.setValue("is_published", checked)} />
        </div>
      </form>
    </CrudFormDrawer>
  );
};


