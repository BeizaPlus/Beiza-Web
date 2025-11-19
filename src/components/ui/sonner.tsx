import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-lg group-[.toaster]:border group-[.toaster]:border-slate-200 group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:shadow-xl group-[.toaster]:shadow-slate-200/60",
          title: "group-[.toast]:text-slate-900 font-semibold",
          description: "group-[.toast]:text-slate-600",
          actionButton:
            "group-[.toast]:rounded-full group-[.toast]:bg-slate-900 group-[.toast]:px-4 group-[.toast]:text-white group-[.toast]:hover:bg-slate-800",
          cancelButton:
            "group-[.toast]:rounded-full group-[.toast]:border group-[.toast]:border-slate-200 group-[.toast]:bg-white group-[.toast]:px-4 group-[.toast]:text-slate-700 group-[.toast]:hover:bg-slate-100",
        },
        ...toastOptions,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
