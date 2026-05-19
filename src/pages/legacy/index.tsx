import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StorageMeter } from "@/components/legacy/StorageMeter";
import { Button } from "@/components/ui/button";
import { useLegacyRecordings, useMyLegacyCircle } from "@/hooks/useLegacy";
import { useFamilyPeople, useRecordingPersonLinks } from "@/hooks/useFamilyTree";
import { FamilyTreeMobileFocus } from "@/components/legacy/family-tree/FamilyTreeMobileFocus";
import { Mic, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LegacyHomePage() {
  const navigate = useNavigate();
  const { data: circleCtx, isLoading } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const member = circleCtx?.member;
  const { data: recordings = [] } = useLegacyRecordings(circle?.id);
  const { data: people = [] } = useFamilyPeople(circle?.id);
  const { data: links = [] } = useRecordingPersonLinks(circle?.id);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    void supabase?.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const usedSeconds = recordings.reduce((sum, r) => sum + (r.duration_seconds ?? 0), 0);
  const firstName = member?.display_name?.split(" ")[0] ?? "friend";

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading your Legacy Circle…</p>;
  }

  if (!circle) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Start Your Legacy Circle</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Preserve voices, stories, and wisdom for the people you love.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/legacy/family">Create or join your Legacy Circle</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6">
        <p className="text-sm text-muted-foreground">Your Legacy Circle</p>
        <h2 className="mt-1 text-2xl font-semibold">{circle.name}</h2>
        <p className="mt-3 text-sm leading-relaxed text-subtle">
          Hello, {firstName}. Your family&apos;s stories live here — warm, specific, and yours
          to keep.
        </p>
        {member?.role === "keeper" && (
          <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Legacy Keeper
          </span>
        )}
      </section>

      <StorageMeter usedSeconds={usedSeconds} />

      {people.length > 0 ? (
        <section className="rounded-xl border border-border bg-[#0a0a0a] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white">Your family tree</p>
            <Link to="/legacy/circle" className="text-xs text-primary hover:underline">
              Open full tree
            </Link>
          </div>
          <FamilyTreeMobileFocus
            people={people}
            links={links}
            currentUserId={userId}
            selectedPersonId={null}
            onSelectPerson={() => navigate("/legacy/circle")}
            fullTreeMode={false}
            onViewFullTree={() => navigate("/legacy/circle")}
          />
        </section>
      ) : null}

      <div className="grid gap-3">
        <Button asChild size="lg" className="h-14 w-full gap-2 text-base">
          <Link to="/legacy/record">
            <Mic className="h-5 w-5" />
            Record a memory
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="h-12 w-full gap-2">
          <Link to="/legacy/circle">
            <Users className="h-5 w-5" />
            Family tree
          </Link>
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {recordings.length} {recordings.length === 1 ? "memory" : "memories"} in your vault
      </p>

      <p className="text-center text-[13px] text-[#555555]">
        Lost someone and need to recover their recordings?{" "}
        <Link to="/recover" className="text-primary hover:underline">
          Recover a voice →
        </Link>
      </p>
    </div>
  );
}