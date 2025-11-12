import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import { useUpsertMemoirTributeMutation } from "../../hooks/useAdminMutations";
import type { MemoirTributeAdminEntry } from "../../hooks/useMemoirTributesAdmin";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

const tributeSchema = z.object({
  id: z.string().optional(),
  memoir_id: z.string().min(1, "Missing memoir reference."),
  name: z.string().min(2, "Name is required."),
  relationship: z.string().optional(),
  message: z.string().min(12, "Message should be at least 12 characters."),
  display_order: z.number().int().positive().optional(),
});

type TributeFormValues = z.infer<typeof tributeSchema>;

type TributeFormProps = {
  memoirId: string;
  trigger: ReactNode;
  tribute?: MemoirTributeAdminEntry;
  defaultOrder?: number;
};

const mapDefaults = (
  memoirId: string,
  tribute?: MemoirTributeAdminEntry,
  defaultOrder?: number,
): TributeFormValues => ({
  id: tribute?.id,
  memoir_id: memoirId,
  name: tribute?.name ?? "",
  relationship: tribute?.relationship ?? "",
  message: tribute?.message ?? "",
  display_order: tribute?.display_order ?? defaultOrder ?? undefined,
});

export const TributeForm = ({ memoirId, trigger, tribute, defaultOrder }: TributeFormProps) => {
  const [open, setOpen] = useState(false);
  const upsertTribute = useUpsertMemoirTributeMutation();

  const defaultValues = useMemo(() => mapDefaults(memoirId, tribute, defaultOrder), [memoirId, tribute, defaultOrder]);

  const form = useForm<TributeFormValues>({
    resolver: zodResolver(tributeSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await upsertTribute.mutateAsync({
      id: values.id,
      memoir_id: values.memoir_id,
      name: values.name.trim(),
      relationship: values.relationship?.trim() || null,
      message: values.message.trim(),
      display_order: values.display_order ?? defaultOrder ?? undefined,
    });
    setOpen(false);
  });

  const mutationError = upsertTribute.isError ? extractSupabaseErrorMessage(upsertTribute.error) : null;

  return (
    <CrudFormDrawer
      title={tribute ? "Edit tribute" : "Add tribute"}
      description="Capture heartfelt words shared during the celebration."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="md"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={upsertTribute.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button
            onClick={handleSubmit}
            disabled={upsertTribute.isPending}
            className="rounded-full bg-white text-black hover:bg-white/90"
          >
            {upsertTribute.isPending ? "Saving…" : tribute ? "Save changes" : "Add tribute"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="tribute-name">Name</Label>
            <Input id="tribute-name" {...form.register("name")} />
            <p className="text-xs text-rose-200">{form.formState.errors.name?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tribute-relationship">Relationship</Label>
            <Input id="tribute-relationship" placeholder="Sibling, Friend, Colleague" {...form.register("relationship")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tribute-message">Message</Label>
            <Textarea id="tribute-message" rows={5} {...form.register("message")} />
            <p className="text-xs text-rose-200">{form.formState.errors.message?.message}</p>
          </div>
        </div>
      </form>
    </CrudFormDrawer>
  );
};


