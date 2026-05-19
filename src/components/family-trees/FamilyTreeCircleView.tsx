import { useState } from "react";
import { Link } from "react-router-dom";
import { FamilyTreeCanvas } from "@/components/legacy/family-tree/FamilyTreeCanvas";
import { FamilyTreeMobileFocus } from "@/components/legacy/family-tree/FamilyTreeMobileFocus";
import { PersonBiographyPanel } from "@/components/legacy/family-tree/PersonBiographyPanel";
import type { FamilyPerson, LegacyRecording, RecordingPersonLink } from "@/lib/legacy/types";

type FamilyTreeCircleViewProps = {
  circleId: string;
  circleName: string;
  people: FamilyPerson[];
  links: RecordingPersonLink[];
  recordings: LegacyRecording[];
  backHref?: string;
  showInviteBar?: boolean;
  accessCode?: string;
  onCopyAccessCode?: () => void;
};

export function FamilyTreeCircleView({
  circleId,
  circleName,
  people,
  links,
  recordings,
  backHref = "/circle",
  showInviteBar,
  accessCode,
  onCopyAccessCode,
}: FamilyTreeCircleViewProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileFullTree, setMobileFullTree] = useState(false);

  const selectedPerson = people.find((p) => p.id === selectedPersonId) ?? null;

  const openPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setPanelOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#1a1a1a] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to={backHref}
            className="text-sm text-[#666666] transition-colors hover:text-white"
          >
            ← {circleName}
          </Link>
          <p className="mt-2 text-xs text-[#555555]">
            {people.length} members · {recordings.length} memories
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showInviteBar && accessCode ? (
            <button
              type="button"
              onClick={onCopyAccessCode}
              className="rounded-full border border-[#2a2a2a] px-4 py-2 text-xs text-[#aaaaaa] hover:border-primary hover:text-primary"
            >
              Invite family · copy code
            </button>
          ) : null}
          <Link
            to={`/record?circle=${circleId}`}
            className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-[#0a0a0a] hover:bg-primary/90"
          >
            + Add memory →
          </Link>
        </div>
      </header>

      {people.length === 0 ? (
        <p className="text-sm text-[#666666]">
          This circle is growing. Record a memory to add the first branch.
        </p>
      ) : (
        <>
          <div className="md:hidden">
            <FamilyTreeMobileFocus
              people={people}
              links={links}
              selectedPersonId={selectedPersonId}
              onSelectPerson={openPerson}
              fullTreeMode={mobileFullTree}
              onViewFullTree={() => setMobileFullTree((v) => !v)}
            />
            {mobileFullTree ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-[#1a1a1a]">
                <FamilyTreeCanvas
                  people={people}
                  links={links}
                  selectedPersonId={selectedPersonId}
                  onSelectPerson={openPerson}
                />
              </div>
            ) : null}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-[#1a1a1a] md:block">
            <FamilyTreeCanvas
              people={people}
              links={links}
              selectedPersonId={selectedPersonId}
              onSelectPerson={openPerson}
            />
          </div>
        </>
      )}

      <PersonBiographyPanel person={selectedPerson} open={panelOpen} onOpenChange={setPanelOpen} />
    </div>
  );
}
