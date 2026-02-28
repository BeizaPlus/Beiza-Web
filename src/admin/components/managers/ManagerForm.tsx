import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import {
  useCreateManagerMutation,
  useUpdateManagerMutation,
  useDeleteManagerMutation,
  type ManagerInviteInput,
  type ManagerUpdateInput,
} from "../../hooks/useAdminMutations";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

const statusOptions = ["active", "invited", "suspended"] as const;
const roleOptions = ["super_admin", "publisher", "editor", "viewer"] as const;

const managerSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  role: z.enum(roleOptions, {
    errorMap: () => ({ message: "Select a role." }),
  }),
  display_name: z.string().optional(),
  status: z.enum(statusOptions),
});

type ManagerFormValues = z.infer<typeof managerSchema>;

type ManagerFormProps = {
  trigger: ReactNode;
  manager?: {
    id: string;
    email: string;
    role: (typeof roleOptions)[number];
    status: "active" | "invited" | "suspended";
    display_name?: string | null;
  };
};

export const ManagerForm = ({ trigger, manager }: ManagerFormProps) => {
  const [open, setOpen] = useState(false);
  const createManager = useCreateManagerMutation();
  const updateManager = useUpdateManagerMutation();
  const deleteManager = useDeleteManagerMutation();

  const defaultValues = useMemo<ManagerFormValues>(
    () => ({
      email: manager?.email ?? "",
      role: manager?.role ?? "viewer",
      display_name: manager?.display_name ?? "",
      status: manager?.status ?? "invited",
    }),
    [manager],
  );

  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open)
    {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const createError = createManager.isError ? extractSupabaseErrorMessage(createManager.error) : null;
  const updateError = updateManager.isError ? extractSupabaseErrorMessage(updateManager.error) : null;
  const deleteError = deleteManager.isError ? extractSupabaseErrorMessage(deleteManager.error) : null;
  const mutationError = deleteError || (manager ? updateError : createError);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (manager)
    {
      const payload: ManagerUpdateInput = {
        id: manager.id,
        role: values.role.trim(),
        status: values.status,
        display_name: values.display_name?.trim() || null,
      };

      await updateManager.mutateAsync(payload);
      toast({
        title: "Manager updated",
        description: `${manager.email} permissions have been updated.`,
      });
    } else
    {
      const payload: ManagerInviteInput = {
        email: values.email.trim(),
        role: values.role.trim(),
        status: values.status,
        display_name: values.display_name?.trim() || null,
      };

      await createManager.mutateAsync(payload);
      toast({
        title: "Manager invited",
        description: `${payload.email} will receive an invitation shortly.`,
      });
    }

    setOpen(false);
  });

  const handleDelete = async () => {
    if (!manager) return;
    if (window.confirm("Are you sure you want to revoke this manager's access? This action cannot be undone."))
    {
      await deleteManager.mutateAsync({ id: manager.id });
      setOpen(false);
    }
  };

  const isSubmitting = createManager.isPending || updateManager.isPending || deleteManager.isPending;

  return (
    <CrudFormDrawer
      title={manager ? "Update manager" : "Invite manager"}
      description={manager ? "Adjust a manager’s role and access." : "Invite a new manager to collaborate in the studio."}
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="md"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
          <div>
            {manager ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                {deleteManager.isPending ? "Revoking..." : "Revoke access"}
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            <DrawerClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DrawerClose>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : manager ? "Save changes" : "Send invite"}
            </Button>
          </div>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}

        <div className="space-y-2">
          <Label htmlFor="manager-email">Email</Label>
          <Input id="manager-email" {...form.register("email")} type="email" disabled={Boolean(manager)} />
          {!manager ? <p className="text-xs text-rose-500">{form.formState.errors.email?.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-role">Role</Label>
          <select
            id="manager-role"
            {...form.register("role")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option
                  .split("_")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ")}
              </option>
            ))}
          </select>
          <p className="text-xs text-rose-500">{form.formState.errors.role?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-display-name">Display name</Label>
          <Input id="manager-display-name" placeholder="Optional display name" {...form.register("display_name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manager-status">Status</Label>
          <select
            id="manager-status"
            {...form.register("status")}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </form>
    </CrudFormDrawer>
  );
};

