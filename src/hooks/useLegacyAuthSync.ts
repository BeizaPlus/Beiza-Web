import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

/** Keep legacy session + circle queries in sync after magic-link sign-in. */
export function useLegacyAuthSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: ["legacy"] });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);
}
