import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TributeForm } from "./TributeForm";
import { Button } from "@/components/ui/button";
import { useMemoirSummaries } from "@/hooks/useMemoirs";
import { useSubmitTribute } from "@/hooks/useSubmitTribute";
import { Plus } from "lucide-react";

type TributeFormValues = {
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  message: string;
  memoirId: string;
};

type TributeFormDialogProps = {
  memoirId: string;
  memoirTitle?: string;
  trigger?: React.ReactNode;
};

export const TributeFormDialog = ({ memoirId, memoirTitle, trigger }: TributeFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { data: memoirs = [] } = useMemoirSummaries();
  const submitTribute = useSubmitTribute();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setFormKey((prev) => prev + 1);
    }
  };

  const handleSubmit = async (values: TributeFormValues): Promise<boolean> => {
    try {
      // Always use the memoirId from props (current memoir being viewed)
      await submitTribute.mutateAsync({
        memoirId: memoirId, // Use the memoirId from props, not from form
        name: values.name,
        relationship: values.relationship || null,
        message: values.message,
      });
      setOpen(false); // Close dialog on success
      return true;
    } catch (error) {
      return false;
    }
  };

  const publishedMemoirs = useMemo(() => {
    return memoirs.filter((m) => m.id);
  }, [memoirs]);

  // Pre-populate memoir ID if available
  const selectedMemoir = useMemo(() => {
    return memoirs.find((m) => m.id === memoirId);
  }, [memoirs, memoirId]);

  const defaultMemoirId = selectedMemoir ? memoirId : "";

  const defaultTrigger = (
    <Button className="button-pill">
      <Plus className="h-4 w-4" />
      <span>Share a Tribute</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share a Tribute</DialogTitle>
          <DialogDescription>
            Honor a loved one by sharing your memories, thoughts, or words of tribute.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {publishedMemoirs.length === 0 ? (
            <div className="py-12 text-center text-subtle">
              No published memoirs available at this time.
            </div>
          ) : (
            <TributeForm
              key={formKey}
              memoirs={publishedMemoirs}
              onSubmit={handleSubmit}
              isSubmitting={submitTribute.isPending}
              defaultMemoirId={defaultMemoirId}
              memoirTitle={selectedMemoir?.title || memoirTitle}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

