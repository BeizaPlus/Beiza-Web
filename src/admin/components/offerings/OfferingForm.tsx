import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Palette, Heart, FileText, Monitor, Box, Cloud, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import { useUpsertOfferingMutation, type OfferingInput } from "../../hooks/useAdminMutations";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

// Available icons for offerings
const AVAILABLE_ICONS = [
  { key: "palette", label: "Palette", icon: <Palette className="h-4 w-4" strokeWidth={1.5} /> },
  { key: "heart", label: "Heart", icon: <Heart className="h-4 w-4" strokeWidth={1.5} /> },
  { key: "file-text", label: "File Text", icon: <FileText className="h-4 w-4" strokeWidth={1.5} /> },
  { key: "monitor", label: "Monitor", icon: <Monitor className="h-4 w-4" strokeWidth={1.5} /> },
  { key: "box", label: "Box", icon: <Box className="h-4 w-4" strokeWidth={1.5} /> },
  { key: "cloud", label: "Cloud", icon: <Cloud className="h-4 w-4" strokeWidth={1.5} /> },
  { key: "sparkles", label: "Sparkles (Default)", icon: <Sparkles className="h-4 w-4" strokeWidth={1.5} /> },
] as const;

const offeringSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title is required."),
  description: z.string().max(600, "Keep descriptions under 600 characters.").optional(),
  icon_key: z.string().optional(),
  display_order: z.coerce.number().int().min(1, "Display order must be at least 1.").default(1),
  is_published: z.boolean(),
});

type OfferingFormValues = z.infer<typeof offeringSchema>;

type OfferingFormProps = {
  trigger: ReactNode;
  offering?: OfferingInput;
};

export const OfferingForm = ({ trigger, offering }: OfferingFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertOffering = useUpsertOfferingMutation();

  const defaultValues = useMemo(
    () => ({
      id: offering?.id,
      title: offering?.title ?? "",
      description: offering?.description ?? "",
      icon_key: offering?.icon_key ?? "",
      display_order: offering?.display_order ?? 1,
      is_published: offering?.is_published ?? true,
    }),
    [offering],
  );

  const form = useForm<OfferingFormValues>({
    resolver: zodResolver(offeringSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const mutationError = upsertOffering.isError ? extractSupabaseErrorMessage(upsertOffering.error) : null;

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: OfferingInput = {
      id: values.id,
      title: values.title.trim(),
      description: values.description?.trim() || null,
      icon_key: values.icon_key?.trim() || null,
      display_order: values.display_order,
      is_published: values.is_published,
    };

    await upsertOffering.mutateAsync(payload);
    toast({
      title: offering ? "Offering updated" : "Offering created",
      description: `"${payload.title}" has been saved.`,
    });
    setOpen(false);
  });

  return (
    <CrudFormDrawer
      title={offering ? "Edit offering" : "Add offering"}
      description="Configure services and control their availability on the site."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="md"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={upsertOffering.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={upsertOffering.isPending} className="bg-white text-black hover:bg-white/90">
            {upsertOffering.isPending ? "Saving…" : "Save offering"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}
        <div className="space-y-2">
          <Label htmlFor="offering-title">Title</Label>
          <Input id="offering-title" {...form.register("title")} />
          <p className="text-xs text-rose-200">{form.formState.errors.title?.message}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="offering-description">Description</Label>
          <Textarea id="offering-description" rows={4} {...form.register("description")} />
          <p className="text-xs text-rose-200">{form.formState.errors.description?.message}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="offering-icon">Icon</Label>
            <select
              id="offering-icon"
              {...form.register("icon_key")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white/5 text-white border-white/20"
            >
              <option value="">None (Default: Sparkles)</option>
              {AVAILABLE_ICONS.map((iconOption) => (
                <option key={iconOption.key} value={iconOption.key}>
                  {iconOption.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/50">Select an icon to display with this offering</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="offering-order">Display order</Label>
            <Input id="offering-order" type="number" min={1} {...form.register("display_order", { valueAsNumber: true })} />
            <p className="text-xs text-rose-200">{form.formState.errors.display_order?.message}</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <Label htmlFor="offering-published">Publish offering</Label>
            <p className="text-xs text-white/60">Only published offerings appear on landing and services pages.</p>
          </div>
          <Switch
            id="offering-published"
            checked={form.watch("is_published")}
            onCheckedChange={(checked) => form.setValue("is_published", checked, { shouldDirty: true })}
          />
        </div>
      </form>
    </CrudFormDrawer>
  );
};

