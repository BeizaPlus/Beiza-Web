import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";

type ToastVariant = "default" | "destructive";

type ToastConfig = {
  title: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
};

type DynamicDescription<TPayload> = (payload: TPayload) => string | undefined;

type SuccessToastConfig<TData, TVariables> =
  | false
  | (ToastConfig & {
      description?: string | DynamicDescription<{ data: TData; variables: TVariables }>;
    });

type ErrorToastConfig<TVariables> =
  | false
  | (ToastConfig & {
      title?: string;
      description?: string | DynamicDescription<{ message: string; variables: TVariables; error: Error }>;
    });

type SafeMutationOptions<TData, TVariables, TContext> = UseMutationOptions<TData, Error, TVariables, TContext> & {
  successToast?: SuccessToastConfig<TData, TVariables>;
  errorToast?: ErrorToastConfig<TVariables>;
  logScope?: string;
};

const emitToast = (config: ToastConfig) => {
  toast({
    variant: config.variant ?? "default",
    title: config.title,
    description: config.description,
    duration: config.duration,
  });
};

export const useSafeMutation = <TData, TVariables = void, TContext = unknown>(
  options: SafeMutationOptions<TData, TVariables, TContext>,
): UseMutationResult<TData, Error, TVariables, TContext> => {
  const {
    successToast = false,
    errorToast = {
      title: "Something went wrong",
    },
    logScope = "[admin-crud]",
    ...mutationOptions
  } = options;

  return useMutation<TData, Error, TVariables, TContext>({
    retry: mutationOptions.retry ?? 1,
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (successToast) {
        const description =
          typeof successToast.description === "function"
            ? successToast.description({ data, variables })
            : successToast.description;

        emitToast({
          title: successToast.title,
          description,
          duration: successToast.duration,
          variant: successToast.variant ?? "default",
        });
      }

      mutationOptions.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const message = extractSupabaseErrorMessage(error);

      if (logScope) {
        // eslint-disable-next-line no-console
        console.error(`${logScope} mutation failed`, error);
      }

      if (errorToast) {
        const description =
          typeof errorToast.description === "function"
            ? errorToast.description({ message, variables, error })
            : errorToast.description ?? message;

        emitToast({
          title: errorToast.title ?? "Something went wrong",
          description: description ?? message,
          duration: errorToast.duration,
          variant: errorToast.variant ?? "destructive",
        });
      }

      mutationOptions.onError?.(error, variables, context);
    },
  });
};


