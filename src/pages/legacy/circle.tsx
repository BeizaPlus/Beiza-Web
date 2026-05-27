import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FamilyTreeCircleView } from "@/components/family-trees/FamilyTreeCircleView";
import { useLegacyRecordings, useMyLegacyCircle } from "@/hooks/useLegacy";
import {
  useFamilyPeople,
  usePersonTraits,
  useRecordingPersonLinks,
  useSyncCirclePeople,
  useTreeEdges,
} from "@/hooks/useFamilyTree";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

export default function LegacyCirclePage() {
  const { data: circleCtx, isLoading: circleLoading } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: people = [], isLoading: peopleLoading, error: peopleError } = useFamilyPeople(
    circle?.id,
  );
  const { data: links = [] } = useRecordingPersonLinks(circle?.id);
  const { data: recordings = [] } = useLegacyRecordings(circle?.id);
  const { data: treeEdges = [] } = useTreeEdges(circle?.id);
  const { data: personTraits = [] } = usePersonTraits(circle?.id);
  const syncPeople = useSyncCirclePeople();

  useEffect(() => {
    if (circle?.id) {
      syncPeople.mutate(circle.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once per circle load
  }, [circle?.id]);

  if (circleLoading) {
    return (
      <div className="tree-shell fixed inset-0 flex items-center justify-center bg-[#080808] text-[#666666]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="tree-shell fixed inset-0 flex flex-col items-center justify-center bg-[#080808] px-6 text-center">
        <p className="text-sm text-[#666666]">Start a Legacy Circle to grow your family tree.</p>
        <Button asChild className="mt-4">
          <Link to={BEIZA_LINKS.legacy.family}>Create or join</Link>
        </Button>
      </div>
    );
  }

  const treeUnavailable = peopleError?.message?.includes("family_people");

  if (treeUnavailable) {
    return (
      <div className="tree-shell fixed inset-0 flex items-center justify-center bg-[#080808] p-6">
        <p className="max-w-md text-center text-sm text-amber-100/90">
          Apply the family tree migration in Supabase (
          <code className="text-xs">20260522T100000_family_tree.sql</code>) to enable nodes and
          biographies.
        </p>
      </div>
    );
  }

  if (peopleLoading || syncPeople.isPending) {
    return (
      <div className="tree-shell fixed inset-0 flex items-center justify-center bg-[#080808] text-[#666666]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <FamilyTreeCircleView
      circleId={circle.id}
      circleName={circle.name}
      people={people}
      links={links}
      recordings={recordings}
      treeEdges={treeEdges}
      personTraits={personTraits}
      backHref={BEIZA_LINKS.legacy.app}
      treeHref={BEIZA_LINKS.legacy.circle}
    />
  );
}
