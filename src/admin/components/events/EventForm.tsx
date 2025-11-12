import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { useImageUpload } from "@/hooks/use-image-upload";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import { useUpsertEventMutation, type EventInput } from "../../hooks/useAdminMutations";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const EVENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const eventSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(2, "Title is required."),
    slug: z
      .string()
      .min(2, "Slug is required.")
      .regex(EVENT_SLUG_PATTERN, "Slug can only contain lowercase letters, numbers, and hyphens."),
    location: z.string().optional(),
    occurs_on: z.string().optional(),
    description: z.string().optional(),
    hero_image: z.string().optional(),
    hero_alt: z.string().optional(),
    is_featured: z.boolean(),
    is_published: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.hero_image && !values.hero_alt?.trim())
    {
      ctx.addIssue({
        path: ["hero_alt"],
        code: z.ZodIssueCode.custom,
        message: "Provide alt text when adding a hero image.",
      });
    }
  });

type EventFormValues = z.infer<typeof eventSchema>;

type EventFormProps = {
  trigger: ReactNode;
  event?: EventInput;
};

const toLocalDateInput = (value?: string | null) => {
  if (!value)
  {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
  {
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

export const EventForm = ({ trigger, event }: EventFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertEvent = useUpsertEventMutation();

  const defaultValues = useMemo<EventFormValues>(() => {
    const heroMedia = (event?.hero_media as { image_url?: string; alt?: string } | null) ?? null;

    return {
      id: event?.id,
      title: event?.title ?? "",
      slug: event?.slug ?? "",
      location: event?.location ?? "",
      occurs_on: toLocalDateInput(event?.occurs_on ?? undefined),
      description: event?.description ?? "",
      hero_image: heroMedia?.image_url ?? "",
      hero_alt: heroMedia?.alt ?? "",
      is_featured: event?.is_featured ?? false,
      is_published: event?.is_published ?? false,
    };
  }, [event]);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const slugTouchedRef = useRef<boolean>(Boolean(event?.slug));

  useEffect(() => {
    if (open)
    {
      form.reset(defaultValues);
      slugTouchedRef.current = Boolean(defaultValues.slug);
    }
  }, [open, defaultValues, form]);

  useEffect(() => {
    if (event || slugTouchedRef.current)
    {
      return;
    }

    const subscription = form.watch((value, { name, type }) => {
      if (name === "title" && type === "change")
      {
        const title = value.title ?? "";
        if (!title.trim())
        {
          form.setValue("slug", "");
          return;
        }
        form.setValue("slug", slugify(title), { shouldDirty: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, event]);

  const mutationError = upsertEvent.isError ? extractSupabaseErrorMessage(upsertEvent.error) : null;
  const heroImageValue = form.watch("hero_image");

  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    uploading: isUploadingHero,
    error: uploadError,
  } = useImageUpload({
    bucket: "public-assets",
    folder: "events/heroes",
    initialUrl: defaultValues.hero_image || null,
    onUpload: ({ url }) => {
      form.setValue("hero_image", url, { shouldDirty: true });
    },
    onRemove: () => {
      form.setValue("hero_image", "", { shouldDirty: true });
      form.setValue("hero_alt", "", { shouldDirty: true });
    },
  });

  const removeHeroImage = () => {
    handleRemove();
    form.setValue("hero_image", "", { shouldDirty: true });
    form.setValue("hero_alt", "", { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    slugTouchedRef.current = true;

    const payload: EventInput = {
      id: values.id,
      title: values.title.trim(),
      slug: slugify(values.slug.trim()),
      location: values.location?.trim() || null,
      occurs_on: values.occurs_on ? new Date(values.occurs_on).toISOString() : null,
      description: values.description?.trim() || null,
      hero_media: values.hero_image?.trim()
        ? {
          image_url: values.hero_image.trim(),
          alt: values.hero_alt?.trim() || null,
        }
        : null,
      is_featured: values.is_featured,
      is_published: values.is_published,
    };

    await upsertEvent.mutateAsync(payload);
    toast({
      title: event ? "Event updated" : "Event created",
      description: `"${payload.title}" has been saved.`,
    });
    setOpen(false);
  });

  return (
    <CrudFormDrawer
      title={event ? "Edit event" : "Schedule event"}
      description="Capture event basics, manage publish status, and schedule featured celebrations."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={upsertEvent.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={upsertEvent.isPending} className="bg-white text-black hover:bg-white/90">
            {upsertEvent.isPending ? "Saving…" : "Save event"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="event-title">Title</Label>
            <Input id="event-title" {...form.register("title")} />
            <p className="text-xs text-rose-200">{form.formState.errors.title?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-slug">Slug</Label>
            <Input
              id="event-slug"
              {...form.register("slug", {
                onBlur: (event) => {
                  const sanitized = slugify(event.target.value);
                  form.setValue("slug", sanitized, { shouldDirty: true });
                  slugTouchedRef.current = true;
                },
              })}
            />
            <p className="text-xs text-rose-200">{form.formState.errors.slug?.message}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="event-location">Location</Label>
            <Input id="event-location" placeholder="Venue or city" {...form.register("location")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-occurs-on">Date & time</Label>
            <Input id="event-occurs-on" type="datetime-local" {...form.register("occurs_on")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-description">Description</Label>
          <Textarea id="event-description" rows={4} {...form.register("description")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Hero image</Label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div
                className="flex h-32 w-48 items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/20 bg-white/5"
                role="button"
                tabIndex={0}
                onClick={handleThumbnailClick}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                  {
                    event.preventDefault();
                    handleThumbnailClick();
                  }
                }}
              >
                {previewUrl || heroImageValue ? (
                  <img src={previewUrl ?? heroImageValue} alt={form.watch("hero_alt") || "Event hero"} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">Upload image</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10" onClick={handleThumbnailClick} disabled={isUploadingHero}>
                    {isUploadingHero ? "Uploading…" : "Choose image"}
                  </Button>
                  {heroImageValue ? (
                    <Button type="button" variant="ghost" className="rounded-full border border-white/10 text-white/80 hover:bg-white/10" onClick={removeHeroImage}>
                      Remove
                    </Button>
                  ) : null}
                </div>
                <p className="text-xs text-white/50">Upload a landscape image (recommended 1600×900). Stored in Supabase `public-assets`.</p>
                {uploadError ? <p className="text-xs text-rose-200">{uploadError}</p> : null}
              </div>
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="event-hero-alt">Hero image alt text</Label>
            <Input id="event-hero-alt" {...form.register("hero_alt")} disabled={!heroImageValue} placeholder="Describe the hero image for accessibility" />
            <p className="text-xs text-rose-200">{form.formState.errors.hero_alt?.message}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <Label htmlFor="event-published">Publish event</Label>
              <p className="text-xs text-white/60">Show this event on the public events page.</p>
            </div>
            <Switch
              id="event-published"
              checked={form.watch("is_published")}
              onCheckedChange={(checked) => form.setValue("is_published", checked, { shouldDirty: true })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <Label htmlFor="event-featured">Feature event</Label>
              <p className="text-xs text-white/60">Pin this event to the featured carousel.</p>
            </div>
            <Switch
              id="event-featured"
              checked={form.watch("is_featured")}
              onCheckedChange={(checked) => form.setValue("is_featured", checked, { shouldDirty: true })}
            />
          </div>
        </div>
      </form>
    </CrudFormDrawer>
  );
};

