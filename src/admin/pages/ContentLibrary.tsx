import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContentAssets, useGalleryAssetsAdmin } from "../hooks/useAdminData";
import { GalleryAssetForm } from "../components/gallery/GalleryAssetForm";
import { ConfirmDialog } from "../components/crud/ConfirmDialog";
import { useDeleteGalleryAssetMutation } from "../hooks/useAdminMutations";
import { getSupabaseClient } from "@/lib/supabaseClient";

const ContentLibrary = () => {
  const { data: assets = [], isLoading: assetsLoading, isError: assetsError, error: assetsErrorObj } = useContentAssets();
  const { data: galleryAssets = [], isLoading: galleryLoading, isError: galleryError, error: galleryErrorObj } = useGalleryAssetsAdmin();
  const deleteAsset = useDeleteGalleryAssetMutation();

  const assetsErrorMessage = assetsErrorObj instanceof Error ? assetsErrorObj.message : "Unable to load assets.";
  const galleryErrorMessage = galleryErrorObj instanceof Error ? galleryErrorObj.message : "Unable to load gallery assets.";

  const getImageUrl = (storagePath: string) => {
    const client = getSupabaseClient();
    if (!client) return "";
    const { data } = client.storage.from("public-assets").getPublicUrl(storagePath);
    return data.publicUrl;
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Content Library</h1>
        <p className="text-sm text-white/70">
          Manage gallery images displayed on the public gallery page. Upload images with captions and link them to memoirs.
        </p>
      </header>

      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList className="glass-panel inline-flex gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
          <TabsTrigger value="gallery" className="rounded-full px-5 py-2">
            Gallery Assets
          </TabsTrigger>
          <TabsTrigger value="storage" className="rounded-full px-5 py-2">
            Storage Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white/70">Gallery Images</CardTitle>
                <GalleryAssetForm
                  trigger={
                    <Button className="rounded-full bg-white text-black hover:bg-white/90" type="button">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Image
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              {galleryLoading ? (
                <p className="text-sm text-white/60">Loading gallery assets…</p>
              ) : galleryError ? (
                <p className="text-sm text-rose-200">{galleryErrorMessage}</p>
              ) : galleryAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <p className="text-sm text-white/60">No gallery images yet.</p>
                  <GalleryAssetForm
                    trigger={
                      <Button className="rounded-full bg-white text-black hover:bg-white/90" type="button">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Image
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryAssets.map((asset) => {
                    const imageUrl = getImageUrl(asset.storage_path);
                    return (
                      <div key={asset.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40">
                          {imageUrl ? (
                            <img src={imageUrl} alt={asset.alt} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/40">
                              Image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white truncate">{asset.alt}</p>
                          {asset.caption ? (
                            <p className="text-xs text-white/60 line-clamp-2 mt-1">{asset.caption}</p>
                          ) : null}
                          {asset.memoir_title ? (
                            <p className="text-xs uppercase tracking-[0.2em] text-primary mt-1">Linked to: {asset.memoir_title}</p>
                          ) : null}
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                asset.is_published ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-200"
                              }`}
                            >
                              {asset.is_published ? "Published" : "Draft"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-white/60">
                          Updated {new Date(asset.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <div className="mt-auto flex gap-2">
                          <GalleryAssetForm
                            asset={asset}
                            trigger={
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="flex-1 rounded-full border border-white/20 text-white hover:bg-white/10"
                              >
                                <Pencil className="mr-2 h-3 w-3" />
                                Edit
                              </Button>
                            }
                          />
                          <ConfirmDialog
                            title="Delete gallery image?"
                            description="This image will be removed from the gallery page."
                            onConfirm={() => deleteAsset.mutateAsync(asset.id)}
                            isConfirming={deleteAsset.isPending}
                            variant="danger"
                            trigger={
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                                disabled={deleteAsset.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-white/70">Storage Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {assetsLoading ? (
                <p className="text-sm text-white/60">Loading assets…</p>
              ) : assetsError ? (
                <p className="text-sm text-rose-200">{assetsErrorMessage}</p>
              ) : assets.length === 0 ? (
                <p className="text-sm text-white/60">No assets stored yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        {asset.type === "image" ? (
                          <img src={asset.publicUrl} alt={asset.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/40">
                            {asset.type}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">{asset.type}</p>
                      </div>
                      <p className="text-xs text-white/60">
                        Updated {new Date(asset.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <div className="mt-auto flex gap-2 text-xs text-white/70">
                        <a
                          href={asset.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white/10 px-3 py-1 transition hover:bg-white/20"
                        >
                          View asset
                        </a>
                        <a
                          href={`https://app.supabase.com/project/_/storage/buckets/${asset.bucket}/objects/${encodeURIComponent(asset.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white/10 px-3 py-1 transition hover:bg-white/20"
                        >
                          Open in Supabase
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentLibrary;

