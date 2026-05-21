import { useCallback, useEffect, useRef, useState } from "react";
import { useRecordFlowOptional } from "@/components/legacy/recordFlowContext";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { RecordingButton } from "@/components/legacy/RecordingButton";
import { LegacyPlaybackRow } from "@/components/legacy/LegacyPlaybackRow";
import { LegacyRecordPrompt } from "@/components/legacy/LegacyRecordPrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchLegacyPrompts } from "@/hooks/useLegacy";
import { MemoryAboutPicker } from "@/components/legacy/family-tree/MemoryAboutPicker";
import type { FamilyPerson, MemoryAboutChoice, RecordPhase } from "@/lib/legacy/types";
import { FREE_VAULT_STORAGE_BYTES, getAudioDurationFromBlob } from "@/lib/legacy/audioRecording";
import { saveRecordedMemory } from "@/lib/legacy/recordMemory";
import { dispatchBeizaTreeUpdated } from "@/lib/legacy/personaEvents";
import {
  pickRandomStoryPrompt,
  resolveStoryPrompt,
  type StoryPrompt,
} from "@/lib/prompts";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MIN_RECORD_SECONDS = 0;

function pickAudioMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export type RecordMemoryViewProps = {
  circleId: string;
  circleLabel?: string;
  people: FamilyPerson[];
  /** true → POST /api/circle/record-memory (bearer). false → uploadLegacyRecording (Supabase auth). */
  persistViaApi: boolean;
  treeHref: string;
  vaultHref?: string;
  /** Hero above — hide duplicate page title */
  belowHero?: boolean;
  /** Single viewport layout — compact panels, no duplicate prompt */
  viewportCompact?: boolean;
};

