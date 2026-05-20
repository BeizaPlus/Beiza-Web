import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

export function useStripeCheckout() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const startKeeperCheckout = async () => {
    if (!supabase) {
      toast({ title: "Sign in required", description: "Open Legacy Vault and sign in first." });
      return;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      toast({ title: "Sign in required", description: "Create a Legacy account to upgrade." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success_url: `${window.location.origin}/legacy/vault?upgraded=1`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });
      const body = (await res.json()) as { url?: string; error?: string; deferred?: boolean };
      if (res.status === 503 || body.deferred) {
        throw new Error("Keeper billing is coming soon. Contact us to upgrade in the meantime.");
      }
      if (!res.ok || !body.url) {
        throw new Error(body.error ?? "Checkout unavailable.");
      }
      window.location.href = body.url;
    } catch (err) {
      toast({
        title: "Could not start checkout",
        description: err instanceof Error ? err.message : "Try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { startKeeperCheckout, loading };
}
