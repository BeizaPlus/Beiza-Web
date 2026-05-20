import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type StudioEditableTextProps = {
  value: string;
  onChange: (value: string) => void;
  enabled: boolean;
  as?: "span" | "p" | "h2" | "h3";
  className?: string;
  multiline?: boolean;
};

export function StudioEditableText({
  value,
  onChange,
  enabled,
  as: Tag = "span",
  className,
  multiline = false,
}: StudioEditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  if (!enabled) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (editing) {
    const shared =
      "w-full rounded border border-primary/50 bg-[#0a0a0a] px-2 py-1 font-inherit text-inherit outline-none ring-1 ring-primary/30";
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          rows={3}
          className={cn(shared, className)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={draft}
        className={cn(shared, className)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <Tag
      role="button"
      tabIndex={0}
      className={cn(
        className,
        "cursor-text rounded-sm outline-none ring-1 ring-transparent transition hover:ring-primary/40 focus:ring-primary/50",
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setDraft(value);
          setEditing(true);
        }
      }}
    >
      {value}
    </Tag>
  );
}
