import { RecordMemoryView } from "@/components/legacy/RecordMemoryView";
import { useMediaQuery } from "@/hooks/use-media-querry";
import { useMyLegacyCircle } from "@/hooks/useLegacy";
import { useFamilyPeople } from "@/hooks/useFamilyTree";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";

/** In-viewport station panel — hero holds sign-in / mic; upload + seal steps below. */
/** Matches `index.css` record rail + welcome snap breakpoint. */
const RECORD_PHONE_MEDIA = "(max-width: 639px)";

export default function LegacyRecordPage() {
  const isPhone = useMediaQuery(RECORD_PHONE_MEDIA);
  const { data: circleCtx, isLoading } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: people = [] } = useFamilyPeople(circle?.id);

  if (isLoading) {
    return (
      <p className="text-center text-sm text-white/60">Loading your Legacy Circle…</p>
    );
  }

  if (!circle) {
    return (
      <p className="text-center text-sm text-white/70">
        Join a Legacy Circle to save recordings — use Invite in the rail, or{" "}
        <a href={BEIZA_LINKS.legacy.family} className="text-primary underline underline-offset-2">
          set up your circle
        </a>
        .
      </p>
    );
  }

  return (
    <RecordMemoryView
      circleId={circle.id}
      circleLabel={circle.name}
      people={people}
      persistViaApi={false}
      treeHref={BEIZA_LINKS.legacy.circle}
      vaultHref={BEIZA_LINKS.legacy.vault}
      belowHero
      viewportCompact={isPhone}
    />
  );
}
