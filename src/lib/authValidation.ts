import { supabase } from "@/lib/supabaseClient";

/**
 * Validate if an email should be allowed to authenticate
 * 
 * SECURITY RULES:
 * 1. If NO users exist in manager_profiles: Allow ANY email (first user signup)
 * 2. If users exist: ONLY allow emails that exist in manager_profiles
 *    - This includes users with status "invited", "active", or "suspended"
 *    - Only emails explicitly added by admins through the Users & Roles section are allowed
 * 
 * This prevents unauthorized signups. After the first user is registered,
 * they must onboard other managers via the admin UI before those managers can authenticate.
 */
export async function canAuthenticate(email: string): Promise<{ allowed: boolean; reason?: string }> {
  if (!supabase) {
    return {
      allowed: false,
      reason: "Authentication service is not configured.",
    };
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Use the secure RPC function that checks everything in one call
    const { data, error } = await supabase.rpc("can_authenticate_email", {
      check_email: normalizedEmail,
    });

    if (error) {
      console.error("[auth] Error checking email authorization:", error);
      // Fail securely - deny access on error
      return {
        allowed: false,
        reason: "Unable to verify authorization. Please try again or contact an administrator.",
      };
    }

    // Handle the result from the database function
    if (data === "first_user") {
      // No managers exist - allow first user signup
      return { allowed: true };
    }

    if (data === "allowed") {
      // Email exists in manager_profiles - allow authentication
      return { allowed: true };
    }

    // data === "not_authorized" - email not found and managers exist
    return {
      allowed: false,
      reason: "This email is not authorized to access the admin panel. Please contact an administrator to be added as a manager.",
    };
  } catch (error) {
    console.error("[auth] Exception checking email authorization:", error);
    // Fail securely - deny access on exception
    return {
      allowed: false,
      reason: "An error occurred while verifying authorization. Please try again.",
    };
  }
}