export function RecordMemoryView({
  circleId,
  circleLabel,
  people,
  persistViaApi,
  treeHref,
  vaultHref,
  belowHero = false,
  viewportCompact = false,
}: RecordMemoryViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [memoryAbout, setMemoryAbout] = useState<MemoryAboutChoice | null>(null);
  const [createdPlaceholderName, setCreatedPlaceholderName] = useState<string | null>(null);

  const [phase, setPhase] = useState<RecordPhase>("prepare");
  const [prompt, setPrompt] = useState<StoryPrompt>(() => pickRandomStoryPrompt());
  const [title, setTitle] = useState("");
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRequestingMic, setIsRequestingMic] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");
  const startedAtRef = useRef<number>(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const blobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearTimer();
      if (mediaRef.current?.state === "recording") {
        mediaRef.current.stop();
      }
      releaseStream();
      if (recordedUri) URL.revokeObjectURL(recordedUri);
    };
  }, [recordedUri]);

  const loadPrompts = useCallback(async () => {
    setLoadingPrompts(true);
    try {
      const prompts = await fetchLegacyPrompts({ circleId });
      if (prompts[0]) setPrompt(resolveStoryPrompt(prompts[0]));
      else setPrompt(pickRandomStoryPrompt());
    } catch {
      setPrompt(pickRandomStoryPrompt());
    } finally {
      setLoadingPrompts(false);
    }
  }, [circleId]);

  useEffect(() => {
    void loadPrompts();
  }, [loadPrompts]);

  const finishRecording = () => {
    clearTimer();
    const recorder = mediaRef.current;
    if (!recorder || recorder.state !== "recording") return;
    try {
      recorder.requestData();
    } catch {
      /* optional */
    }
    recorder.stop();
  };

  const startRecording = async () => {
    if (isRequestingMic || phase === "recording" || phase === "upload") return;
    setIsRequestingMic(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickAudioMimeType();
      mimeTypeRef.current = mimeType ?? "audio/webm";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        void (async () => {
          clearTimer();
          releaseStream();
          mediaRef.current = null;
          setIsRequestingMic(false);

          const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
          if (blob.size === 0) {
            setPhase("prepare");
            setElapsedSeconds(0);
            toast({
              title: "Nothing captured",
              description: "Record a little longer and try again.",
              variant: "destructive",
            });
            return;
          }

          let seconds: number;
          try {
            seconds = await getAudioDurationFromBlob(blob);
          } catch {
            seconds = Math.max(
              MIN_RECORD_SECONDS,
              Math.ceil((Date.now() - startedAtRef.current) / 1000),
            );
          }

          blobRef.current = blob;
          setDurationSeconds(seconds);
          setElapsedSeconds(seconds);
          setRecordedUri((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          setPhase("upload");
        })();
      };

      mediaRef.current = recorder;
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
      recorder.start();
      setPhase("recording");
      setIsRequestingMic(false);

      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 200);
    } catch {
      setIsRequestingMic(false);
      releaseStream();
      setPhase("prepare");
      toast({
        title: "Microphone access needed",
        description: "Allow microphone access to record a memory.",
        variant: "destructive",
      });
    }
  };

  const handleRecordTap = () => {
    if (phase === "recording") {
      finishRecording();
      return;
    }
    void startRecording();
  };

  const recordFlow = useRecordFlowOptional();

  useEffect(() => {
    if (!belowHero || !recordFlow) return;
    recordFlow.registerBridge({
      getSnapshot: () => ({
        phase,
        isRequestingMic,
        elapsedSeconds,
        promptText: prompt.text,
      }),
      handleRecordTap,
    });
    return () => recordFlow.registerBridge(null);
  }, [
    belowHero,
    recordFlow,
    phase,
    isRequestingMic,
    elapsedSeconds,
    prompt.text,
    handleRecordTap,
  ]);

  useEffect(() => {
    if (belowHero && recordFlow) recordFlow.syncSnapshot();
  }, [belowHero, recordFlow, phase, isRequestingMic, elapsedSeconds, prompt.text]);

  const resetForAnother = () => {
    blobRef.current = null;
    if (recordedUri) URL.revokeObjectURL(recordedUri);
    setRecordedUri(null);
    setDurationSeconds(0);
    setElapsedSeconds(0);
    setTitle("");
    setMemoryAbout(null);
    setCreatedPlaceholderName(null);
    setPhase("prepare");
    setIsRequestingMic(false);
    void loadPrompts();
  };

  const handleUpload = async () => {
    if (!blobRef.current) return;
    if (!memoryAbout) {
      toast({
        title: "Who is this memory about?",
        description: "Choose a person so this fragment can join their biography on the tree.",
        variant: "destructive",
      });
      return;
    }

    if (blobRef.current.size > FREE_VAULT_STORAGE_BYTES) {
      toast({
        title: "Vault storage full",
        description:
          "This recording exceeds your Circle vault limit (5 GB). Free space or upgrade to Keeper.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await saveRecordedMemory({
        circleId,
        persistViaApi,
        prompt,
        blob: blobRef.current,
        durationSeconds,
        title: title || undefined,
        memoryAbout,
      });
      if (memoryAbout.type === "new") {
        setCreatedPlaceholderName(memoryAbout.name);
      }
      if (persistViaApi) {
        dispatchBeizaTreeUpdated(circleId);
      } else {
        void queryClient.invalidateQueries({ queryKey: ["legacy"] });
      }
      setPhase("seal");
    } catch (err) {
      toast({
        title: "Could not save memory",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const isHoldPhase = phase === "prepare" || phase === "recording";

  const compact = belowHero || viewportCompact;

  return (
    <div
      className={cn(
        compact ? "record-memory-viewport flex min-h-0 flex-col gap-2 overflow-y-auto" : "space-y-8",
      )}
    >
      {!compact ? (
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {phase === "prepare" && "Prepare"}
            {phase === "recording" && "Recording"}
            {phase === "upload" && "Upload"}
            {phase === "seal" && "Sealed"}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Record a memory</h2>
          {circleLabel ? (
            <p className="mt-1 font-manrope text-xs text-[#666666]">{circleLabel}</p>
          ) : null}
        </div>
      ) : null}

      {phase !== "seal" && !compact ? <LegacyRecordPrompt prompt={prompt.text} /> : null}

      {phase === "upload" && recordedUri ? (
        <LegacyPlaybackRow recordedUri={recordedUri} durationSeconds={durationSeconds} />
      ) : null}

      {isHoldPhase && !compact ? (
        <div className="flex flex-col items-center gap-4">
          <RecordingButton
            isRecording={phase === "recording"}
            disabled={isRequestingMic}
            onPress={handleRecordTap}
          />
          {phase === "recording" ? (
            <p className="text-sm tabular-nums text-[#666666]">{elapsedSeconds}s</p>
          ) : null}
          {phase === "prepare" ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-[#888888]"
              disabled={loadingPrompts || isRequestingMic}
              onClick={() => setPrompt(pickRandomStoryPrompt(prompt.id))}
            >
              {loadingPrompts ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              New prompt
            </Button>
          ) : null}
        </div>
      ) : null}

      {compact && phase === "prepare" ? (
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 gap-1.5 text-[11px] text-white/60 hover:text-white", "self-end")}
          disabled={loadingPrompts || isRequestingMic}
          onClick={() => setPrompt(pickRandomStoryPrompt(prompt.id))}
        >
          {loadingPrompts ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          New prompt
        </Button>
      ) : null}

      {phase === "upload" && (
        <div className={cn(compact ? "space-y-2 rounded-xl border border-white/15 bg-black/50 p-3 backdrop-blur-sm" : "space-y-4")}>
          <p className={cn("text-[#666666]", compact ? "text-xs text-white/70" : "text-center text-sm")}>
            {durationSeconds}s captured — ready to preserve
          </p>
          <Input
            placeholder="Give this memory a title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-[#2a2a2a] bg-[#111111] text-white"
          />
          <MemoryAboutPicker people={people} value={memoryAbout} onChange={setMemoryAbout} />
          <Button
            className="w-full bg-[#E6A817] text-[#0a0a0a] hover:bg-[#E6A817]/90"
            disabled={uploading || !memoryAbout}
            onClick={() => void handleUpload()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Seal this memory"}
          </Button>
        </div>
      )}

      {phase === "seal" && (
        <div className={cn(compact ? "space-y-2 text-center" : "space-y-6 text-center")}>
          <div
            className={cn(
              "rounded-xl border border-[#E6A817]/40 bg-[#1e1800]/50",
              compact ? "p-3" : "p-6",
            )}
          >
            <h3 className="text-lg font-semibold text-[#E6A817]">Memory preserved</h3>
            <p className="mt-2 text-sm text-[#666666]">
              Keep their voice forever. This fragment is now part of their tree biography.
            </p>
            {createdPlaceholderName ? (
              <p className="mt-3 text-xs text-[#E6A817]">
                {createdPlaceholderName} was added to your family tree — invite them when you are
                ready.
              </p>
            ) : null}
          </div>
          <Button className="w-full" onClick={() => navigate(treeHref)}>
            View family tree
          </Button>
          {vaultHref ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate(vaultHref)}
            >
              Open the vault
            </Button>
          ) : null}
          <Button variant="ghost" className="w-full text-[#888888]" onClick={resetForAnother}>
            Record another memory
          </Button>
        </div>
      )}
    </div>
  );
}
