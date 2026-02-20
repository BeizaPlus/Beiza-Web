import type { User } from "@supabase/supabase-js";

/**
 * Verify that an authenticated user has a manager profile based on JWT claims
 * This is a critical security check to prevent unauthorized access.
 * 
 * Returns true if:
 * - User JWT has an app_metadata.manager_status of 'active'
 */
export function verifyManagerAccess(user: User): boolean {
  if (!user)
  {
    return false;
  }

  // The custom JWT claims injected via the trigger
  const appMetadata = user.app_metadata || {};

  if (appMetadata.manager_status === 'active')
  {
    return true;
  }

  return false;
}
