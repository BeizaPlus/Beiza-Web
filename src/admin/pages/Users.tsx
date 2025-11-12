import { ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudTable } from "@/admin/components/crud";
import { ManagerForm } from "@/admin/components/managers";
import { useManagersAdmin } from "../hooks/useAdminData";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  invited: "bg-amber-100 text-amber-700",
  suspended: "bg-rose-100 text-rose-700",
};

const Users = () => {
  const { data: managers = [], isLoading, isError, error } = useManagersAdmin();
  const errorMessage = error instanceof Error ? error.message : "Unable to load managers.";

  const formatLastSignIn = (value?: string | null) =>
    value
      ? new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "—";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Users & Roles</h1>
          <p className="text-sm text-slate-600">Invite new managers, review access levels, and monitor sign-ins.</p>
        </div>
        <ManagerForm
          trigger={
            <Button className="rounded-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite manager
            </Button>
          }
        />
      </header>

      <CrudTable
        title="Team roster"
        description="Keep track of who can access the studio and adjust permissions as the team evolves."
        dataCount={managers.length}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyMessage="No managers yet."
        columns={
          <tr>
            <th className="px-6 py-4 text-left font-medium">Email</th>
            <th className="px-6 py-4 text-left font-medium">Role</th>
            <th className="px-6 py-4 text-left font-medium">Status</th>
            <th className="px-6 py-4 text-left font-medium">Last sign-in</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        }
      >
        {managers.map((manager) => (
          <tr key={manager.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 text-slate-900">{manager.email}</td>
            <td className="px-6 py-4 text-slate-600">
              {manager.role
                .split("_")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ")}
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[manager.status] ?? "bg-slate-100 text-slate-600"}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {manager.status}
              </span>
            </td>
            <td className="px-6 py-4 text-slate-500">{formatLastSignIn(manager.last_sign_in_at)}</td>
            <td className="px-6 py-4 text-right">
              <ManagerForm
                manager={{
                  id: manager.id,
                  email: manager.email,
                  role: manager.role as "super_admin" | "publisher" | "editor" | "viewer",
                  status: manager.status as "active" | "invited" | "suspended",
                }}
                trigger={
                  <Button variant="outline" className="rounded-full text-slate-700 hover:bg-slate-100">
                    Manage
                  </Button>
                }
              />
            </td>
          </tr>
        ))}
      </CrudTable>
    </div>
  );
};

export default Users;

