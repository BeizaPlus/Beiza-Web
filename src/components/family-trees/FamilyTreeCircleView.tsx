import { useEffect, useState } from "react";
import { FamilyTreeCanvas } from "@/components/legacy/family-tree/FamilyTreeCanvas";
import { PersonBiographyPanel } from "@/components/legacy/family-tree/PersonBiographyPanel";
import { TreeAppShell } from "@/components/family-trees/TreeAppShell";
import { displayCircleName } from "@/lib/legacy/displayCircleName";
import type { FamilyPerson, LegacyRecording, RecordingPersonLink } from "@/lib/legacy/types";
import type { TreeEdgeRow } from "@/lib/legacy/treeRelationships";

type FamilyTreeCircleViewProps = {
  circleId: string;
  circleName: string;
  people: FamilyPerson[];
  links: RecordingPersonLink[];
  recordings: LegacyRecording[];
  treeEdges?: TreeEdgeRow[];
  persistViaApi?: boolean;
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
  treeEdges = [],
  persistViaApi = false,
  backHref = "/circle",
  showInviteBar,
  onCopyAccessCode,
}: FamilyTreeCircleViewProps) {
  const [peopleList, setPeopleList] = useState(people);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setPeopleList(people);
  }, [people]);

  const selectedPerson = peopleList.find((p) => p.id === selectedPersonId) ?? null;
  const title = displayCircleName(circleName);

  const openPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setPanelOpen(true);
  };

  return (
    <TreeAppShell
      circleName={title}
      memberCount={peopleList.length}
      memoryCount={recordings.length}
      backHref={backHref}
      circleId={circleId}
      showInviteBar={showInviteBar}
      onCopyAccessCode={onCopyAccessCode}
      fullscreen={fullscreen}
      onFullscreenChange={setFullscreen}
    >
      {peopleList.length === 0 ? (
        <p className="flex h-full items-center justify-center px-6 text-sm text-[#666666]">
          This circle is growing. Record a memory to add the first branch.
        </p>
      ) : (
        <FamilyTreeCanvas
          people={peopleList}
          links={links}
          recordings={recordings}
          circleId={circleId}
          treeEdges={treeEdges}
          persistViaApi={persistViaApi}
          selectedPersonId={selectedPersonId}
          onSelectPerson={openPerson}
          onPeopleChange={setPeopleList}
          layout="fullViewport"
          fullscreen={fullscreen}
          onFullscreenChange={setFullscreen}
        />
      )}

      <PersonBiographyPanel person={selectedPerson} open={panelOpen} onOpenChange={setPanelOpen} />
    </TreeAppShell>
  );
}
