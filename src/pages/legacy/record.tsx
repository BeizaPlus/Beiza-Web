import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
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
import { useFamilyPeople } from "@/hooks/useFamilyTree";
import { MemoryAboutPicker } from "@/components/legacy/family-tree/MemoryAboutPicker";
import type { MemoryAboutChoice } from "@/lib/legacy/types";
import type { RecordPhase } from "@/lib/legacy/types";
import { FREE_VAULT_STORAGE_BYTES, getAudioDurationFromBlob } from "@/lib/legacy/audioRecording";
import {
  pickRandomStoryPrompt,
  resolveStoryPrompt,
  type StoryPrompt,
} from "@/lib/prompts";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/** No max duration for Circle (free) — storage quota is the only gate on save. */
const MIN_RECORD_SECONDS = 0;

function pickAudioMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export default function LegacyRecordPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: circleCtx } = useMyLegacyCircle();
  const circle = circleCtx?.circle;
  const { data: people = [] } = useFamilyPeople(circle?.id);
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
    if (!circle?.id) return;
    setLoadingPrompts(true);
    try {
      const prompts = await fetchLegacyPrompts({ circleId: circle.id });
      if (prompts[0]) setPrompt(resolveStoryPrompt(prompts[0]));
      else setPrompt(pickRandomStoryPrompt());
    } catch {
      setPrompt(pickRandomStoryPrompt());
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
    try {
      recorder.requestData();
    } catch {
      /* optional before stop — not all browsers need it */
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
    if (!circle?.id || !blobRef.current) return;
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
      await uploadLegacyRecording({
        circleId: circle.id,
        prompt,
        blob: blobRef.current,
        durationSeconds,
        title: title || undefined,
        memoryAbout,
      });
      if (memoryAbout.type === "new") {
        setCreatedPlaceholderName(memoryAbout.name);
      }
      void queryClient.invalidateQueries({ queryKey: ["legacy"] });
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
        <h2 className="mt-2 text-xl font-semibold">Record a memory</h2>
      </div>

      {phase !== "seal" && <LegacyRecordPrompt prompt={prompt.text} />}

      {phase === "upload" && recordedUri ? (
        <LegacyPlaybackRow recordedUri={recordedUri} durationSeconds={durationSeconds} />
      ) : null}

      {isHoldPhase && (
        <div className="flex flex-col items-center gap-4">
          <RecordingButton
            isRecording={phase === "recording"}
            disabled={isRequestingMic}
            onPress={handleRecordTap}
          />
          {phase === "recording" ? (
            <p className="text-sm tabular-nums text-muted-foreground">{elapsedSeconds}s</p>
          ) : null}
          {phase === "prepare" ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
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
          <MemoryAboutPicker people={people} value={memoryAbout} onChange={setMemoryAbout} />
          <Button
            className="w-full"
            disabled={uploading || !memoryAbout}
            onClick={() => void handleUpload()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Seal this memory"}
          </Button>
        </div>
      )}

      {phase === "seal" && (
        <div className="space-y-6 text-center">
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-6">
            <h3 className="text-lg font-semibold text-primary">Memory preserved</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep their voice forever. This fragment is now part of their tree biography.
            </p>
            {createdPlaceholderName ? (
              <p className="mt-3 text-xs text-primary">
                {createdPlaceholderName} was added to your family tree — invite them when you are
                ready.
              </p>
            ) : null}
          </div>
          <Button className="w-full" onClick={() => navigate("/legacy/circle")}>
            View family tree
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate("/legacy/vault")}>
            Open the vault
          </Button>
          <Button variant="ghost" className="w-full" onClick={resetForAnother}>
            Record another memory
          </Button>
        </div>
      )}
    </div>
  );
}