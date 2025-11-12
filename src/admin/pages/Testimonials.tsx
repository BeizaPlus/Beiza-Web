import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { CrudTable, ConfirmDialog } from "@/admin/components/crud";
import { TestimonialForm } from "@/admin/components/testimonials/TestimonialForm";
import {
  useDeleteTestimonialMutation,
  useUpdateTestimonialPublishMutation,
  useUpsertTestimonialMutation,
} from "../hooks/useAdminMutations";
import { useTestimonialsAdmin } from "../hooks/useAdminData";

const Testimonials = () => {
  const { data: testimonials = [], isLoading, isError, error } = useTestimonialsAdmin();
  const errorMessage = error instanceof Error ? error.message : "Unable to load testimonials.";
  const togglePublish = useUpdateTestimonialPublishMutation();
  const deleteTestimonial = useDeleteTestimonialMutation();
  const upsertTestimonial = useUpsertTestimonialMutation();

  const handleTogglePublish = (testimonial: (typeof testimonials)[number], nextPublished: boolean) => {
    togglePublish.mutate(
      { id: testimonial.id, is_published: nextPublished },
      {
        onSuccess: () => {
          toast({
            title: nextPublished ? "Testimonial published" : "Testimonial hidden",
            description: `"${testimonial.author}" has been ${nextPublished ? "made visible" : "removed"} from public surfaces.`,
          });
        },
      },
    );
  };

  const handleDelete = async (testimonial: (typeof testimonials)[number]) => {
    try {
      const snapshot = await deleteTestimonial.mutateAsync({ id: testimonial.id });
      toast({
        title: "Testimonial deleted",
        description: `"${testimonial.author}" was removed.`,
        action: (
          <ToastAction altText="Undo delete" onClick={() => upsertTestimonial.mutate(snapshot)}>
            Undo
          </ToastAction>
        ),
      });
    } catch {
      // Error surfaced via mutation toast
    }
  };

  const publishMutationId = togglePublish.variables?.id;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Testimonials</h1>
        <p className="text-sm text-white/70">
          Curate the voices that appear on landing, services, and contact pages. Toggle surfaces to update placement.
        </p>
      </header>

      <CrudTable
        title="Quotes"
        description="Manage quotes and control where they appear across the site."
        actions={
          <TestimonialForm
            trigger={
              <Button className="rounded-full bg-white text-black hover:bg-white/90">
                Add testimonial
              </Button>
            }
          />
        }
        dataCount={testimonials.length}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyMessage="No testimonials yet."
        columns={
          <tr>
            <th className="px-6 py-4 text-left font-medium">Quote</th>
            <th className="px-6 py-4 text-left font-medium">Author</th>
            <th className="px-6 py-4 text-left font-medium">Surfaces</th>
            <th className="px-6 py-4 text-center font-medium">Published</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        }
      >
        {testimonials.map((testimonial) => {
          const isTogglePending = togglePublish.isPending && publishMutationId === testimonial.id;
          const isDeleting = deleteTestimonial.isPending && deleteTestimonial.variables?.id === testimonial.id;

          return (
            <tr key={testimonial.id} className="transition hover:bg-white/5">
              <td className="px-6 py-4 text-white/80">
                <p className="italic text-white/80">“{testimonial.quote}”</p>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1 text-white">
                  <p className="font-medium">{testimonial.author}</p>
                  {testimonial.role ? <p className="text-xs text-white/60">{testimonial.role}</p> : null}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {testimonial.surfaces.map((surface) => (
                    <span key={surface} className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
                      {surface}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <Switch
                  checked={testimonial.is_published}
                  onCheckedChange={(checked) => handleTogglePublish(testimonial, checked)}
                  disabled={isTogglePending}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <TestimonialForm
                    testimonial={testimonial}
                    trigger={
                      <Button type="button" variant="ghost" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                        Edit
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    title="Delete testimonial?"
                    description={`"${testimonial.author}" will be removed from all surfaces.`}
                    onConfirm={() => handleDelete(testimonial)}
                    isConfirming={isDeleting}
                    variant="danger"
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-50"
                        disabled={deleteTestimonial.isPending}
                        aria-label={`Delete testimonial from ${testimonial.author}`}
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

export default Testimonials;

