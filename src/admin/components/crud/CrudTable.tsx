import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CrudTableProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  columns: ReactNode;
  children: ReactNode;
  dataCount: number;
  isLoading?: boolean;
  isError?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
};

const DEFAULT_LOADING = "Loading…";
const DEFAULT_ERROR = "Unable to load data.";
const DEFAULT_EMPTY = "No records to display.";

export const CrudTable = ({
  title,
  description,
  actions,
  columns,
  children,
  dataCount,
  isLoading = false,
  isError = false,
  loadingMessage = DEFAULT_LOADING,
  errorMessage = DEFAULT_ERROR,
  emptyMessage = DEFAULT_EMPTY,
  className,
  tableClassName,
}: CrudTableProps) => {
  const showLoading = isLoading;
  const showError = !isLoading && isError;
  const showEmpty = !isLoading && !isError && dataCount === 0;

  return (
    <Card className={cn("border-slate-200 bg-white text-slate-900", className)}>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <div className="flex flex-shrink-0 items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className={cn("min-w-full divide-y divide-slate-200 text-sm", tableClassName)}>
            <thead className="bg-slate-100 text-xs uppercase tracking-[0.2em] text-slate-500">{columns}</thead>
            <tbody className="divide-y divide-slate-200">
              {showLoading ? (
                <tr>
                  <td colSpan={12} className="px-6 py-6 text-center text-slate-500">
                    {loadingMessage}
                  </td>
                </tr>
              ) : showError ? (
                <tr>
                  <td colSpan={12} className="px-6 py-6 text-center text-red-500">
                    {errorMessage}
                  </td>
                </tr>
              ) : showEmpty ? (
                <tr>
                  <td colSpan={12} className="px-6 py-6 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                children
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};


