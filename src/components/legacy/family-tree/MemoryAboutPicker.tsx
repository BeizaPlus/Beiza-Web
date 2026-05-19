import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FamilyPerson, MemoryAboutChoice } from "@/lib/legacy/types";
import { cn } from "@/lib/utils";

type MemoryAboutPickerProps = {
  people: FamilyPerson[];
  value: MemoryAboutChoice | null;
  onChange: (choice: MemoryAboutChoice) => void;
  className?: string;
};

export function MemoryAboutPicker({ people, value, onChange, className }: MemoryAboutPickerProps) {
  const [newName, setNewName] = useState("");

  const selectPerson = (personId: string) => onChange({ type: "person", personId });

  return (
    <div className={cn("space-y-4 rounded-xl border border-border bg-card p-4", className)}>
      <div>
        <Label className="text-sm font-medium text-white">Who is this memory about?</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Each answer becomes a fragment on their tree node — the biography builds itself.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onChange({ type: "self" })}
          className={cn(
            "rounded-lg border px-3 py-2.5 text-left text-sm transition",
            value?.type === "self"
              ? "border-primary bg-primary/10 text-white"
              : "border-border text-muted-foreground hover:border-primary/40",
          )}
        >
          Myself
        </button>

        {people.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => selectPerson(person.id)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-sm transition",
              value?.type === "person" && value.personId === person.id
                ? "border-primary bg-primary/10 text-white"
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {person.display_name}
            {person.relation_label ? (
              <span className="ml-2 text-xs text-[#555555]">{person.relation_label}</span>
            ) : null}
          </button>
        ))}

        <div className="rounded-lg border border-dashed border-border p-3">
          <p className="text-xs text-muted-foreground">Someone not in my circle yet</p>
          <Input
            className="mt-2"
            placeholder="Their name"
            value={newName}
            onChange={(e) => {
              const name = e.target.value;
              setNewName(name);
              if (name.trim()) onChange({ type: "new", name: name.trim() });
            }}
          />
          {value?.type === "new" ? (
            <p className="mt-2 text-xs text-primary">
              We&apos;ll add {value.name} to your tree as an awaiting node.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
