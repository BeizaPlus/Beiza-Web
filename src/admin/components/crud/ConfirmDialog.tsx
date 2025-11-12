import { type ReactNode, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  title: string;
  description?: ReactNode;
  trigger: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  isConfirming?: boolean;
  variant?: "default" | "danger";
  className?: string;
};

export const ConfirmDialog = ({
  title,
  description,
  trigger,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isConfirming = false,
  variant = "default",
  className,
}: ConfirmDialogProps) => {
  const handleConfirm = useCallback(async () => {
    if (!onConfirm) {
      return;
    }

    await onConfirm();
  }, [onConfirm]);

  const confirmVariant = variant === "danger" ? "destructive" : "default";

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("bg-background text-foreground", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isConfirming}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


