import { useEffect, useRef, useState } from "react";
import { FamilyTreeCanvas } from "@/components/legacy/family-tree/FamilyTreeCanvas";
import { PersonBiographyPanel } from "@/components/legacy/family-tree/PersonBiographyPanel";
import { TreeAppShell } from "@/components/family-trees/TreeAppShell";
import { TreeThemeProvider } from "@/components/legacy/family-tree/TreeThemeProvider";
import { TreePersonaChat } from "@/components/family-trees/TreePersonaChat";
import { displayCircleName } from "@/lib/legacy/displayCircleName";
import { resolveTreeLeader } from "@/lib/legacy/treeLeader";
import { computeLeaderCenteredPositions } from "@/lib/legacy/leaderCenteredLayout";
import {
  savePersonCanvasPosition,
  savePersonProfile,
  saveSiblingOrders,
  setTreeLeader,
  updateTreeEdge,
} from "@/lib/legacy/treeCanvasPersistence";
import { planEdgeUpdatesForRelationChange } from "@/lib/legacy/relationshipSync";
import type {
  FamilyPerson,
  FamilyPersonProfilePatch,
  LegacyRecording,
  RecordingPersonLink,
} from "@/lib/legacy/types";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [peopleList, setPeopleList] = useState(people);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [liveTreeEdges, setLiveTreeEdges] = useState(treeEdges);
  const liveTreeEdgesRef = useRef(liveTreeEdges);

  useEffect(() => {
    setLiveTreeEdges(treeEdges);
  }, [treeEdges]);

  useEffect(() => {
    liveTreeEdgesRef.current = liveTreeEdges;
  }, [liveTreeEdges]);

  useEffect(() => {
    setPeopleList(people);
  }, [people]);

  const selectedPerson = peopleList.find((p) => p.id === selectedPersonId) ?? null;
  const title = displayCircleName(circleName);
  const treeLeader = resolveTreeLeader(peopleList, links);

  const handleSetTreeLeader = async (personId: string) => {
    try {
      await setTreeLeader({ circleId, personId, useApi: persistViaApi });
      const positions = computeLeaderCenteredPositions(peopleList, treeEdges, personId);
      const nextPeople = peopleList.map((p) => {
        const pos = positions.get(p.id);
        return {
          ...p,
          is_tree_anchor: p.id === personId,
          canvas_x: pos?.x ?? p.canvas_x,
          canvas_y: pos?.y ?? p.canvas_y,
        };
      });
      setPeopleList(nextPeople);
      if (persistViaApi) {
        for (const p of nextPeople) {
          if (p.canvas_x == null || p.canvas_y == null) continue;
          void savePersonCanvasPosition({
            circleId,
            personId: p.id,
            x: p.canvas_x,
            y: p.canvas_y,
            useApi: true,
          });
        }
      }
      toast({ title: "Family leader pinned", description: "The tree reorganizes around this person." });
    } catch {
      toast({ title: "Could not pin leader", variant: "destructive" });
    }
  };

  const handleProfileSave = async (personId: string, patch: FamilyPersonProfilePatch) => {
    try {
      const saved = await savePersonProfile({
        circleId,
        personId,
        useApi: persistViaApi,
        ...patch,
      });
      const merged = (saved ?? patch) as Partial<FamilyPerson>;
      const nextPeople = peopleList.map((p) => (p.id === personId ? { ...p, ...merged } : p));
      setPeopleList(nextPeople);

      if (patch.relation_label) {
        const updates = planEdgeUpdatesForRelationChange(
          personId,
          patch.relation_label,
          liveTreeEdgesRef.current,
          nextPeople,
        );
        if (updates.length > 0) {
          const nextRows = [...liveTreeEdgesRef.current];
          for (const u of updates) {
            const row = await updateTreeEdge({
              circleId,
              edgeId: u.edgeId,
              relationshipType: u.relationship_type,
              useApi: persistViaApi,
            });
            const idx = nextRows.findIndex((r) => r.id === row.id);
            if (idx >= 0) nextRows[idx] = row;
          }
          setLiveTreeEdges(nextRows);
          toast({
            title: "Relationship lines updated",
            description: `${updates.length} connection${updates.length === 1 ? "" : "s"} adjusted for the new role.`,
          });
        }
      }
    } catch {
      toast({ title: "Could not save profile", variant: "destructive" });
    }
  };

  const handleSiblingOrdersSave = async (
    updates: { personId: string; sibling_order: number }[],
  ) => {
    try {
      await saveSiblingOrders({ circleId, orders: updates, useApi: persistViaApi });
      setPeopleList((prev) =>
        prev.map((p) => {
          const hit = updates.find((u) => u.personId === p.id);
          return hit ? { ...p, sibling_order: hit.sibling_order } : p;
        }),
      );
      toast({
        title: "Birth order updated",
        description: "Use the layout buttons (bottom-left) to auto-arrange the tree.",
      });
    } catch {
      toast({ title: "Could not save birth order", variant: "destructive" });
    }
  };

  const openPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setPanelOpen(true);
  };

  return (
    <TreeThemeProvider>
    <TreeAppShell
      circleName={title}
      memberCount={peopleList.length}
      memoryCount={recordings.length}
      treeLeaderName={treeLeader?.displayName}
      treeLeaderReason={treeLeader?.reasonLabel}
      treeLeaderIsPinned={treeLeader?.isExplicitPin}
      onFocusTreeLeader={
        treeLeader
          ? () => {
              setSelectedPersonId(treeLeader.personId);
              setPanelOpen(true);
            }
          : undefined
      }
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
          treeEdges={liveTreeEdges}
          persistViaApi={persistViaApi}
          selectedPersonId={selectedPersonId}
          onSelectPerson={openPerson}
          onPeopleChange={setPeopleList}
          onTreeEdgesChange={setLiveTreeEdges}
          layout="fullViewport"
          fullscreen={fullscreen}
          onFullscreenChange={setFullscreen}
        />
      )}

      <PersonBiographyPanel
        person={selectedPerson}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        circlePeople={peopleList}
        onProfileSave={handleProfileSave}
        onSiblingOrdersSave={handleSiblingOrdersSave}
        onSetTreeLeader={handleSetTreeLeader}
      />
      {persistViaApi ? <TreePersonaChat circleId={circleId} /> : null}
    </TreeAppShell>
    </TreeThemeProvider>
  );
}
