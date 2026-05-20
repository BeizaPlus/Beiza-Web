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
  reason?: "delete" | "download";
};

export function LegacyKeeperUpsellDialog({
  open,
  onOpenChange,
  reason = "delete",
}: LegacyKeeperUpsellDialogProps) {
  const isDownload = reason === "download";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg text-white">
            {isDownload ? "Download is a Keeper feature" : "Vault control is a Keeper feature"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {isDownload ? (
              <>
                Sharing memories via link is free on every plan. Upgrade to Keeper to download raw
                audio files to your device.
              </>
            ) : (
              <>
                On the free Circle plan, memories are permanent — they&apos;re kept forever. Upgrade
                to Keeper to delete and manage your recordings. Sharing via link stays free.
              </>
            )}
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
