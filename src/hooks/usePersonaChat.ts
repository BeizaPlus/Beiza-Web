import { useCallback, useState } from "react";
import { getStoredCircleToken } from "@/lib/circleAccess";
import { dispatchBeizaTreeUpdated } from "@/lib/legacy/personaEvents";

export type PersonaChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export function usePersonaChat(circleId: string) {
  const [messages, setMessages] = useState<PersonaChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const token = getStoredCircleToken(circleId);
      if (!token) {
        setError("Session expired — re-enter your access code.");
        return;
      }

      const nextMessages: PersonaChatTurn[] = [
        ...messages,
        { role: "user", content: trimmed },
      ];
      setMessages(nextMessages);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/circle/persona-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            circle_id: circleId,
            messages: nextMessages,
          }),
        });

        const body = (await res.json()) as {
          reply?: string;
          tree_updated?: boolean;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(body.error ?? "Could not reach the tree guide.");
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: body.reply ?? "" },
        ]);

        if (body.tree_updated) {
          dispatchBeizaTreeUpdated(circleId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [circleId, messages],
  );

  return { messages, loading, error, send };
}
