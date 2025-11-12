import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { CrudTable, ConfirmDialog } from "@/admin/components/crud";
import { PricingTierForm } from "@/admin/components/pricing/PricingTierForm";
import {
  useDeletePricingTierMutation,
  useUpdatePricingTierPublishMutation,
  useUpsertPricingTierMutation,
} from "../hooks/useAdminMutations";
import { usePricingTiersAdmin } from "../hooks/useAdminData";

const Pricing = () => {
  const { data: tiers = [], isLoading, isError, error } = usePricingTiersAdmin();
  const errorMessage = error instanceof Error ? error.message : "Unable to load pricing tiers.";
  const updatePublish = useUpdatePricingTierPublishMutation();
  const deleteTier = useDeletePricingTierMutation();
  const upsertTier = useUpsertPricingTierMutation();

  const handleTogglePublish = (tier: (typeof tiers)[number], nextPublished: boolean) => {
    updatePublish.mutate(
      { id: tier.id, is_published: nextPublished },
      {
        onSuccess: () => {
          toast({
            title: nextPublished ? "Pricing tier published" : "Pricing tier hidden",
            description: `"${tier.name}" visibility updated.`,
          });
        },
      },
    );
  };

  const handleDelete = async (tier: (typeof tiers)[number]) => {
    try {
      const snapshot = await deleteTier.mutateAsync({ id: tier.id });
      toast({
        title: "Pricing tier deleted",
        description: `"${tier.name}" was removed.`,
        action: (
          <ToastAction altText="Undo delete" onClick={() => upsertTier.mutate(snapshot)}>
            Undo
          </ToastAction>
        ),
      });
    } catch {
      // Error toast handled by mutation
    }
  };

  const publishMutationId = updatePublish.variables?.id;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Pricing Tiers</h1>
        <p className="text-sm text-white/70">Manage pricing tiers and features displayed on the landing page.</p>
      </header>

      <CrudTable
        title="Pricing Plans"
        description="Configure pricing tiers, their features, and control visibility."
        actions={
          <PricingTierForm
            trigger={
              <Button className="rounded-full bg-white text-black hover:bg-white/90">Add pricing tier</Button>
            }
          />
        }
        dataCount={tiers.length}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyMessage="No pricing tiers configured."
        columns={
          <tr>
            <th className="px-6 py-4 text-left font-medium">Name</th>
            <th className="px-6 py-4 text-left font-medium">Price</th>
            <th className="px-6 py-4 text-left font-medium">Features</th>
            <th className="px-6 py-4 text-center font-medium">Recommended</th>
            <th className="px-6 py-4 text-center font-medium">Published</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        }
      >
        {tiers.map((tier) => {
          const isTogglePending = updatePublish.isPending && publishMutationId === tier.id;
          const isDeleting = deleteTier.isPending && deleteTier.variables?.id === tier.id;

          return (
            <tr key={tier.id} className="transition hover:bg-white/5">
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <p className="font-medium text-white">{tier.name}</p>
                  {tier.tagline ? <p className="text-xs text-white/60">{tier.tagline}</p> : null}
                  {tier.badge_label ? (
                    <span className="inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      {tier.badge_label}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-6 py-4 text-white/80">{tier.price_label ?? "—"}</td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {tier.features.length > 0 ? (
                    <p className="text-sm text-white/70">{tier.features.length} feature(s)</p>
                  ) : (
                    <span className="text-xs text-white/40">No features</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                {tier.is_recommended ? (
                  <span className="inline-block rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">Yes</span>
                ) : (
                  <span className="text-white/40">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <Switch
                  checked={tier.is_published}
                  onCheckedChange={(checked) => handleTogglePublish(tier, checked)}
                  disabled={isTogglePending}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <PricingTierForm
                    tier={{
                      id: tier.id,
                      name: tier.name,
                      tagline: tier.tagline,
                      price_label: tier.price_label,
                      description: tier.description,
                      badge_label: tier.badge_label,
                      is_recommended: tier.is_recommended,
                      is_published: tier.is_published,
                      display_order: tier.display_order,
                      features: tier.features.map((f) => ({ label: f.label, display_order: f.display_order })),
                    }}
                    trigger={
                      <Button type="button" variant="ghost" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                        Edit
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title="Delete pricing tier?"
                    description={`"${tier.name}" and all its features will be removed.`}
                    onConfirm={() => handleDelete(tier)}
                    isConfirming={isDeleting}
                    variant="danger"
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-50"
                        disabled={deleteTier.isPending}
                        aria-label={`Delete ${tier.name}`}
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

export default Pricing;

