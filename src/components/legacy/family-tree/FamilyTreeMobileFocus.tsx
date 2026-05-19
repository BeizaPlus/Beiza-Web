import type { FamilyPerson, RecordingPersonLink } from "@/lib/legacy/types";
import { countMemoriesForPerson, personInitials } from "@/lib/legacy/familyTree";
import { FamilyTreeNodeCard } from "@/components/legacy/family-tree/FamilyTreeNodeCard";
import { Button } from "@/components/ui/button";

type FamilyTreeMobileFocusProps = {
  people: FamilyPerson[];
  links: RecordingPersonLink[];
  currentUserId?: string;
  selectedPersonId: string | null;
  onSelectPerson: (personId: string) => void;
  onViewFullTree: () => void;
  fullTreeMode: boolean;
};

export function FamilyTreeMobileFocus({
  people,
  links,
  currentUserId,
  selectedPersonId,
  onSelectPerson,
  onViewFullTree,
  fullTreeMode,
}: FamilyTreeMobileFocusProps) {
  const self = people.find((p) => p.user_id === currentUserId) ?? people[0];
  if (!self) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Your tree will appear once circle members are synced.
      </p>
    );
  }

  const parents = people.filter((p) => p.id === self.parent_id);
  const siblings = people.filter(
    (p) => p.parent_id && p.parent_id === self.parent_id && p.id !== self.id,
  );
  const children = people.filter((p) => p.parent_id === self.id);

  const memoryCount = (id: string) => countMemoriesForPerson(id, links);

  if (fullTreeMode) {
    return (
      <Button variant="secondary" className="w-full" onClick={onViewFullTree}>
        Back to focused view
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-3">
        {parents.map((p) => (
          <FamilyTreeNodeCard
            key={p.id}
            name={p.display_name}
            initials={personInitials(p.display_name)}
            status={p.status}
            memoryCount={memoryCount(p.id)}
            selected={selectedPersonId === p.id}
            onClick={() => onSelectPerson(p.id)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {siblings.map((p) => (
          <FamilyTreeNodeCard
            key={p.id}
            name={p.display_name}
            initials={personInitials(p.display_name)}
            status={p.status}
            memoryCount={memoryCount(p.id)}
            selected={selectedPersonId === p.id}
            onClick={() => onSelectPerson(p.id)}
          />
        ))}
        <FamilyTreeNodeCard
          name={self.display_name}
          initials={personInitials(self.display_name)}
          status={self.status}
          memoryCount={memoryCount(self.id)}
          selected={selectedPersonId === self.id}
          onClick={() => onSelectPerson(self.id)}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {children.map((p) => (
          <FamilyTreeNodeCard
            key={p.id}
            name={p.display_name}
            initials={personInitials(p.display_name)}
            status={p.status}
            memoryCount={memoryCount(p.id)}
            selected={selectedPersonId === p.id}
            onClick={() => onSelectPerson(p.id)}
          />
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={onViewFullTree}>
        View full tree
      </Button>
    </div>
  );
}
