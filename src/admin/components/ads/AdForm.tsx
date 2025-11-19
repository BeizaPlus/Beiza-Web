import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageUpload } from "@/hooks/use-image-upload";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import { useUpsertAdMutation, type AdsInput } from "../../hooks/useAdminMutations";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

const PLACEMENT_OPTIONS = [
  { value: "home_hero", label: "Home Hero" },
  { value: "blog_sidebar", label: "Blog Sidebar" },
  { value: "footer", label: "Footer" },
  { value: "article_interstitial", label: "Article Interstitial" },
] as const;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
] as const;

const adSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title is required."),
  placement: z.string().min(1, "Placement is required."),
  image_url: z.string().url("Must be a valid URL."),
  link_url: z.string().url("Must be a valid URL."),
  status: z.enum(["draft", "active", "archived"]),
});

type AdFormValues = z.infer<typeof adSchema>;

type AdFormProps = {
  trigger: ReactNode;
  ad?: AdsInput;
};

export const AdForm = ({ trigger, ad }: AdFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertAd = useUpsertAdMutation();

  const defaultValues = useMemo(() => {
    return {
      id: ad?.id,
      title: ad?.title ?? "",
      placement: ad?.placement ?? "",
      image_url: ad?.image_url ?? "",
      link_url: ad?.link_url ?? "",
      status: ad?.status ?? "draft",
    };
  }, [ad]);

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open)
    {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const mutationError = upsertAd.isError ? extractSupabaseErrorMessage(upsertAd.error) : null;
  const imageUrlValue = form.watch("image_url");

  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    uploading: isUploadingImage,
    error: uploadError,
  } = useImageUpload({
    bucket: "public-assets",
    folder: "ads",
    initialUrl: defaultValues.image_url || null,
    onUpload: ({ url }) => {
      form.setValue("image_url", url, { shouldDirty: true });
    },
    onRemove: () => {
      form.setValue("image_url", "", { shouldDirty: true });
    },
  });

  const removeImage = () => {
    handleRemove();
    form.setValue("image_url", "", { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: AdsInput = {
      id: values.id,
      title: values.title.trim(),
      placement: values.placement,
      image_url: values.image_url.trim(),
      link_url: values.link_url.trim(),
      status: values.status,
    };

    await upsertAd.mutateAsync(payload);
    toast({
      title: ad ? "Ad updated" : "Ad created",
      description: `"${payload.title}" has been saved.`,
    });
    setOpen(false);
  });

  return (
    <CrudFormDrawer
      title={ad ? "Edit Ad" : "Create Ad"}
      description="Manage advertisement details and placement."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="md"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={upsertAd.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={upsertAd.isPending || isUploadingImage} className="bg-white text-black hover:bg-white/90">
            {upsertAd.isPending ? "Saving…" : "Save Ad"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}

        <div className="space-y-2">
          <Label htmlFor="ad-title">Title</Label>
          <Input id="ad-title" placeholder="Summer Campaign 2025" {...form.register("title")} />
          <p className="text-xs text-rose-200">{form.formState.errors.title?.message}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ad-placement">Placement</Label>
            <Select
              value={form.watch("placement")}
              onValueChange={(value) => form.setValue("placement", value, { shouldDirty: true })}
            >
              <SelectTrigger id="ad-placement">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {PLACEMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-rose-200">{form.formState.errors.placement?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad-status">Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value as "draft" | "active" | "archived", { shouldDirty: true })}
            >
              <SelectTrigger id="ad-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ad Image</Label>
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
              {previewUrl || imageUrlValue ? (
                <img
                  src={previewUrl ?? imageUrlValue}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Upload</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={handleThumbnailClick}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? "Uploading…" : "Choose image"}
                </Button>
                {imageUrlValue ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full border border-white/10 text-white/80 hover:bg-white/10"
                    onClick={removeImage}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-white/50">
                Upload an image for the advertisement. Stored in `public-assets/ads`.
              </p>
              {uploadError ? <p className="text-xs text-rose-200">{uploadError}</p> : null}
              <p className="text-xs text-rose-200">{form.formState.errors.image_url?.message}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ad-link-url">Target URL</Label>
          <Input id="ad-link-url" placeholder="https://partner.com/promo" {...form.register("link_url")} />
          <p className="text-xs text-rose-200">{form.formState.errors.link_url?.message}</p>
        </div>
      </form>
    </CrudFormDrawer>
  );
};
