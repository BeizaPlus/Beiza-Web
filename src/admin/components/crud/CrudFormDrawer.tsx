import type { ReactNode } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type DrawerSize = "sm" | "md" | "lg";

const SIZE_CLASSNAME: Record<DrawerSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-2xl",
  lg: "sm:max-w-4xl",
};

type CrudFormDrawerProps = {
  title: string;
  description?: string;
  trigger?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: DrawerSize;
  className?: string;
  contentClassName?: string;
};

export const CrudFormDrawer = ({
  title,
  description,
  trigger,
  children,
  footer,
  open,
  onOpenChange,
  size = "md",
  className,
  contentClassName,
}: CrudFormDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent className={cn("admin-content bg-background text-foreground", className)}>
        <div className={cn("mx-auto flex w-full max-h-[calc(100vh-2rem)] flex-col px-4 pb-8 pt-2", SIZE_CLASSNAME[size])}>
          <DrawerHeader className="gap-1 pb-4 text-left">
            <DrawerTitle className="text-lg font-semibold text-slate-900">{title}</DrawerTitle>
            {description ? <DrawerDescription className="text-sm text-slate-600">{description}</DrawerDescription> : null}
          </DrawerHeader>
          <div className={cn("flex-1 overflow-y-auto px-2", contentClassName)}>{children}</div>
          {footer ? <DrawerFooter className="mt-6 gap-3 px-2">{footer}</DrawerFooter> : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};


