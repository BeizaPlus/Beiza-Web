import type { AuthError, PostgrestError, StorageError } from "@supabase/supabase-js";

type KnownSupabaseError = PostgrestError | StorageError | AuthError;

const KNOWN_STATUS_HINTS: Record<number, string> = {
  400: "The request could not be processed. Check your input and try again.",
  401: "You are not authorised to perform this action.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This record already exists. Refresh the page and try again.",
  422: "Some of the provided data is invalid. Review the form and re-submit.",
  429: "Too many requests in a short period. Wait a moment and try again.",
  500: "An unexpected server error occurred. Please try again later.",
};

const isKnownSupabaseError = (error: unknown): error is KnownSupabaseError => {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "message" in error && typeof (error as KnownSupabaseError).message === "string";
};

export const extractSupabaseErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (isKnownSupabaseError(error)) {
    const hint = "status" in error && typeof error.status === "number" ? KNOWN_STATUS_HINTS[error.status] : undefined;
    if (hint && hint !== fallback) {
      return hint;
    }

    return error.message || fallback;
  }

  if ("error_description" in (error as Record<string, unknown>) && typeof (error as Record<string, unknown>).error_description === "string") {
    return (error as Record<string, string>).error_description;
  }

  if ("error" in (error as Record<string, unknown>) && typeof (error as Record<string, unknown>).error === "string") {
    return (error as Record<string, string>).error;
  }

  return fallback;
};

export const normaliseSupabaseError = (error: unknown, fallback?: string) => ({
  message: extractSupabaseErrorMessage(error, fallback),
  cause: error instanceof Error && error.cause ? error.cause : undefined,
});


