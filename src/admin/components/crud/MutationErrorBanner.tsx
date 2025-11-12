import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MutationErrorBannerProps = {
  message: string;
  details?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export const MutationErrorBanner = ({
  message,
  details,
  onRetry,
  retryLabel = "Try again",
  className,
}: MutationErrorBannerProps) => (
  <div
    className={cn(
      "flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100",
      className,
    )}
    role="alert"
  >
    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
    <div className="flex flex-1 flex-col gap-1">
      <span className="font-medium">{message}</span>
      {details ? <div className="text-xs text-rose-50/80">{details}</div> : null}
    </div>
    {onRetry ? (
      <Button
        variant="outline"
        size="sm"
        className="border-rose-500/40 text-rose-100 hover:bg-rose-500/20 hover:text-rose-50"
        onClick={onRetry}
      >
        {retryLabel}
      </Button>
    ) : null}
  </div>
);


