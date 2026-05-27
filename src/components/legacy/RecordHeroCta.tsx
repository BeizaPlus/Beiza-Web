import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { RecordingButton } from "@/components/legacy/RecordingButton";
import { useLegacyMagicLinkSignIn } from "@/components/legacy/useLegacyMagicLinkSignIn";
import { useRecordFlowOptional } from "@/components/legacy/recordFlowContext";
import { useQueryClient } from "@tanstack/react-query";
import { useLegacySession, useMyLegacyCircle } from "@/hooks/useLegacy";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { StudioSubsetZone } from "@/components/dev/StudioSubsetZone";
import { useRecordLayoutStudio } from "@/context/RecordLayoutStudioContext";
import {
  loadRecordMemoryStudioFrame,
  recordMemorySubsetStyle,
} from "@/lib/legacy/recordMemoryStudio";
import { cn } from "@/lib/utils";

type RecordHeroCtaProps = {
  textAlign?: "left" | "right";
  /** Wrap mic / prompt block for layout studio click targets */
  studioSubset?: boolean;
};

/**
 * Hero CTA slot — sign-in (Heritage-style) then swaps to record controls once authenticated.
 */
export function RecordHeroCta({ textAlign = "left", studioSubset = false }: RecordHeroCtaProps) {
  const studioCtx = useRecordLayoutStudio();
  const memoryFrame = studioCtx?.memoryFrame ?? loadRecordMemoryStudioFrame();
  const queryClient = useQueryClient();
  const { data: session, isLoading, refetch } = useLegacySession();
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { email, setEmail, sending, signIn } = useLegacyMagicLinkSignIn("/legacy/record");
  const flow = useRecordFlowOptional();
  const snapshot = flow?.snapshot;
  const alignEnd = textAlign === "right";

  const startRecording = () => {
    flow?.requestStart();
  };

  if (isLoading) {
    return (
      <div className={cn("mt-3 flex items-center gap-2 text-sm text-white/70", alignEnd && "justify-end")}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>Loading your circle…</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className={cn(
          "mt-3 w-full min-w-0 space-y-2.5",
          "max-[1199px]:mx-auto max-[1199px]:max-w-[var(--record-column-max,22rem)]",
          alignEnd && "min-[1200px]:ml-auto",
        )}
      >
        <form
          className={cn(
            "flex w-full min-w-0 flex-col gap-3",
            "min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:gap-3",
            alignEnd && "min-[1200px]:justify-end",
          )}
          onSubmit={(e) => {
            e.preventDefault();
            void signIn();
          }}
        >
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@family.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "h-12 w-full min-w-0 rounded-full border border-white/25 bg-white/10 px-6 text-base text-white placeholder:text-white/45 backdrop-blur-sm",
              "focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/30",
              "min-[1280px]:h-11 min-[1280px]:max-w-[min(var(--record-email-max,17.5rem),calc(100%-12.5rem))] min-[1280px]:flex-1 min-[1280px]:px-5 min-[1280px]:text-sm",
            )}
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full shrink-0 whitespace-nowrap rounded-full bg-white px-6 py-3.5 text-sm font-medium text-background transition hover:bg-white/90 disabled:opacity-60 min-[1280px]:w-auto min-[1280px]:py-3 min-[1280px]:text-[13px]"
          >
            {sending ? "Sending…" : "Sign in to record →"}
          </button>
        </form>
        <p
          className={cn(
            "text-[11px] text-subtle",
            "max-[1199px]:text-center",
            alignEnd && "min-[1200px]:text-right",
          )}
        >
          Magic link to your email · no password
        </p>
        <button
          type="button"
          onClick={() => {
            void refetch().then(() => {
              void queryClient.invalidateQueries({ queryKey: ["legacy"] });
            });
          }}
          className={cn(
            "text-[11px] text-white/50 underline-offset-2 hover:text-white/80 hover:underline",
            "max-[1199px]:mx-auto max-[1199px]:block",
            alignEnd && "min-[1200px]:block min-[1200px]:w-full min-[1200px]:text-right",
          )}
        >
          I already signed in
        </button>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className={cn("mt-3 space-y-2", alignEnd && "text-right")}>
        <p className="text-sm text-white/80">Join a Legacy Circle before you record.</p>
        <Link
          to={BEIZA_LINKS.legacy.family}
          className="inline-block rounded-full bg-white px-6 py-3 text-[13px] font-medium text-background transition hover:bg-white/90"
        >
          Set up your circle →
        </Link>
      </div>
    );
  }

  const phase = snapshot?.phase ?? "prepare";
  const isHold = phase === "prepare" || phase === "recording";

  const body = (
    <div className={cn("mt-3 space-y-3", alignEnd && "flex flex-col items-end")}>
      {isHold ? (
        <>
          {snapshot?.promptText ? (
            <p
              className={cn(
                "w-full max-w-[min(100%,28rem)] font-bold italic leading-[1.2] tracking-[-0.02em] text-white",
                "text-[clamp(1.375rem,6vw,2.375rem)]",
                "px-6 text-center [text-shadow:0_2px_20px_rgba(0,0,0,0.9)]",
                alignEnd && "min-[1200px]:text-right",
              )}
            >
              &ldquo;{snapshot.promptText}&rdquo;
            </p>
          ) : null}
          <div className="[&_p]:text-white/70">
            <RecordingButton
              isRecording={phase === "recording"}
              disabled={snapshot?.isRequestingMic || !flow?.bridgeReady}
              onPress={startRecording}
              compact
              hideCaption
            />
          </div>
          {phase === "recording" && snapshot ? (
            <p className="text-sm tabular-nums text-white/70">{snapshot.elapsedSeconds}s</p>
          ) : (
            <p className={cn("text-[11px] text-subtle", alignEnd && "text-right")}>
              Tap to record
            </p>
          )}
        </>
      ) : !flow ? null : (
        <p className={cn("text-[11px] text-subtle", alignEnd && "text-right")}>
          Finish sealing below, or record again from the mic.
        </p>
      )}
    </div>
  );

  if (!studioSubset) return body;

  return (
    <StudioSubsetZone
      target="record-cta"
      label="Mic & prompt"
      className="w-full max-w-full"
      style={recordMemorySubsetStyle(memoryFrame, "cta")}
    >
      {body}
    </StudioSubsetZone>
  );
}
