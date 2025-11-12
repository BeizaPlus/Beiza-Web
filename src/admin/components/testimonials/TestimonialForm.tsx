import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DrawerClose } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import { useUpsertTestimonialMutation, type TestimonialInput } from "../../hooks/useAdminMutations";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

const SURFACE_OPTIONS = ["landing", "services", "contact"] as const;

const testimonialSchema = z
  .object({
    id: z.string().optional(),
    author: z.string().min(2, "Author is required."),
    role: z.string().optional(),
    quote: z.string().min(40, "Quote should be at least 40 characters."),
    surfaces: z.array(z.string()).default([]),
    customSurfaces: z.string().optional(),
    is_published: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const customList = values.customSurfaces
      ?.split(",")
      .map((surface) => surface.trim())
      .filter(Boolean) ?? [];
    const combined = new Set<string>([...values.surfaces, ...customList]);

    if (combined.size === 0) {
      ctx.addIssue({
        path: ["surfaces"],
        code: z.ZodIssueCode.custom,
        message: "Select at least one surface.",
      });
    }
  });

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

type TestimonialFormProps = {
  trigger: ReactNode;
  testimonial?: TestimonialInput;
};

const normaliseCustomSurfaces = (surfaces: string[] | undefined) =>
  surfaces?.filter((surface) => !SURFACE_OPTIONS.includes(surface as (typeof SURFACE_OPTIONS)[number])) ?? [];

export const TestimonialForm = ({ trigger, testimonial }: TestimonialFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertTestimonial = useUpsertTestimonialMutation();

  const defaultValues = useMemo(() => {
    const currentSurfaces = testimonial?.surfaces ?? [];
    const selected = currentSurfaces.filter((surface) => SURFACE_OPTIONS.includes(surface as (typeof SURFACE_OPTIONS)[number]));
    const custom = normaliseCustomSurfaces(currentSurfaces).join(", ");

    return {
      id: testimonial?.id,
      author: testimonial?.author ?? "",
      role: testimonial?.role ?? "",
      quote: testimonial?.quote ?? "",
      surfaces: selected,
      customSurfaces: custom,
      is_published: testimonial?.is_published ?? true,
    };
  }, [testimonial]);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const mutationError = upsertTestimonial.isError ? extractSupabaseErrorMessage(upsertTestimonial.error) : null;

  const handleSubmit = form.handleSubmit(async (values) => {
    const customList = values.customSurfaces
      ?.split(",")
      .map((surface) => surface.trim())
      .filter(Boolean) ?? [];
    const combinedSurfaces = Array.from(new Set<string>([...values.surfaces, ...customList]));

    const payload: TestimonialInput = {
      id: values.id,
      author: values.author.trim(),
      role: values.role?.trim() || null,
      quote: values.quote.trim(),
      surfaces: combinedSurfaces,
      is_published: values.is_published,
    };

    await upsertTestimonial.mutateAsync(payload);
    toast({
      title: testimonial ? "Testimonial updated" : "Testimonial created",
      description: `"${payload.author}" has been saved.`,
    });
    setOpen(false);
  });

  const selectedSurfaces = form.watch("surfaces");

  const handleSurfaceToggle = (surface: (typeof SURFACE_OPTIONS)[number], checked: boolean) => {
    const current = new Set(selectedSurfaces);
    if (checked) {
      current.add(surface);
    } else {
      current.delete(surface);
    }
    form.setValue("surfaces", Array.from(current), { shouldDirty: true });
  };

  return (
    <CrudFormDrawer
      title={testimonial ? "Edit testimonial" : "Add testimonial"}
      description="Highlight client voices and control where quotes are displayed."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="md"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={upsertTestimonial.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={upsertTestimonial.isPending} className="bg-white text-black hover:bg-white/90">
            {upsertTestimonial.isPending ? "Saving…" : "Save testimonial"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="testimonial-author">Author</Label>
            <Input id="testimonial-author" {...form.register("author")} />
            <p className="text-xs text-rose-200">{form.formState.errors.author?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="testimonial-role">Role</Label>
            <Input id="testimonial-role" placeholder="E.g., Daughter of honoree" {...form.register("role")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="testimonial-quote">Quote</Label>
          <Textarea id="testimonial-quote" rows={4} {...form.register("quote")} />
          <p className="text-xs text-rose-200">{form.formState.errors.quote?.message}</p>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-white">Surfaces</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {SURFACE_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
                <Checkbox
                  id={`surface-${option}`}
                  checked={selectedSurfaces.includes(option)}
                  onCheckedChange={(checked) => handleSurfaceToggle(option, Boolean(checked))}
                />
                <span className="capitalize">{option}</span>
              </label>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="testimonial-custom-surfaces">Additional surfaces</Label>
            <Input
              id="testimonial-custom-surfaces"
              placeholder="Comma-separated list, e.g., newsletter, hero"
              {...form.register("customSurfaces")}
            />
          </div>
          <p className="text-xs text-rose-200">{form.formState.errors.surfaces?.message}</p>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <Label htmlFor="testimonial-published">Publish testimonial</Label>
            <p className="text-xs text-white/60">Only published testimonials surface on public pages.</p>
          </div>
          <Switch
            id="testimonial-published"
            checked={form.watch("is_published")}
            onCheckedChange={(checked) => form.setValue("is_published", checked, { shouldDirty: true })}
          />
        </div>
      </form>
    </CrudFormDrawer>
  );
};

