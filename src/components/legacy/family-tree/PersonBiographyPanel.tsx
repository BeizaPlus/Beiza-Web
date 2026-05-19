import { useMemo, useRef, type RefObject } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LegacyPlaybackRow } from "@/components/legacy/LegacyPlaybackRow";
import type { FamilyPerson, PersonBiographyFragment } from "@/lib/legacy/types";
import { personInitials } from "@/lib/legacy/familyTree";
import { usePersonBiography } from "@/hooks/useFamilyTree";
import { Loader2, X } from "lucide-react";

type PersonBiographyPanelProps = {
  person: FamilyPerson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function BiographyContent({
  person,
  fragments,
  isLoading,
  fragmentsRef,
}: {
  person: FamilyPerson;
  fragments: PersonBiographyFragment[];
  isLoading: boolean;
  fragmentsRef: RefObject<HTMLDivElement | null>;
}) {
  const playRef = useRef<HTMLAudioElement | null>(null);

  const goneQuote = useMemo(() => {
    if (person.status !== "gone" || fragments.length === 0) return null;
    return fragments.find((f) => f.link_type === "about") ?? fragments[0];
  }, [person.status, fragments]);

  const voiceByThem = fragments.find((f) => f.link_type === "by");
  const voiceAboutThem = fragments.find((f) => f.link_type === "about");

  const playFirst = () => {
    const list = voiceByThem ? [voiceByThem] : voiceAboutThem ? [voiceAboutThem] : fragments;
    const url = list.find((f) => f.audio_url)?.audio_url;
    if (!url) return;
    playRef.current?.pause();
    playRef.current = new Audio(url);
    void playRef.current.play();
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <p className="text-xl text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {person.display_name}
        </p>
        {person.relation_label ? (
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#555555]">
            {person.relation_label}
          </p>
        ) : null}
      </div>

      {person.status === "gone" && goneQuote ? (
        <blockquote className="border-l-2 border-primary/40 pl-4">
          <p
            className="text-base italic leading-relaxed text-[#cccccc]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            &ldquo;{goneQuote.prompt_text}&rdquo;
          </p>
          <p className="mt-2 text-xs text-[#555555]">— {goneQuote.recorded_by.name}</p>
        </blockquote>
      ) : null}

      {person.status === "gone" ? (
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={() => fragmentsRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            Read their memory
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:opacity-90"
            onClick={playFirst}
          >
            {voiceByThem ? "Hear their voice" : "Hear how they were remembered"}
          </Button>
        </div>
      ) : null}

      {person.status === "invited" ? (
        <p className="text-sm text-muted-foreground">
          Awaiting — share your circle invite so they can join and fill their own node.
        </p>
      ) : null}

      <div ref={fragmentsRef}>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#444444]">
          Their story, in fragments.
        </p>

        {isLoading ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Gathering memories…
          </p>
        ) : fragments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No recordings linked yet. When someone seals a memory about {person.display_name}, it
            appears here.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {fragments.map((fragment) => (
              <li
                key={`${fragment.recording_id}-${fragment.link_type}`}
                className="rounded-lg border border-border bg-card p-3"
              >
                <p className="text-xs italic text-[#555555]">{fragment.prompt_text}</p>
                {fragment.audio_url ? (
                  <div className="mt-2">
                    <LegacyPlaybackRow recordedUri={fragment.audio_url} durationSeconds={0} />
                  </div>
                ) : null}
                <p className="mt-2 text-[10px] text-[#444444]">
                  Recorded by {fragment.recorded_by.name}
                  {fragment.arc_position ? ` · ${fragment.arc_position}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TODO: pass biography fragments to /api/synthesize-biography — Heritage tier */}
    </div>
  );
}

export function PersonBiographyPanel({ person, open, onOpenChange }: PersonBiographyPanelProps) {
  const { data: fragments = [], isLoading } = usePersonBiography(person?.id);
  const fragmentsRef = useRef<HTMLDivElement>(null);

  if (!person) return null;

  return (
    <>
      {open ? (
        <aside className="fixed inset-y-0 right-0 z-50 hidden w-full max-w-md overflow-y-auto border-l border-border bg-[#0a0a0a] p-6 shadow-2xl md:block">
          <button
            type="button"
            className="absolute right-4 top-4 text-muted-foreground hover:text-white"
            onClick={() => onOpenChange(false)}
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mb-4 flex items-center gap-3 pr-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1800] text-xs font-semibold text-primary">
              {personInitials(person.display_name)}
            </span>
          </div>
          <BiographyContent
            person={person}
            fragments={fragments}
            isLoading={isLoading}
            fragmentsRef={fragmentsRef}
          />
        </aside>
      ) : null}

      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] border-border bg-[#0a0a0a] md:hidden">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-lg text-white">{person.display_name}</DrawerTitle>
            <DrawerClose className="absolute right-4 top-4" />
          </DrawerHeader>
          <div className="overflow-y-auto px-4">
            <BiographyContent
              person={person}
              fragments={fragments}
              isLoading={isLoading}
              fragmentsRef={fragmentsRef}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
