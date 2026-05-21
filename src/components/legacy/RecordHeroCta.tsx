import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { RecordingButton } from "@/components/legacy/RecordingButton";
import { useLegacyMagicLinkSignIn } from "@/components/legacy/useLegacyMagicLinkSignIn";
import { useRecordFlowOptional } from "@/components/legacy/recordFlowContext";
import { useLegacySession, useMyLegacyCircle } from "@/hooks/useLegacy";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { cn } from "@/lib/utils";

type RecordHeroCtaProps = {
  textAlign?: "left" | "right";
};

/**
 * Hero CTA slot — sign-in (Heritage-style) then swaps to record controls once authenticated.
 */
export function RecordHeroCta({ textAlign = "left" }: RecordHeroCtaProps) {
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
      <div className={cn("mt-3 space-y-2", alignEnd && "md:ml-auto")}>
        <form
          className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", alignEnd && "sm:justify-end")}
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
            className="h-11 min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-5 text-sm text-white placeholder:text-white/45 backdrop-blur-sm focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 sm:max-w-[var(--record-email-max,17.5rem)]"
          />
          <button
            type="submit"
            disabled={sending}
            className="shrink-0 rounded-full bg-white px-6 py-3 text-[13px] font-medium text-background transition hover:bg-white/90 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Sign in to record →"}
          </button>
        </form>
        <p className={cn("text-[11px] text-subtle", alignEnd && "text-right")}>
          Magic link to your email · no password
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className={cn(
            "text-[11px] text-white/50 underline-offset-2 hover:text-white/80 hover:underline",
            alignEnd && "block text-right w-full",
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

  return (
    <div className={cn("mt-3 space-y-3", alignEnd && "flex flex-col items-end")}>
      {isHold ? (
        <>
          {snapshot?.promptText ? (
            <p
              className={cn(
                "max-w-[420px] text-sm italic leading-relaxed text-white/85",
                alignEnd && "text-right",
              )}
            >
              &ldquo;{snapshot.promptText}&rdquo;
            </p>
          ) : null}
          <div className="[&_p]:text-white/70">
            <RecordingButton
              isRecording={phase === "recording"}
              disabled={snapshot?.isRequestingMic || !flow}
              onPress={startRecording}
              compact
            />
          </div>
          {phase === "recording" && snapshot ? (
            <p className="text-sm tabular-nums text-white/70">{snapshot.elapsedSeconds}s</p>
          ) : (
            <p className={cn("text-[11px] text-subtle", alignEnd && "text-right")}>
              Tap to record · title and vault steps appear here when you finish
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
}
