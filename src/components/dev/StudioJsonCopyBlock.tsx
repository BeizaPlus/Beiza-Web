import { useCallback, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyStudioText } from "@/lib/studioClipboard";

type Props = {
  /** Build JSON from current slider values (called on each render for live preview). */
  getJson: () => string;
  /** Optional second action (e.g. download file). */
  onSaveFile?: () => void;
  saveFileLabel?: string;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
};

/**
 * Live JSON preview + Copy — works even when clipboard API is blocked.
 */
export function StudioJsonCopyBlock({
  getJson,
  onSaveFile,
  saveFileLabel = "Save file",
  onReset,
  resetLabel = "Reset",
  className,
}: Props) {
  const previewId = useId();
  const json = getJson();
  const [status, setStatus] = useState<string | null>(null);

  const copy = useCallback(async () => {
    const text = getJson();
    const { ok, method } = await copyStudioText(text);
    if (ok) {
      setStatus(method === "clipboard" ? "Copied to clipboard" : "Copied (fallback)");
    } else {
      setStatus("Clipboard blocked — select the JSON below and press Ctrl+C");
    }
    window.setTimeout(() => setStatus(null), 4000);
  }, [getJson]);

  const selectAll = () => {
    const el = document.getElementById(previewId) as HTMLTextAreaElement | null;
    el?.focus();
    el?.select();
  };

  return (
    <div className={className}>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => void copy()}>
          Copy JSON
        </Button>
        {onSaveFile ? (
          <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={onSaveFile}>
            {saveFileLabel}
          </Button>
        ) : null}
        {onReset ? (
          <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={onReset}>
            {resetLabel}
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={selectAll}>
          Select all
        </Button>
      </div>
      {status ? <p className="mt-2 text-[10px] text-primary">{status}</p> : null}
      <p className="mt-2 text-[9px] leading-snug text-muted-foreground">
        Paste this JSON in chat so layout can be saved to code defaults. Values update as you move sliders.
      </p>
      <textarea
        id={previewId}
        readOnly
        value={json}
        onFocus={(e) => e.currentTarget.select()}
        className="mt-2 max-h-40 w-full resize-y rounded-md border border-border bg-muted/30 p-2 font-mono text-[10px] leading-snug text-foreground"
        aria-label="Layout studio JSON export"
      />
    </div>
  );
}
