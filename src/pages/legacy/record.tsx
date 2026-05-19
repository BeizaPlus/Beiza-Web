import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RecordingButton } from "@/components/legacy/RecordingButton";
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

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const blobRef = useRef<Blob | null>(null);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        blobRef.current = blob;
        setDurationSeconds(Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
        setPhase("upload");
      };
      mediaRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      setPhase("recording");
    } catch {
      toast({
        title: "Microphone access needed",
        description: "Allow microphone access to record a memory.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRef.current?.state === "recording") {
      mediaRef.current.stop();
    }
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

      {phase !== "seal" && (
        <blockquote className="rounded-lg border border-border bg-card px-4 py-6 text-center text-lg leading-relaxed">
          {prompt}
        </blockquote>
      )}

      {phase === "prepare" && (
        <div className="flex flex-col items-center gap-6">
          <RecordingButton active={false} onPressStart={startRecording} onPressEnd={() => {}} />
          <p className="text-sm text-muted-foreground">Hold the button to answer</p>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            disabled={loadingPrompts}
            onClick={() => void loadPrompts()}
          >
            {loadingPrompts ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            New prompt
          </Button>
        </div>
      )}

      {phase === "recording" && (
        <div className="flex flex-col items-center gap-4">
          <RecordingButton active onPressStart={() => {}} onPressEnd={stopRecording} />
          <p className="animate-pulse text-sm text-primary">Listening… release to continue</p>
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
            <h3 className="font-heading text-lg font-semibold text-primary">
              Memory preserved
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep their voice forever. Your family can hear this in the vault.
            </p>
          </div>
          <Button className="w-full" onClick={() => navigate("/legacy/vault")}>
            Open the vault
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setPhase("prepare");
              blobRef.current = null;
              void loadPrompts();
            }}
          >
            Record another memory
          </Button>
        </div>
      )}
    </div>
  );
}
