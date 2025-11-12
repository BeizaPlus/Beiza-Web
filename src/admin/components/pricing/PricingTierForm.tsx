import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import { useUpsertPricingTierMutation, type PricingTierInput } from "../../hooks/useAdminMutations";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

const pricingTierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required."),
  tagline: z.string().optional(),
  price_label: z.string().optional(),
  description: z.string().optional(),
  badge_label: z.string().optional(),
  is_recommended: z.boolean().default(false),
  is_published: z.boolean().default(true),
  display_order: z.coerce.number().int().min(0).default(0),
  features: z
    .array(
      z.object({
        label: z.string().min(1, "Feature label is required."),
      }),
    )
    .default([]),
});

type PricingTierFormValues = z.infer<typeof pricingTierSchema>;

type PricingTierFormProps = {
  trigger: ReactNode;
  tier?: PricingTierInput;
};

export const PricingTierForm = ({ trigger, tier }: PricingTierFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertTier = useUpsertPricingTierMutation();

  const defaultValues = useMemo(
    () => ({
      id: tier?.id,
      name: tier?.name ?? "",
      tagline: tier?.tagline ?? "",
      price_label: tier?.price_label ?? "",
      description: tier?.description ?? "",
      badge_label: tier?.badge_label ?? "",
      is_recommended: tier?.is_recommended ?? false,
      is_published: tier?.is_published ?? true,
      display_order: tier?.display_order ?? 0,
      features: tier?.features?.map((f) => ({ label: f.label })) ?? [],
    }),
    [tier],
  );

  const form = useForm<PricingTierFormValues>({
    resolver: zodResolver(pricingTierSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const mutationError = upsertTier.isError ? extractSupabaseErrorMessage(upsertTier.error) : null;

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: PricingTierInput = {
      id: values.id,
      name: values.name.trim(),
      tagline: values.tagline?.trim() || null,
      price_label: values.price_label?.trim() || null,
      description: values.description?.trim() || null,
      badge_label: values.badge_label?.trim() || null,
      is_recommended: values.is_recommended,
      is_published: values.is_published,
      display_order: values.display_order,
      features: values.features.map((f, index) => ({
        label: f.label.trim(),
        display_order: index + 1,
      })),
    };

    await upsertTier.mutateAsync(payload);
    toast({
      title: tier ? "Pricing tier updated" : "Pricing tier created",
      description: `"${payload.name}" has been saved.`,
    });
    setOpen(false);
  });

  return (
    <CrudFormDrawer
      title={tier ? "Edit pricing tier" : "Add pricing tier"}
      description="Configure pricing tiers and their features for display on the landing page."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={upsertTier.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={upsertTier.isPending} className="bg-white text-black hover:bg-white/90">
            {upsertTier.isPending ? "Saving…" : "Save tier"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tier-name">Name</Label>
            <Input id="tier-name" {...form.register("name")} />
            <p className="text-xs text-rose-200">{form.formState.errors.name?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tier-tagline">Tagline</Label>
            <Input id="tier-tagline" placeholder="E.g., Starting at" {...form.register("tagline")} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tier-price-label">Price Label</Label>
            <Input id="tier-price-label" placeholder="E.g., GHS 8,500" {...form.register("price_label")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tier-badge-label">Badge Label</Label>
            <Input id="tier-badge-label" placeholder="E.g., Featured" {...form.register("badge_label")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tier-description">Description</Label>
          <Textarea id="tier-description" rows={3} {...form.register("description")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tier-order">Display Order</Label>
            <Input id="tier-order" type="number" min={0} {...form.register("display_order", { valueAsNumber: true })} />
            <p className="text-xs text-white/50">Lower numbers appear first</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-white">Features</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "" })}
              className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>
          <div className="space-y-2">
            {fields.length === 0 ? (
              <p className="text-sm text-white/50">No features added. Click "Add Feature" to get started.</p>
            ) : (
              fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...form.register(`features.${index}.label`)}
                    placeholder="Feature description"
                    className="flex-1 border-white/10 bg-white/10 text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <Label htmlFor="tier-recommended">Mark as recommended</Label>
              <p className="text-xs text-white/60">Recommended tiers are highlighted on the landing page.</p>
            </div>
            <Switch
              id="tier-recommended"
              checked={form.watch("is_recommended")}
              onCheckedChange={(checked) => form.setValue("is_recommended", checked, { shouldDirty: true })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <Label htmlFor="tier-published">Publish tier</Label>
              <p className="text-xs text-white/60">Only published tiers appear on public pages.</p>
            </div>
            <Switch
              id="tier-published"
              checked={form.watch("is_published")}
              onCheckedChange={(checked) => form.setValue("is_published", checked, { shouldDirty: true })}
            />
          </div>
        </div>
      </form>
    </CrudFormDrawer>
  );
};

