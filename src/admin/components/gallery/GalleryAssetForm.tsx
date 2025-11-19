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
  useUpsertGalleryAssetMutation,
  useDeleteGalleryAssetMutation,
  type GalleryAssetInput,
} from "../../hooks/useAdminMutations";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useMemoirsList } from "../../hooks/useAdminData";
import { getSupabaseClient } from "@/lib/supabaseClient";

const galleryAssetSchema = z.object({
  storage_path: z.string().min(1, "Upload an image first."),
  alt: z.string().min(3, "Provide descriptive alt text."),
  caption: z.string().optional(),
  memoir_id: z.string().optional(),
  display_order: z.number().int().min(0).optional(),
  is_published: z.boolean().optional(),
});

type GalleryAssetFormValues = z.infer<typeof galleryAssetSchema>;

type GalleryAssetFormProps = {
  trigger: ReactNode;
  asset?: {
    id: string;
    storage_path: string;
    alt: string;
    caption: string | null;
    memoir_id: string | null;
    display_order: number;
    is_published: boolean;
  };
};

const mapDefaults = (asset?: GalleryAssetFormProps["asset"]): GalleryAssetFormValues => ({
  storage_path: asset?.storage_path ?? "",
  alt: asset?.alt ?? "",
  caption: asset?.caption ?? "",
  memoir_id: asset?.memoir_id ?? "",
  display_order: 0, // Not used, but kept for schema compatibility
  is_published: asset?.is_published ?? true,
});

export const GalleryAssetForm = ({ trigger, asset }: GalleryAssetFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertAsset = useUpsertGalleryAssetMutation();
  const deleteAsset = useDeleteGalleryAssetMutation();
  const { data: memoirs = [] } = useMemoirsList();

  const defaultValues = useMemo(() => mapDefaults(asset), [asset]);

  const form = useForm<GalleryAssetFormValues>({
    resolver: zodResolver(galleryAssetSchema),
    defaultValues,
  });

  // Watch storage_path to sync with image upload
  const storagePath = form.watch("storage_path");

  const getInitialUrl = useMemo(() => {
    // If form has a value, use it (could be from upload or existing)
    if (storagePath) {
      // If it's already a full URL, return it
      if (storagePath.startsWith("http")) {
        return storagePath;
      }
      // If it's a storage path, get the public URL
      const client = getSupabaseClient();
      if (!client) return null;
      const { data } = client.storage.from("public-assets").getPublicUrl(storagePath);
      return data.publicUrl;
    }
    // Otherwise, use entry's storage_path if available
    if (!asset?.storage_path) return null;
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = client.storage.from("public-assets").getPublicUrl(asset.storage_path);
    return data.publicUrl;
  }, [storagePath, asset?.storage_path]);

  const {
    previewUrl,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    fileInputRef,
    uploading,
    error: uploadError,
  } = useImageUpload({
    folder: "gallery",
    onUpload: ({ url, path }) => {
      // Set the storage path (this is what we store in the database)
      form.setValue("storage_path", path, { shouldValidate: true });
    },
    onRemove: () => {
      form.setValue("storage_path", "", { shouldValidate: true });
    },
    initialUrl: getInitialUrl,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const handleSubmit = form.handleSubmit(
    async (values) => {
      console.log("[gallery-asset-form] Submitting with values:", values);
      const payload: GalleryAssetInput = {
        id: asset?.id,
        storage_path: values.storage_path,
        alt: values.alt.trim(),
        caption: values.caption?.trim() || null,
        memoir_id: values.memoir_id || null,
        display_order: 0, // Auto-set to 0, no manual ordering needed
        is_published: values.is_published ?? true,
      };

      console.log("[gallery-asset-form] Payload:", payload);
      try {
        await upsertAsset.mutateAsync(payload);
        setOpen(false);
      } catch (error) {
        // Error is handled by the mutation's error toast
        console.error("[gallery-asset-form] Failed to save:", error);
      }
    },
    (errors) => {
      // Form validation failed
      console.error("[gallery-asset-form] Validation errors:", errors);
    }
  );

  const handleDelete = async () => {
    if (!asset?.id) return;
    await deleteAsset.mutateAsync(asset.id);
    setOpen(false);
  };

  const mutationError = upsertAsset.isError ? extractSupabaseErrorMessage(upsertAsset.error) : null;

  return (
    <CrudFormDrawer
      title={asset ? "Edit gallery image" : "Add gallery image"}
      description="Upload images to display on the public gallery page. Link them to memoirs for better organization."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
          <div>
            {asset?.id && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteAsset.isPending}
                className="rounded-full"
              >
                {deleteAsset.isPending ? "Deleting…" : "Delete"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline" disabled={upsertAsset.isPending || deleteAsset.isPending}>
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Trigger form validation and submit
                void handleSubmit();
              }}
              disabled={upsertAsset.isPending || uploading || deleteAsset.isPending}
              className="rounded-full bg-white text-black hover:bg-white/90"
            >
              {upsertAsset.isPending ? "Saving…" : uploading ? "Uploading…" : asset ? "Save changes" : "Add image"}
            </Button>
          </div>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
            <p className="font-medium mb-1">Please fix the following errors:</p>
            <ul className="list-disc list-inside space-y-1">
              {form.formState.errors.storage_path && (
                <li>Image: {form.formState.errors.storage_path.message}</li>
              )}
              {form.formState.errors.alt && (
                <li>Alt text: {form.formState.errors.alt.message}</li>
              )}
              {form.formState.errors.caption && (
                <li>Caption: {form.formState.errors.caption.message}</li>
              )}
            </ul>
          </div>
        )}
        <div className="space-y-3 rounded-lg border border-dashed border-slate-200 bg-slate-100 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:w-1/2">
              {previewUrl ? (
                <img src={previewUrl} alt="Gallery asset preview" className="h-full w-full object-cover" />
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
                Upload a high-resolution image. Files are stored in Supabase storage and displayed on the public gallery
                page.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gallery-alt">Alt text *</Label>
            <Input id="gallery-alt" {...form.register("alt")} />
            <p className="text-xs text-rose-200">{form.formState.errors.alt?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gallery-memoir">Linked Memoir (optional)</Label>
            <select
              id="gallery-memoir"
              {...form.register("memoir_id")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None</option>
              {memoirs.map((memoir) => (
                <option key={memoir.id} value={memoir.id}>
                  {memoir.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gallery-caption">Caption</Label>
          <Textarea
            id="gallery-caption"
            placeholder="Optional caption displayed with the image"
            rows={3}
            {...form.register("caption")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gallery-published">Published</Label>
          <select
            id="gallery-published"
            {...form.register("is_published", {
              setValueAs: (value: string) => value === "true",
            })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>
      </form>
    </CrudFormDrawer>
  );
};

