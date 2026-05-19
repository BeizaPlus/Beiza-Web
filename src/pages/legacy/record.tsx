import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RecordingButton } from "@/components/legacy/RecordingButton";
import { LegacyPlaybackRow } from "@/components/legacy/LegacyPlaybackRow";
import { LegacyRecordPrompt } from "@/components/legacy/LegacyRecordPrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchLegacyPrompts,
  uploadLegacyRecording,
  useMyLegacyCircle,
} from "@/hooks/useLegacy";
import type { RecordPhase } from "@/lib/legacy/types";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FALLBACK_PROMPTS = [
  "What is your earliest memory of your mother's cooking?",
  "Describe the house you grew up in — what did it smell like?",
  "Who taught you the most important thing you know?",
];

const RECORD_TIMESLICE_MS = 250;
const MIN_RECORD_SECONDS = 1;

function pickAudioMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export default function LegacyRecordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;

  const [phase, setPhase] = useState<RecordPhase>("prepare");
  const [prompt, setPrompt] = useState(FALLBACK_PROMPTS[0]);
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
  const stopOnReadyRef = useRef(false);
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
    if (!circle?.id) return;
    setLoadingPrompts(true);
    try {
      const prompts = await fetchLegacyPrompts({ circleId: circle.id });
      if (prompts[0]) setPrompt(prompts[0]);
    } catch {
      setPrompt(FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)]);
    } finally {
      setLoadingPrompts(false);
    }
  }, [circle?.id]);

  useEffect(() => {
    void loadPrompts();
  }, [loadPrompts]);

  const finishRecording = () => {
    clearTimer();
    const recorder = mediaRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.stop();
  };

  const startRecording = async () => {
    if (isRequestingMic || phase === "recording" || phase === "upload") return;
    setIsRequestingMic(true);
    stopOnReadyRef.current = false;

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
            description: "Hold the button a little longer and try again.",
            variant: "destructive",
          });
          return;
        }

        blobRef.current = blob;
        const seconds = Math.max(
          MIN_RECORD_SECONDS,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        setDurationSeconds(seconds);
        setElapsedSeconds(seconds);
        setRecordedUri((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        setPhase("upload");
      };

      mediaRef.current = recorder;
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
      recorder.start(RECORD_TIMESLICE_MS);
      setPhase("recording");
      setIsRequestingMic(false);

      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 200);

      if (stopOnReadyRef.current) {
        finishRecording();
      }
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

  const handlePressEnd = () => {
    if (isRequestingMic || mediaRef.current?.state !== "recording") {
      stopOnReadyRef.current = true;
      return;
    }
    finishRecording();
  };

  const resetForAnother = () => {
    blobRef.current = null;
    if (recordedUri) URL.revokeObjectURL(recordedUri);
    setRecordedUri(null);
    setDurationSeconds(0);
    setElapsedSeconds(0);
    setTitle("");
    setPhase("prepare");
    stopOnReadyRef.current = false;
    setIsRequestingMic(false);
    void loadPrompts();
  };

  const handleUpload = async () => {
    if (!circle?.id || !blobRef.current) return;
    setUploading(true);
    try {
      await uploadLegacyRecording({
        circleId: circle.id,
        prompt,
        blob: blobRef.current,
        durationSeconds,
        title: title || undefined,
      });
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
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {phase === "prepare" && "Prepare"}
          {phase === "recording" && "Recording"}
          {phase === "upload" && "Upload"}
          {phase === "seal" && "Sealed"}
        </p>
        <h2 className="mt-2 font-heading text-xl font-semibold">Record a memory</h2>
      </div>

      {phase !== "seal" && <LegacyRecordPrompt prompt={prompt} />}

      {phase === "upload" && recordedUri ? (
        <LegacyPlaybackRow recordedUri={recordedUri} durationSeconds={durationSeconds} />
      ) : null}

      {isHoldPhase && (
        <div className="flex flex-col items-center gap-4">
          <RecordingButton
            active={phase === "recording"}
            disabled={isRequestingMic}
            onPressStart={() => void startRecording()}
            onPressEnd={handlePressEnd}
          />
          <p className="text-sm text-muted-foreground">
            {phase === "recording"
              ? `Listening… ${elapsedSeconds}s — release when finished`
              : isRequestingMic
                ? "Starting microphone…"
                : "Hold the button to answer"}
          </p>
          {phase === "prepare" ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              disabled={loadingPrompts || isRequestingMic}
              onClick={() => void loadPrompts()}
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
      )}

      {phase === "upload" && (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {durationSeconds}s captured — ready to preserve
          </p>
          <Input
            placeholder="Give this memory a title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button className="w-full" disabled={uploading} onClick={() => void handleUpload()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Seal this memory"}
          </Button>
        </div>
      )}

      {phase === "seal" && (
        <div className="space-y-6 text-center">
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-6">
            <h3 className="font-heading text-lg font-semibold text-primary">Memory preserved</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep their voice forever. Your family can hear this in the vault.
            </p>
          </div>
          <Button className="w-full" onClick={() => navigate("/legacy/vault")}>
            Open the vault
          </Button>
          <Button variant="secondary" className="w-full" onClick={resetForAnother}>
            Record another memory
          </Button>
        </div>
      )}
    </div>
  );
}
