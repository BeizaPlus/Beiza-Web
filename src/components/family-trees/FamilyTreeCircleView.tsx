import { useState } from "react";
import { Link } from "react-router-dom";
import { BeizaLogoLink } from "@/components/BeizaLogoLink";
import { FamilyTreeCanvas } from "@/components/legacy/family-tree/FamilyTreeCanvas";
import { FamilyTreeMobileFocus } from "@/components/legacy/family-tree/FamilyTreeMobileFocus";
import { PersonBiographyPanel } from "@/components/legacy/family-tree/PersonBiographyPanel";
import { displayCircleName } from "@/lib/legacy/displayCircleName";
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
  const title = displayCircleName(circleName);

  const openPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setPanelOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <header className="z-10 flex shrink-0 flex-col gap-4 border-b border-[#1a1a1a] px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div>
          <BeizaLogoLink variant="wordmark" wordmarkClassName="mb-3 h-4 w-auto opacity-80" />
          <Link
            to={backHref}
            className="text-sm text-[#666666] transition-colors hover:text-white"
          >
            ← {title}
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
        <p className="px-8 py-12 text-sm text-[#666666]">
          This circle is growing. Record a memory to add the first branch.
        </p>
      ) : (
        <>
          <div className="md:hidden">
            <div className="px-4 py-4">
              <FamilyTreeMobileFocus
                people={people}
                links={links}
                selectedPersonId={selectedPersonId}
                onSelectPerson={openPerson}
                fullTreeMode={mobileFullTree}
                onViewFullTree={() => setMobileFullTree((v) => !v)}
              />
            </div>
            {mobileFullTree ? (
              <FamilyTreeCanvas
                people={people}
                links={links}
                recordings={recordings}
                selectedPersonId={selectedPersonId}
                onSelectPerson={openPerson}
                layout="embedded"
              />
            ) : null}
          </div>

          <div className="hidden min-h-0 flex-1 md:block">
            <FamilyTreeCanvas
              people={people}
              links={links}
              recordings={recordings}
              selectedPersonId={selectedPersonId}
              onSelectPerson={openPerson}
              layout="fullViewport"
            />
          </div>
        </>
      )}

      <PersonBiographyPanel person={selectedPerson} open={panelOpen} onOpenChange={setPanelOpen} />
    </div>
  );
}
