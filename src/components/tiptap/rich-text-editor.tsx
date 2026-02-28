"use client";
import "./tiptap.css";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { ImageExtension } from "@/components/tiptap/extensions/image";
import { ImagePlaceholder } from "@/components/tiptap/extensions/image-placeholder";
import SearchAndReplace from "@/components/tiptap/extensions/search-and-replace";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, type Extension, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TipTapFloatingMenu } from "@/components/tiptap/extensions/floating-menu";
import { FloatingToolbar } from "@/components/tiptap/extensions/floating-toolbar";
import { EditorToolbar } from "./toolbars/editor-toolbar";
import Placeholder from "@tiptap/extension-placeholder";

type RichTextValue = string | JSONContent | null | undefined;

type RichTextEditorChangePayload = {
  html: string;
  json: JSONContent;
  text: string;
};

type RichTextEditorProps = {
  value?: RichTextValue;
  onChange?: (payload: RichTextEditorChangePayload) => void;
  className?: string;
  editable?: boolean;
  placeholder?: string;
};

const createExtensions = (placeholder?: string): Extension[] => [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    emptyNodeClass: "is-editor-empty",
    placeholder: ({ node }) => {
      switch (node.type.name)
      {
        case "heading":
          return `Heading ${node.attrs.level}`;
        case "detailsSummary":
          return "Section title";
        case "codeBlock":
          return "";
        default:
          return placeholder ?? "Write, type '/' for commands";
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  Typography,
];

export function RichTextEditor({
  value,
  onChange,
  className,
  editable = true,
  placeholder,
}: RichTextEditorProps) {
  const extensions = useMemo(() => createExtensions(placeholder), [placeholder]);
  const lastHtmlRef = useRef<string | null>(null);
  const lastJsonRef = useRef<string | null>(null);

  const editor = useEditor(
    {
      immediatelyRender: false,
      editable,
      extensions: extensions as Extension[],
      content: value ?? "<p></p>",
      editorProps: {
        attributes: {
          class: "max-w-full focus:outline-none",
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        const json = editor.getJSON() as JSONContent;
        const payload = {
          html,
          json,
          text: editor.getText(),
        };
        lastHtmlRef.current = html;
        lastJsonRef.current = JSON.stringify(json);
        onChange?.(payload);
      },
    },
    [editable, extensions]
  );

  useEffect(() => {
    if (!editor)
    {
      return;
    }

    if (typeof editable === "boolean")
    {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) return;
    if (value === undefined || value === null) return;

    if (typeof value === "string")
    {
      if (lastHtmlRef.current === value)
      {
        return;
      }
      editor.commands.setContent(value, { emitUpdate: false });
      lastHtmlRef.current = value;
      lastJsonRef.current = JSON.stringify(editor.getJSON());
      return;
    }

    const serializedJson = JSON.stringify(value);
    if (lastJsonRef.current === serializedJson)
    {
      return;
    }

    editor.commands.setContent(value, false);
    lastJsonRef.current = serializedJson;
    lastHtmlRef.current = editor.getHTML();
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border border-white/10 bg-card pb-[60px] sm:pb-0",
        className
      )}
    >
      {editable ? <EditorToolbar editor={editor} /> : null}
      {editable ? <FloatingToolbar editor={editor} /> : null}
      {editable ? <TipTapFloatingMenu editor={editor} /> : null}
      <EditorContent editor={editor} className="min-h-[400px] w-full min-w-full cursor-text sm:p-6" />
    </div>
  );
}
