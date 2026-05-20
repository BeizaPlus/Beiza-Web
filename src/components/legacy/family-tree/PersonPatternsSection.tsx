import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { fetchHealthPatterns } from "@/lib/legacy/personHealthApi";
import type { HealthPatternInsight } from "@/lib/legacy/types";
import { cn } from "@/lib/utils";

type PersonPatternsSectionProps = {
  circleId: string;
  memberCountWithHealth?: number;
};

export function PersonPatternsSection({ circleId }: PersonPatternsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<HealthPatternInsight[]>([]);

  useEffect(() => {
    setLoading(true);
    void fetchHealthPatterns(circleId)
      .then((data) => {
        setUnlocked(data.unlocked);
        setMessage(data.message ?? null);
        setPatterns(data.patterns ?? []);
      })
      .catch(() => {
        setUnlocked(false);
        setMessage("Pattern analysis is unavailable right now.");
      })
      .finally(() => setLoading(false));
  }, [circleId]);

  if (loading) {
    return (
      <p className="flex items-center gap-2 font-manrope text-[13px] text-[#444444]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Analyzing family patterns…
      </p>
    );
  }

  if (!unlocked) {
    return (
      <div className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-4">
        <p className="flex items-center gap-2 font-manrope text-[13px] text-[#888888]">
          <Sparkles className="h-4 w-4 text-[#E6A817]" aria-hidden />
          Patterns locked
        </p>
        <p className="mt-2 font-manrope text-[12px] leading-relaxed text-[#555555]">
          {message ??
            "Add health notes for at least 3 family members on the Health tab to unlock cross-generation insights."}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {patterns.map((p) => (
        <li
          key={p.title}
          className={cn(
            "rounded-lg border p-4",
            p.severity === "watch"
              ? "border-[#E6A817]/30 bg-[#1e1800]/40"
              : "border-[#1e1e1e] bg-[#111111]",
          )}
        >
          <p className="font-manrope text-[13px] font-medium text-white">{p.title}</p>
          <p className="mt-1 font-manrope text-[12px] leading-relaxed text-[#888888]">{p.body}</p>
        </li>
      ))}
      {patterns.length === 0 ? (
        <p className="font-manrope text-[13px] text-[#555555]">
          No recurring patterns yet — keep adding health notes as weekly questions arrive.
        </p>
      ) : null}
    </ul>
  );
}
