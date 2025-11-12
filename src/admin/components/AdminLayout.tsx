import { ReactNode, useEffect } from "react";
import { AdminNav } from "./AdminNav";

type AdminLayoutProps = {
  children: ReactNode;
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  useEffect(() => {
    document.body.classList.add("admin-light");
    return () => {
      document.body.classList.remove("admin-light");
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminNav />
      <main className="flex-1 overflow-y-auto bg-slate-100 p-6 lg:p-10">
        <div className="admin-content mx-auto flex max-w-6xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
};

