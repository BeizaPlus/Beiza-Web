import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { verifyManagerAccess } from "@/lib/verifyManagerAccess";

export const useSupabaseSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!supabase)
    {
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasAuthHash = hashParams.has("access_token") || hashParams.has("error");

      const { data, error } = await supabase.auth.getSession();

      if (error)
      {
        console.error("[supabase] Failed to load session", error);
      }

      if (hasAuthHash && window.location.hash)
      {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", cleanUrl);
      }

      if (data.session?.user)
      {
        const hasAccess = verifyManagerAccess(data.session.user);
        if (!hasAccess)
        {
          console.warn("[auth] User missing manager_status claim, signing out");
          await supabase.auth.signOut();
          setSession(null);
        } else
        {
          setSession(data.session);
        }
      } else
      {
        setSession(data.session);
      }
      setLoading(false);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user)
      {
        const hasAccess = verifyManagerAccess(newSession.user);
        if (!hasAccess)
        {
          console.warn("[auth] User missing manager_status claim, signing out");
          await supabase.auth.signOut();
          setSession(null);
          setLoading(false);
          return;
        }

        setSession(newSession);

        if (event === "SIGNED_IN")
        {
          if (window.location.hash)
          {
            const cleanUrl = window.location.pathname + window.location.search;
            window.history.replaceState(null, "", cleanUrl);
          }

          if (!location.pathname.startsWith("/admin"))
          {
            navigate("/admin", { replace: true });
          }
        }
      } else
      {
        setSession(newSession);
      }

      setLoading(false);
    });

    const handleAuthError = async () => {
      console.warn("[auth] Caught global AUTH_ERROR_EVENT. Forcing sign out.");
      await supabase.auth.signOut();
      setSession(null);
      setLoading(false);
    };

    window.addEventListener("supabase-unauthorized", handleAuthError);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("supabase-unauthorized", handleAuthError);
    };
  }, [navigate, location]);

  return { session, loading };
};

