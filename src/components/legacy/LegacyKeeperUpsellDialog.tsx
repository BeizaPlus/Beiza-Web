import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LegacyKeeperUpsellDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LegacyKeeperUpsellDialog({ open, onOpenChange }: LegacyKeeperUpsellDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg text-white">
            Vault control is a Keeper feature
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            On the free Circle plan, memories are permanent — they&apos;re kept forever. Upgrade to
            Keeper to delete, manage, and download your recordings.
          </DialogDescription>
        </DialogHeader>
        <Link
          to="/pricing"
          onClick={() => onOpenChange(false)}
          className="mt-4 block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Upgrade to Keeper — $4.99/mo
        </Link>
      </DialogContent>
    </Dialog>
  );
}
