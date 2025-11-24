import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { ensureManagerProfile } from "@/lib/ensureManagerProfile";
import { verifyManagerAccess } from "@/lib/verifyManagerAccess";

export const useSupabaseSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      // Supabase client with detectSessionInUrl will automatically process hash fragments
      // But we should clean up the URL hash after processing
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasAuthHash = hashParams.has("access_token") || hashParams.has("error");

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("[supabase] Failed to load session", error);
      }

      // Clean up URL hash after session is loaded
      if (hasAuthHash && window.location.hash) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", cleanUrl);
      }

      // Verify user has manager access before setting session
      if (data.session?.user) {
        const hasAccess = await verifyManagerAccess(data.session.user);
        if (!hasAccess) {
          // User authenticated but not authorized - sign them out
          console.warn("[auth] User authenticated but not in manager_profiles, signing out");
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(data.session);
          void ensureManagerProfile(data.session.user);
        }
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // Verify user has manager access before setting session
      if (newSession?.user) {
        const hasAccess = await verifyManagerAccess(newSession.user);
        if (!hasAccess) {
          // User authenticated but not authorized - sign them out
          console.warn("[auth] User authenticated but not in manager_profiles, signing out");
          await supabase.auth.signOut();
          setSession(null);
          setLoading(false);
          return;
        }
        
        // User is authorized - set session and ensure profile
        setSession(newSession);
        void ensureManagerProfile(newSession.user);
        
        // After successful sign-in, ensure we're on the admin page
        if (event === "SIGNED_IN") {
          // Clean up any remaining hash fragments
          if (window.location.hash) {
            const cleanUrl = window.location.pathname + window.location.search;
            window.history.replaceState(null, "", cleanUrl);
          }
          
          // If we're in the admin route but showing sign-in, the AdminApp will handle the redirect
          // But if we're on a different path, navigate to admin
          if (!location.pathname.startsWith("/admin")) {
            navigate("/admin", { replace: true });
          }
        }
      } else {
        setSession(newSession);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  return { session, loading };
};

