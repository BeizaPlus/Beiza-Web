import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase)
    {
      setError("Supabase is not configured. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setStatus("submitting");
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/admin` } });

    if (signInError)
    {
      setStatus("error");
      setError(signInError.message);
      return;
    }

    setStatus("sent");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Beiza Studio</p>
          <h1 className="text-2xl font-semibold text-white">Manager Access</h1>
          <p className="text-sm text-white/70">
            Sign in with your Beiza manager email to receive a secure one-time link.
          </p>
        </div>

        {status === "sent" ? (
          <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100">
            <p>Magic link sent to {email}.</p>
            <p>Please check your inbox (and spam) to continue.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-xs uppercase tracking-[0.3em] text-white/60">
                Manager email
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <Mail className="h-4 w-4 text-white/40" aria-hidden />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@beiza.tv"
                  className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
                />
              </div>
            </div>

            {error ? <p className="text-xs text-rose-300">{error}</p> : null}

            <Button
              type="submit"
              className="w-full rounded-full bg-white text-black hover:bg-white/90"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending link…
                </span>
              ) : (
                "Send magic link"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignIn;

