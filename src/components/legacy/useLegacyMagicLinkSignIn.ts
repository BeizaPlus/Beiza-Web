import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export function useLegacyMagicLinkSignIn(redirectPath = "/legacy/record") {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const signIn = async () => {
    if (!supabase || !email.trim()) return;
    setSending(true);
    const redirectTo = `${window.location.origin}${redirectPath}`;
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

  return { email, setEmail, sending, signIn };
}
