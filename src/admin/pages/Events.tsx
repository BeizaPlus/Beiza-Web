import { Calendar as CalendarIcon, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { CrudTable, ConfirmDialog } from "@/admin/components/crud";
import { EventForm } from "@/admin/components/events";
import {
  useDeleteEventMutation,
  useUpdateEventStatusMutation,
  useUpsertEventMutation,
} from "../hooks/useAdminMutations";
import { useEventsAdmin } from "../hooks/useAdminData";

const Events = () => {
  const { data: events = [], isLoading, isError, error } = useEventsAdmin();
  const errorMessage = error instanceof Error ? error.message : "Unable to load events.";
  const updateStatus = useUpdateEventStatusMutation();
  const deleteEvent = useDeleteEventMutation();
  const upsertEvent = useUpsertEventMutation();

  const handlePublishToggle = (event: (typeof events)[number], next: boolean) => {
    updateStatus.mutate(
      { id: event.id, is_published: next },
      {
        onSuccess: () => {
          toast({
            title: next ? "Event published" : "Event hidden",
            description: `"${event.title}" visibility updated.`,
          });
        },
      },
    );
  };

  const handleFeaturedToggle = (event: (typeof events)[number], next: boolean) => {
    updateStatus.mutate(
      { id: event.id, is_featured: next },
      {
        onSuccess: () => {
          toast({
            title: next ? "Event featured" : "Event unfeatured",
            description: `"${event.title}" feature status updated.`,
          });
        },
      },
    );
  };

  const handleDelete = async (event: (typeof events)[number]) => {
    try
    {
      const snapshot = await deleteEvent.mutateAsync({ id: event.id });
      toast({
        title: "Event deleted",
        description: `"${event.title}" was removed.`,
        action: (
          <ToastAction altText="Undo delete" onClick={() => upsertEvent.mutate(snapshot)}>
            Undo
          </ToastAction>
        ),
      });
    } catch
    {
      // handled by mutation toast
    }
  };

  const statusMutationId = updateStatus.variables?.id;
  const formatEventDate = (value?: string | null) =>
    value
      ? new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "Date pending";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Events</h1>
          <p className="text-sm text-slate-600">Feature celebrations and control what appears in the public events index.</p>
        </div>
        <EventForm
          trigger={
            <Button className="rounded-full">
              Schedule event
            </Button>
          }
        />
      </header>

      <CrudTable
        title="Event roster"
        description="Manage scheduled experiences and keep featured events fresh."
        actions={
          <EventForm
            trigger={
              <Button className="rounded-full" variant="outline">
                Add event
              </Button>
            }
          />
        }
        dataCount={events.length}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyMessage="No events recorded."
        columns={
          <tr>
            <th className="px-6 py-4 text-left font-medium">Details</th>
            <th className="px-6 py-4 text-left font-medium">Timing</th>
            <th className="px-6 py-4 text-left font-medium">Location</th>
            <th className="px-6 py-4 text-center font-medium">Featured</th>
            <th className="px-6 py-4 text-center font-medium">Published</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        }
      >
        {events.map((event) => {
          const isMutating = updateStatus.isPending && statusMutationId === event.id;
          const isDeleting = deleteEvent.isPending && deleteEvent.variables?.id === event.id;
          return (
            <tr key={event.id} className="transition hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-slate-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {event.occurs_on ? new Date(event.occurs_on).toLocaleDateString() : "Date TBC"}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{event.title}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{formatEventDate(event.occurs_on)}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{event.location ?? "—"}</td>
              <td className="px-6 py-4 text-center">
                <Switch checked={event.is_featured ?? false} onCheckedChange={(checked) => handleFeaturedToggle(event, checked)} disabled={isMutating} />
              </td>
              <td className="px-6 py-4 text-center">
                <Switch checked={event.is_published ?? false} onCheckedChange={(checked) => handlePublishToggle(event, checked)} disabled={isMutating} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <EventForm
                    event={{
                      ...event,
                      title: event.title ?? "",
                      occurs_on: event.occurs_on ?? "",
                      location: event.location ?? "",
                      is_featured: event.is_featured ?? false,
                      is_published: event.is_published ?? false,
                      id: event.id ?? "",
                      slug: event.slug ?? "",
                    }}
                    trigger={
                      <Button type="button" variant="outline" className="rounded-full">
                        Edit
                      </Button>
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => window.open(`/events/${event.occurs_on ? new Date(event.occurs_on).toISOString() : "date-tbc"}`, "_blank", "noopener")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <ConfirmDialog
                    title="Delete event?"
                    description={`"${event.title}" will be removed from the schedule.`}
                    onConfirm={() => handleDelete(event)}
                    isConfirming={isDeleting}
                    variant="danger"
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        disabled={deleteEvent.isPending}
                        aria-label={`Delete ${event.title}`}
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

      <Card className="border-slate-200 bg-white text-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-700">Pricing Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Use this space to capture internal pricing guidance for event packages.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Events;

