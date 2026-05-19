import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyLegacyCircle } from "@/hooks/useLegacy";
import {
  useFamilyPeople,
  useRecordingPersonLinks,
  useSyncCirclePeople,
} from "@/hooks/useFamilyTree";
import { FamilyTreeCanvas } from "@/components/legacy/family-tree/FamilyTreeCanvas";
import { FamilyTreeMobileFocus } from "@/components/legacy/family-tree/FamilyTreeMobileFocus";
import { PersonBiographyPanel } from "@/components/legacy/family-tree/PersonBiographyPanel";
import { supabase } from "@/lib/supabaseClient";

export default function LegacyCirclePage() {
  const { data: circleCtx, isLoading: circleLoading } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: people = [], isLoading: peopleLoading, error: peopleError } = useFamilyPeople(
    circle?.id,
  );
  const { data: links = [] } = useRecordingPersonLinks(circle?.id);
  const syncPeople = useSyncCirclePeople();

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileFullTree, setMobileFullTree] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    void supabase?.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  useEffect(() => {
    if (circle?.id) {
      syncPeople.mutate(circle.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once per circle load
  }, [circle?.id]);

  const selectedPerson = people.find((p) => p.id === selectedPersonId) ?? null;

  const openPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setPanelOpen(true);
  };

  if (circleLoading) {
    return (
      <p className="flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your circle…
      </p>
    );
  }

  if (!circle) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">Start a Legacy Circle to grow your family tree.</p>
        <Button asChild>
          <Link to="/legacy/family">Create or join</Link>
        </Button>
      </div>
    );
  }

  const treeUnavailable = peopleError?.message?.includes("family_people");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Living document</p>
        <h2 className="mt-1 text-2xl font-semibold">{circle.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-subtle">
          The tree builds itself from recordings — retrospective for those gone, active for those
          here.
        </p>
      </header>

      {treeUnavailable ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100/90">
          Apply the family tree migration in Supabase (
          <code className="text-xs">20260522T100000_family_tree.sql</code>) to enable nodes and
          biographies.
        </div>
      ) : peopleLoading || syncPeople.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Growing your tree from circle members…
        </p>
      ) : (
        <>
          <div className="md:hidden">
            <FamilyTreeMobileFocus
              people={people}
              links={links}
              currentUserId={userId}
              selectedPersonId={selectedPersonId}
              onSelectPerson={openPerson}
              fullTreeMode={mobileFullTree}
              onViewFullTree={() => setMobileFullTree((v) => !v)}
            />
            {mobileFullTree ? (
              <div className="mt-4 -mx-4 overflow-hidden rounded-lg border border-border">
                <FamilyTreeCanvas
                  people={people}
                  links={links}
                  selectedPersonId={selectedPersonId}
                  onSelectPerson={openPerson}
                />
              </div>
            ) : null}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <FamilyTreeCanvas
              people={people}
              links={links}
              selectedPersonId={selectedPersonId}
              onSelectPerson={openPerson}
            />
          </div>
        </>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Tap a node to read their biography in fragments ·{" "}
        <Link to="/legacy/record" className="text-primary underline-offset-2 hover:underline">
          Record a memory
        </Link>
      </p>

      <PersonBiographyPanel
        person={selectedPerson}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
    </div>
  );
}
