import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { usePersonaChat } from "@/hooks/usePersonaChat";
import { cn } from "@/lib/utils";

type TreePersonaChatProps = {
  circleId: string;
};

export function TreePersonaChat({ circleId }: TreePersonaChatProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, loading, error, send } = usePersonaChat(circleId);

  const submit = () => {
    if (!draft.trim() || loading) return;
    void send(draft);
    setDraft("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "tree-persona-fab fixed bottom-6 right-6 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-[#E6A817]/40 bg-[#141008] text-[#E6A817] shadow-lg transition hover:border-[#E6A817]",
          open && "border-[#E6A817]",
        )}
        aria-label={open ? "Close tree guide" : "Open tree guide"}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="tree-persona-panel fixed bottom-20 right-6 z-[70] flex h-[min(420px,70vh)] w-[min(360px,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border border-[#1e1e1e] bg-[#111111] shadow-2xl">
          <header className="border-b border-[#1e1e1e] px-4 py-3">
            <p className="font-manrope text-sm font-semibold text-white">Tree guide</p>
            <p className="mt-0.5 font-manrope text-[11px] text-[#666666]">
              Describe your family — I&apos;ll add people and connections, then ask what&apos;s
              next.
            </p>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <p className="font-manrope text-xs leading-relaxed text-[#666666]">
                Try: &ldquo;My father had three brothers — Kofi, Kwame, and Kojo — all
                farmers.&rdquo;
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={cn(
                  "rounded-lg px-3 py-2 font-manrope text-xs leading-relaxed",
                  m.role === "user"
                    ? "ml-6 bg-[#1a1a1a] text-[#cccccc]"
                    : "mr-6 bg-[#141008] text-[#e6e6e6] border border-[#E6A817]/20",
                )}
              >
                {m.content}
              </div>
            ))}
            {loading ? (
              <p className="font-manrope text-[11px] text-[#E6A817]">Updating the tree…</p>
            ) : null}
            {error ? <p className="font-manrope text-[11px] text-red-400">{error}</p> : null}
          </div>

          <div className="flex gap-2 border-t border-[#1e1e1e] p-3">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Tell me about your family…"
              className="min-w-0 flex-1 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 font-manrope text-xs text-white outline-none focus:border-[#E6A817]/50"
              disabled={loading}
            />
            <button
              type="button"
              onClick={submit}
              disabled={loading || !draft.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6A817] text-[#0a0a0a] disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
