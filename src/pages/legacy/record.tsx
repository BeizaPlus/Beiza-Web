import { RecordMemoryView } from "@/components/legacy/RecordMemoryView";
import { useMyLegacyCircle } from "@/hooks/useLegacy";
import { useFamilyPeople } from "@/hooks/useFamilyTree";

/** In-viewport station panel — hero holds sign-in / mic; this handles seal steps only. */
export default function LegacyRecordPage() {
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: people = [] } = useFamilyPeople(circle?.id);

  if (!circle) return null;

  return (
    <RecordMemoryView
      circleId={circle.id}
      circleLabel={circle.name}
      people={people}
      persistViaApi={false}
      treeHref="/legacy/circle"
      vaultHref="/legacy/vault"
      belowHero
      viewportCompact
    />
  );
}
