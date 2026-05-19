import { useState } from "react";
import { FamilyTreeCanvas } from "@/components/legacy/family-tree/FamilyTreeCanvas";
import { PersonBiographyPanel } from "@/components/legacy/family-tree/PersonBiographyPanel";
import { TreeAppShell } from "@/components/family-trees/TreeAppShell";
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
  onCopyAccessCode,
}: FamilyTreeCircleViewProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const selectedPerson = people.find((p) => p.id === selectedPersonId) ?? null;
  const title = displayCircleName(circleName);

  const openPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setPanelOpen(true);
  };

  return (
    <TreeAppShell
      circleName={title}
      memberCount={people.length}
      memoryCount={recordings.length}
      backHref={backHref}
      circleId={circleId}
      showInviteBar={showInviteBar}
      onCopyAccessCode={onCopyAccessCode}
      fullscreen={fullscreen}
      onFullscreenChange={setFullscreen}
    >
      {people.length === 0 ? (
        <p className="flex h-full items-center justify-center px-6 text-sm text-[#666666]">
          This circle is growing. Record a memory to add the first branch.
        </p>
      ) : (
        <FamilyTreeCanvas
          people={people}
          links={links}
          recordings={recordings}
          circleId={circleId}
          selectedPersonId={selectedPersonId}
          onSelectPerson={openPerson}
          layout="fullViewport"
          fullscreen={fullscreen}
          onFullscreenChange={setFullscreen}
        />
      )}

      <PersonBiographyPanel person={selectedPerson} open={panelOpen} onOpenChange={setPanelOpen} />
    </TreeAppShell>
  );
}
