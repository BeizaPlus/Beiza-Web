import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateFamilyPerson } from "@/hooks/useFamilyTree";

type AddPersonSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleId: string;
  slot: "parent" | "child";
  parentId?: string | null;
};

export function AddPersonSheet({
  open,
  onOpenChange,
  circleId,
  slot,
  parentId,
}: AddPersonSheetProps) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState(slot === "parent" ? "PARENT" : "FAMILY");
  const createPerson = useCreateFamilyPerson();

  const submit = async () => {
    if (!name.trim()) return;
    await createPerson.mutateAsync({
      circleId,
      displayName: name.trim(),
      relationLabel: relation.trim() || undefined,
      parentId: slot === "child" ? parentId ?? undefined : undefined,
    });
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add family member</DialogTitle>
          <DialogDescription>
            {slot === "parent"
              ? "Add a parent branch to your tree."
              : "Add someone connected to your circle."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="person-name">Name</Label>
            <Input
              id="person-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Their name"
              className="border-border bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="person-relation">Relation (optional)</Label>
            <Input
              id="person-relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="e.g. Mother, Uncle"
              className="border-border bg-background"
            />
          </div>
          <Button
            type="button"
            className="w-full"
            disabled={!name.trim() || createPerson.isPending}
            onClick={() => void submit()}
          >
            {createPerson.isPending ? "Adding…" : "Add to tree"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
