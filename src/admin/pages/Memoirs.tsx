import { Link } from "react-router-dom";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/admin/components/crud";
import {
  useDeleteMemoirMutation,
  useRestoreMemoirMutation,
  useUpdateMemoirStatusMutation,
  type MemoirStatus,
} from "../hooks/useAdminMutations";
import { useMemoirsList } from "../hooks/useAdminData";

const Memoirs = () => {
  const { data: memoirs = [], isLoading, isError, error } = useMemoirsList();
  const errorMessage = error instanceof Error ? error.message : "Unable to load memoirs.";
  const updateMemoirStatus = useUpdateMemoirStatusMutation();
  const deleteMemoir = useDeleteMemoirMutation();
  const restoreMemoir = useRestoreMemoirMutation();

  const statusStyles: Record<MemoirStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    review: "bg-amber-100 text-amber-700",
    scheduled: "bg-sky-100 text-sky-700",
    published: "bg-emerald-100 text-emerald-700",
    archived: "bg-slate-200 text-slate-600",
  };

  const handleArchive = (memoir: (typeof memoirs)[number]) => {
    const previousStatus = memoir.status as MemoirStatus;
    updateMemoirStatus.mutate(
      { id: memoir.id, status: "archived" },
      {
        onSuccess: () => {
          toast({
            title: "Memoir archived",
            description: `"${memoir.title}" moved to archived.`,
            action: (
              <ToastAction altText="Undo archive" onClick={() => updateMemoirStatus.mutate({ id: memoir.id, status: previousStatus })}>
                Undo
              </ToastAction>
            ),
          });
        },
      },
    );
  };

  const handleRestoreStatus = (memoir: (typeof memoirs)[number]) => {
    updateMemoirStatus.mutate(
      { id: memoir.id, status: "draft" },
      {
        onSuccess: () => {
          toast({
            title: "Memoir restored",
            description: `"${memoir.title}" returned to draft.`,
          });
        },
      },
    );
  };

  const handleDelete = async (memoir: (typeof memoirs)[number]) => {
    try {
      const deletedSnapshot = await deleteMemoir.mutateAsync({ id: memoir.id });
      toast({
        title: "Memoir deleted",
        description: `"${memoir.title}" was deleted.`,
        action: (
          <ToastAction
            altText="Undo delete"
            onClick={() => {
              if (deletedSnapshot) {
                restoreMemoir.mutate(deletedSnapshot);
              }
            }}
          >
            Undo
          </ToastAction>
        ),
      });
    } catch (mutationError) {
      // Error toast handled inside mutation via useSafeMutation
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Memoirs</h1>
          <p className="text-sm text-slate-600">
            Manage memoir timelines, update chapter metadata, and publish new celebrations.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/admin/memoirs/new">Create memoir</Link>
        </Button>
      </header>

      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-700">Memoir catalogue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead className="bg-slate-100 uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Title</th>
                <th className="px-6 py-4 text-left font-medium">Slug</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Timeline entries</th>
                <th className="px-6 py-4 text-left font-medium">Updated</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-500">
                    Loading memoirs…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-red-500">
                    {errorMessage}
                  </td>
                </tr>
              ) : memoirs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-500">
                    No memoirs yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                memoirs.map((memoir) => (
                  <tr key={memoir.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{memoir.title}</td>
                    <td className="px-6 py-4 text-slate-600">{memoir.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[memoir.status as MemoirStatus]}`}>
                        {memoir.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{memoir.timeline_count}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(memoir.updated_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button asChild variant="secondary" className="rounded-full">
                          <Link to={`/admin/memoirs/${memoir.slug}`}>Open</Link>
                        </Button>
                        {memoir.status === "archived" ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            onClick={() => handleRestoreStatus(memoir)}
                            disabled={updateMemoirStatus.isPending}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Restore
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full text-slate-700 hover:bg-slate-100"
                            onClick={() => handleArchive(memoir)}
                            disabled={updateMemoirStatus.isPending}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </Button>
                        )}
                        <ConfirmDialog
                          title="Delete memoir?"
                          description={`"${memoir.title}" and its sections will be removed. You can undo this action from the toast.`}
                          onConfirm={() => handleDelete(memoir)}
                          isConfirming={deleteMemoir.isPending && deleteMemoir.variables?.id === memoir.id}
                          variant="danger"
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                              disabled={deleteMemoir.isPending}
                              aria-label={`Delete ${memoir.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Memoirs;

