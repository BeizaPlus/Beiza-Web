import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob | null) => void;
  disabled?: boolean;
}

export const AudioRecorder = ({ onRecordingComplete, disabled = false }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Waveform refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const requestAnimationFrameRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording")
      {
        mediaRecorderRef.current.stop();
      }
      if (requestAnimationFrameRef.current)
      {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed")
      {
        audioContextRef.current.close().catch(() => { });
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try
    {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up Web Audio API for waveform
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 2048;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0)
        {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });

        // Size validation (5MB max)
        if (audioBlob.size > 5 * 1024 * 1024)
        {
          alert("Recording is too large (max 5MB). Please keep it under 3 minutes.");
          handleDelete();
          return;
        }

        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error)
    {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording")
    {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (requestAnimationFrameRef.current) cancelAnimationFrame(requestAnimationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed")
      {
        audioContextRef.current.close().catch(() => { });
      }
    }
  };

  const handleDelete = () => {
    if (audioUrl)
    {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    onRecordingComplete(null);
    if (audioElementRef.current)
    {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;

    if (isPlaying)
    {
      audioElementRef.current.pause();
    } else
    {
      audioElementRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isRecording && canvasRef.current && analyserRef.current)
    {
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        requestAnimationFrameRef.current = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgba(239, 68, 68, 0.8)"; // red-500
        canvasCtx.lineCap = "round";

        canvasCtx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++)
        {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0)
          {
            canvasCtx.moveTo(x, y);
          } else
          {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      };

      draw();
    }

    return () => {
      if (requestAnimationFrameRef.current)
      {
        cancelAnimationFrame(requestAnimationFrameRef.current);
      }
    };
  }, [isRecording]);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      {/* Hidden Audio Element for Playback */}
      {audioUrl && (
        <audio
          ref={audioElementRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {!audioUrl && !isRecording && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-subtle">
            Add a voice note (Optional)
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            disabled={disabled}
            className="border-white/20 hover:bg-white/10 text-white"
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 overflow-hidden min-w-0">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-sm font-medium text-red-500 w-10 flex-shrink-0">
              {formatTime(recordingTime)}
            </span>
            <div className="flex-1 px-4 h-8 flex items-center justify-center overflow-hidden min-w-0">
              <canvas ref={canvasRef} width={200} height={32} className="w-full h-full" />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopRecording}
            className="border-red-500/50 text-red-500 hover:bg-red-500/10 flex-shrink-0 ml-2"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePlayback}
              disabled={disabled}
              className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20 flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white ml-0.5" />
              )}
            </Button>
            <span className="text-sm text-white font-medium">
              Audio recorded ({formatTime(recordingTime)})
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={disabled}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 px-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete recording</span>
          </Button>
        </div>
      )}

      {/* Maximum length note */}
      {!audioUrl && !isRecording && (
        <p className="text-xs text-subtle mt-2 opacity-70">
          Safari, Chrome, and Firefox supported.
        </p>
      )}
    </div>
  );
};
