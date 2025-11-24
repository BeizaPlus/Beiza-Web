import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

/**
 * Verify that an authenticated user has a manager profile
 * This is a critical security check to prevent unauthorized access
 * 
 * Returns true if:
 * - User email exists in manager_profiles, OR
 * - No managers exist yet (first user scenario)
 */
export async function verifyManagerAccess(user: User): Promise<boolean> {
  if (!supabase || !user?.email) {
    return false;
  }

  try {
    const normalizedEmail = user.email.toLowerCase().trim();
    
    // Check if any managers exist
    const { data: managerCount, error: countError } = await supabase
      .from("manager_profiles")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("[auth] Error checking manager count:", countError);
      // Fail securely - deny access on error
      return false;
    }

    // If no managers exist, allow first user
    if ((managerCount ?? 0) === 0) {
      return true;
    }

    // Check if user's email exists in manager_profiles
    const { data: profile, error: profileError } = await supabase
      .from("manager_profiles")
      .select("id, email, status")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (profileError) {
      console.error("[auth] Error checking manager profile:", profileError);
      // Fail securely - deny access on error
      return false;
    }

    // User must have a profile to access admin
    return profile !== null;
  } catch (error) {
    console.error("[auth] Exception verifying manager access:", error);
    // Fail securely - deny access on exception
    return false;
  }
}

