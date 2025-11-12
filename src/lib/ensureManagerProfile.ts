import { supabase } from "@/lib/supabaseClient";

export const ensureManagerProfile = async (user: { id: string; email?: string | null }) => {
  if (!supabase || !user?.id) {
    return;
  }

  try {
    const payload = {
      id: user.id,
      email: user.email ?? null,
      status: "active",
    };

    await supabase.from("manager_profiles").upsert(payload, { onConflict: "id" });
  } catch (error) {
    console.warn("[supabase] Unable to ensure manager profile", error);
  }
};


