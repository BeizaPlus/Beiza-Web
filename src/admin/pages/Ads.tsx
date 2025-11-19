import { Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { CrudTable, ConfirmDialog } from "@/admin/components/crud";
import { AdForm } from "@/admin/components/ads/AdForm";
import { useAdsAdmin } from "../hooks/useAdminData";
import {
  useUpsertAdMutation,
  useDeleteAdMutation,
} from "../hooks/useAdminMutations";

const PLACEMENT_LABELS: Record<string, string> = {
  home_hero: "Home Hero",
  blog_sidebar: "Blog Sidebar",
  footer: "Footer",
  article_interstitial: "Article Interstitial",
};

const Ads = () => {
  const { data: ads = [], isLoading, isError, error } = useAdsAdmin();
  const errorMessage = error instanceof Error ? error.message : "Unable to load ads.";

  const upsertAd = useUpsertAdMutation();
  const deleteAd = useDeleteAdMutation();



  const handleDelete = async (ad: (typeof ads)[number]) => {
    try
    {
      await deleteAd.mutateAsync({ id: ad.id });
      toast({
        title: "Ad deleted",
        description: `"${ad.title}" was deleted.`,
        action: (
          <ToastAction
            altText="Undo delete"
            onClick={() =>
              upsertAd.mutate({
                id: ad.id,
                title: ad.title,
                image_url: ad.image_url,
                link_url: ad.link_url,
                placement: ad.placement,
                status: ad.status,
              })
            }
          >
            Undo
          </ToastAction>
        ),
      });
    } catch
    {
      // Error handled by mutation
    }
  };



  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Ads & Sponsorships</h1>
        <p className="text-sm text-white/70">
          Manage advertisement placements and sponsorships across the site.
        </p>
      </header>

      <CrudTable
        title="Active Campaigns"
        description="Monitor and manage your ad campaigns."
        actions={
          <AdForm
            trigger={
              <Button className="rounded-full bg-white text-black hover:bg-white/90">
                Create Ad
              </Button>
            }
          />
        }
        dataCount={ads.length}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyMessage="No ads found. Create one to get started."
        columns={
          <tr>
            <th className="px-6 py-4 text-left font-medium">Ad Details</th>
            <th className="px-6 py-4 text-left font-medium">Placement</th>
            <th className="px-6 py-4 text-center font-medium">Status</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        }
      >
        {ads.map((ad) => {
          const isDeleting = deleteAd.isPending && deleteAd.variables?.id === ad.id;

          return (
            <tr key={ad.id} className="transition hover:bg-white/5">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-white/10">
                    {ad.image_url ? (
                      <img src={ad.image_url} alt={ad.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/40">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{ad.title}</div>
                    <a
                      href={ad.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-white/60 hover:text-white"
                    >
                      {ad.link_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">
                  {PLACEMENT_LABELS[ad.placement] ?? ad.placement}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ad.status === "active"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : ad.status === "archived"
                      ? "bg-rose-500/20 text-rose-200"
                      : "bg-gray-500/20 text-gray-200"
                    }`}
                >
                  {ad.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <AdForm
                    ad={ad}
                    trigger={
                      <Button type="button" variant="ghost" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                        Edit
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title="Delete Ad?"
                    description={`"${ad.title}" will be permanently removed.`}
                    onConfirm={() => handleDelete(ad)}
                    isConfirming={isDeleting}
                    variant="danger"
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-50"
                        disabled={deleteAd.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </CrudTable>
    </div>
  );
};

export default Ads;
