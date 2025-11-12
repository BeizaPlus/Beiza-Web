import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { CrudTable, ConfirmDialog } from "@/admin/components/crud";
import { OfferingForm } from "@/admin/components/offerings/OfferingForm";
import {
  useDeleteOfferingMutation,
  useUpdateOfferingPublishMutation,
  useUpsertOfferingMutation,
} from "../hooks/useAdminMutations";
import { useOfferingsAdmin } from "../hooks/useAdminData";

const Offerings = () => {
  const { data: offerings = [], isLoading, isError, error } = useOfferingsAdmin();
  const errorMessage = error instanceof Error ? error.message : "Unable to load offerings.";
  const updatePublish = useUpdateOfferingPublishMutation();
  const deleteOffering = useDeleteOfferingMutation();
  const upsertOffering = useUpsertOfferingMutation();

  const handleTogglePublish = (offering: (typeof offerings)[number], nextPublished: boolean) => {
    updatePublish.mutate(
      { id: offering.id, is_published: nextPublished },
      {
        onSuccess: () => {
          toast({
            title: nextPublished ? "Offering published" : "Offering hidden",
            description: `"${offering.title}" visibility updated.`,
          });
        },
      },
    );
  };

  const handleDelete = async (offering: (typeof offerings)[number]) => {
    try
    {
      const snapshot = await deleteOffering.mutateAsync({ id: offering.id });
      toast({
        title: "Offering deleted",
        description: `"${offering.title}" was removed.`,
        action: (
          <ToastAction altText="Undo delete" onClick={() => upsertOffering.mutate(snapshot)}>
            Undo
          </ToastAction>
        ),
      });
    } catch
    {
      // Error toast handled by mutation
    }
  };

  const publishMutationId = updatePublish.variables?.id;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Offerings & Pricing</h1>
        <p className="text-sm text-white/70">Update cards powering the landing and services pages.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <CrudTable
          title="Services catalogue"
          description="Define offerings and control their order and visibility."
          actions={
            <OfferingForm
              trigger={
                <Button className="rounded-full bg-white text-black hover:bg-white/90">
                  Add offering
                </Button>
              }
            />
          }
          dataCount={offerings.length}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          emptyMessage="No offerings configured."
          columns={
            <tr>
              <th className="px-6 py-4 text-left font-medium">Title</th>
              <th className="px-6 py-4 text-left font-medium">Description</th>
              <th className="px-6 py-4 text-center font-medium">Order</th>
              <th className="px-6 py-4 text-center font-medium">Published</th>
              <th className="px-6 py-4 text-left font-medium">Updated</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          }
        >
          {offerings.map((offering) => {
            const isTogglePending = updatePublish.isPending && publishMutationId === offering.id;
            const isDeleting = deleteOffering.isPending && deleteOffering.variables?.id === offering.id;

            return (
              <tr key={offering.id} className="transition hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-white">{offering.title}</td>
                <td className="px-6 py-4 text-sm text-white/70">
                  {offering.description ? <p className="line-clamp-2">{offering.description}</p> : <span className="text-white/40">—</span>}
                </td>
                {/* <td className="px-6 py-4 text-center text-white/70">{offering.display_order ?? "—"}</td> */}
                <td className="px-6 py-4 text-center">
                  <Switch
                    checked={offering.is_published}
                    onCheckedChange={(checked) => handleTogglePublish(offering, checked)}
                    disabled={isTogglePending}
                  />
                </td>
                <td className="px-6 py-4 text-white/60">
                  {offering.updated_at
                    ? new Date(offering.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <OfferingForm
                      offering={offering}
                      trigger={
                        <Button type="button" variant="ghost" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                          Edit
                        </Button>
                      }
                    />
                    <ConfirmDialog
                      title="Delete offering?"
                      description={`"${offering.title}" will be removed from the catalogue.`}
                      onConfirm={() => handleDelete(offering)}
                      isConfirming={isDeleting}
                      variant="danger"
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-50"
                          disabled={deleteOffering.isPending}
                          aria-label={`Delete ${offering.title}`}
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

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white/70">Pricing Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Outline pricing policies, review reminders, or next steps for managers."
              className="min-h-[200px] border-white/10 bg-white/10 text-white placeholder:text-white/40"
            />
            <Button className="rounded-full bg-white text-black hover:bg-white/90">Save notes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Offerings;

