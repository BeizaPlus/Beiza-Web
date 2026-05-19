import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GOLD = "#E6A817";

type LegacyKeeperUpsellDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LegacyKeeperUpsellDialog({ open, onOpenChange }: LegacyKeeperUpsellDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e1e1e] bg-[#111111] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg text-white">
            Vault control is a Keeper feature
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#888]">
            On the free Circle plan, memories are permanent — they&apos;re kept forever. Upgrade to
            Keeper to delete, manage, and download your recordings.
          </DialogDescription>
        </DialogHeader>
        <Link
          to="/pricing"
          onClick={() => onOpenChange(false)}
          className="mt-4 block w-full rounded-full py-3 text-center text-sm font-semibold text-[#111]"
          style={{ backgroundColor: GOLD }}
        >
          Upgrade to Keeper — $4.99/mo
        </Link>
      </DialogContent>
    </Dialog>
  );
}