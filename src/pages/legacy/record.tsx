import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RecordMemoryView } from "@/components/legacy/RecordMemoryView";
import { useMyLegacyCircle } from "@/hooks/useLegacy";
import { useFamilyPeople } from "@/hooks/useFamilyTree";

/** Logged-in legacy shell — persists via Supabase auth (`uploadLegacyRecording`). */
export default function LegacyRecordPage() {
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: people = [] } = useFamilyPeople(circle?.id);

  if (!circle) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Join a Legacy Circle before recording.</p>
        <Button asChild>
          <Link to="/legacy/family">Your Legacy Circle</Link>
        </Button>
      </div>
    );
  }

  return (
    <RecordMemoryView
      circleId={circle.id}
      people={people}
      persistViaApi={false}
      treeHref="/legacy/circle"
      vaultHref="/legacy/vault"
    />
  );
}
