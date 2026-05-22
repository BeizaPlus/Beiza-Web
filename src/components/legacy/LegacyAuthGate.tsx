import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLegacySession } from "@/hooks/useLegacy";
import { isLayoutStudioEnabled } from "@/lib/layoutStudio";
import { useToast } from "@/hooks/use-toast";

export function LegacyAuthGate({ children }: { children: React.ReactNode }) {
  const studioOn = isLayoutStudioEnabled();
  const queryClient = useQueryClient();
  const { data: session, isLoading, refetch } = useLegacySession();
  const { toast } = useToast();

  if (studioOn) {
    return <>{children}</>;
  }
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  const signIn = async () => {
    if (!supabase || !email.trim()) return;
    setSending(true);
    const redirectTo = `${window.location.origin}/legacy`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setSending(false);
    if (error) {
      toast({ title: "Sign-in failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Check your email",
      description: "We sent a magic link to open your Legacy Circle.",
    });
  };

  return (
    <div className="w-full space-y-4 rounded-xl border border-border bg-card p-6 text-center sm:p-8">
      <h2 className="text-lg font-semibold">Sign in to your Legacy Circle</h2>
      <p className="text-sm text-muted-foreground">
        Use your email — we&apos;ll send a secure link. Keep their voice forever.
      </p>
      <Input
        type="email"
        placeholder="you@family.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button className="w-full" disabled={sending} onClick={() => void signIn()}>
        {sending ? "Sending…" : "Send magic link"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          void refetch().then(() => {
            void queryClient.invalidateQueries({ queryKey: ["legacy"] });
          });
        }}
      >
        I already signed in
      </Button>
    </div>
  );
}