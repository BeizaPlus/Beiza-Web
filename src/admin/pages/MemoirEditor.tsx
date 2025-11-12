import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Save, ArrowLeft, AlertCircle, Plus, ArrowUp, ArrowDown, Trash2, Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/tiptap/rich-text-editor";
import type { JSONContent } from "@tiptap/react";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { CrudTable, ConfirmDialog } from "@/admin/components/crud";
import { TimelineEntryForm } from "@/admin/components/memoirs/TimelineEntryForm";
import { HighlightForm } from "@/admin/components/memoirs/HighlightForm";
import { TributeForm } from "@/admin/components/memoirs/TributeForm";
import { useImageUpload } from "@/hooks/use-image-upload";
import {
  useDeleteMemoirTimelineMutation,
  useReorderMemoirTimelineMutation,
  useUpsertMemoirMutation,
  useDeleteMemoirTributeMutation,
  useReorderMemoirTributesMutation,
  useDeleteMemoirHighlightMutation,
  useReorderMemoirHighlightsMutation,
} from "../hooks/useAdminMutations";
import { useMemoirTimelineAdmin } from "../hooks/useMemoirTimelineAdmin";
import { useMemoirHighlightsAdmin } from "../hooks/useMemoirHighlightsAdmin";
import { useMemoirTributesAdmin } from "../hooks/useMemoirTributesAdmin";

const memoirStatusEnum = z.enum(["draft", "review", "scheduled", "published", "archived"] as const);

type MemoirStatus = z.infer<typeof memoirStatusEnum>;

const statusOptions: ReadonlyArray<{ value: MemoirStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const MEMOIR_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const memoirMetadataSchema = z.object({
  title: z.string().min(2, "Title is required."),
  slug: z
    .string()
    .min(2, "Slug is required.")
    .regex(MEMOIR_SLUG_PATTERN, "Slug can only contain lowercase letters, numbers, and hyphens."),
  status: memoirStatusEnum,
});

const DEFAULT_CONTENT = "<p>Capture the story, add media, and craft the narrative.</p>";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const applyMarks = (text: string, marks?: JSONContent["marks"]): string => {
  if (!marks || marks.length === 0) {
    return text;
  }

  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return `<strong>${acc}</strong>`;
      case "italic":
        return `<em>${acc}</em>`;
      case "strike":
        return `<s>${acc}</s>`;
      case "underline":
        return `<u>${acc}</u>`;
      case "code":
        return `<code>${acc}</code>`;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? escapeHtml(mark.attrs.href) : "#";
        const rel = mark.attrs?.target === "_blank" ? ' rel="noopener noreferrer"' : "";
        const target = mark.attrs?.target ? ` target="${escapeHtml(mark.attrs.target)}"` : "";
        return `<a href="${href}"${target}${rel}>${acc}</a>`;
      }
      default:
        return acc;
    }
  }, text);
};

const renderNodeToHtml = (node: JSONContent | null | undefined): string => {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    const text = escapeHtml(node.text ?? "");
    return applyMarks(text, node.marks);
  }

  if (node.type === "hardBreak") {
    return "<br />";
  }

  const renderedChildren = Array.isArray(node.content)
    ? node.content.map((child) => renderNodeToHtml(child)).join("")
    : "";

  switch (node.type) {
    case "paragraph":
      return `<p>${renderedChildren}</p>`;
    case "heading":
      return `<h${node.attrs?.level ?? 2}>${renderedChildren}</h${node.attrs?.level ?? 2}>`;
    case "bulletList":
      return `<ul>${renderedChildren}</ul>`;
    case "orderedList":
      return `<ol>${renderedChildren}</ol>`;
    case "listItem":
      return `<li>${renderedChildren}</li>`;
    case "blockquote":
      return `<blockquote>${renderedChildren}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${renderedChildren}</code></pre>`;
    default:
      return renderedChildren;
  }
};

const convertTiptapJsonToHtml = (doc: JSONContent): string => {
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) {
    return "";
  }

  return doc.content.map((node) => renderNodeToHtml(node)).join("");
};

const normaliseBody = (body: string | null): string => {
  if (!body) {
    return DEFAULT_CONTENT;
  }
  const trimmed = body.trim();
  if (!trimmed) {
    return DEFAULT_CONTENT;
  }

  if (trimmed.startsWith("<")) {
    return trimmed;
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as JSONContent;
      const html = convertTiptapJsonToHtml(parsed);
      return html || DEFAULT_CONTENT;
    } catch (error) {
      console.warn("[memoir-editor] Failed to parse section body JSON", error);
    }
  }

  return `<p>${escapeHtml(trimmed)}</p>`;
};

const MemoirEditor = () => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const isNewMemoir = !slugParam;
  const navigate = useNavigate();
  const { session } = useSupabaseSession();

  const [memoirId, setMemoirId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [summary, setSummary] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [heroMediaSrc, setHeroMediaSrc] = useState("");
  const [heroMediaAlt, setHeroMediaAlt] = useState("");
  const [status, setStatus] = useState<MemoirStatus>("draft");
  const [content, setContent] = useState<string>(DEFAULT_CONTENT);

  const [loading, setLoading] = useState(!isNewMemoir);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNewMemoir);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const upsertMemoir = useUpsertMemoirMutation();
  const deleteTimelineEntry = useDeleteMemoirTimelineMutation();
  const reorderTimeline = useReorderMemoirTimelineMutation();
  const deleteTribute = useDeleteMemoirTributeMutation();
  const reorderTributes = useReorderMemoirTributesMutation();
  const deleteHighlight = useDeleteMemoirHighlightMutation();
  const reorderHighlights = useReorderMemoirHighlightsMutation();

  // Hero media image upload
  const getHeroMediaInitialUrl = useMemo(() => {
    if (heroMediaSrc) {
      // If it's already a full URL, return it
      if (heroMediaSrc.startsWith("http")) {
        return heroMediaSrc;
      }
      // If it's a storage path, get the public URL
      const client = getSupabaseClient();
      if (!client) return null;
      const { data } = client.storage.from("public-assets").getPublicUrl(heroMediaSrc);
      return data.publicUrl;
    }
    return null;
  }, [heroMediaSrc]);

  const {
    previewUrl: heroMediaPreview,
    handleThumbnailClick: handleHeroMediaClick,
    handleFileChange: handleHeroMediaFileChange,
    handleRemove: handleHeroMediaRemove,
    fileInputRef: heroMediaFileInputRef,
    uploading: heroMediaUploading,
    error: heroMediaUploadError,
  } = useImageUpload({
    folder: (slugParam ?? slugValue) ? `memoirs/${slugParam ?? slugValue}/hero` : "memoirs/hero",
    onUpload: ({ url, path }) => {
      // Use the storage path for hero_media.src
      setHeroMediaSrc(path || url);
      setDirty(true);
    },
    onRemove: () => {
      setHeroMediaSrc("");
      setHeroMediaAlt("");
      setDirty(true);
    },
    initialUrl: getHeroMediaInitialUrl,
  });

  const timelineSlugCandidate = slugParam ?? slugValue;
  const timelineEnabled = Boolean((memoirId || !isNewMemoir) && timelineSlugCandidate);
  const activeTimelineSlug = timelineEnabled ? (timelineSlugCandidate as string) : undefined;
  const {
    data: timelineEntries = [],
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    error: timelineError,
  } = useMemoirTimelineAdmin(activeTimelineSlug);
  const {
    data: highlightEntries = [],
    isLoading: isHighlightsLoading,
    isError: isHighlightsError,
    error: highlightsError,
  } = useMemoirHighlightsAdmin(memoirId ?? undefined);
  const {
    data: tributeEntries = [],
    isLoading: isTributesLoading,
    isError: isTributesError,
    error: tributesError,
  } = useMemoirTributesAdmin(memoirId ?? undefined);

  useEffect(() => {
    if (isNewMemoir) {
      setMemoirId(null);
      setSectionId(null);
      setTitle("");
      setSubtitle("");
      setSummary("");
      setLiveUrl("");
      setHeroMediaSrc("");
      setHeroMediaAlt("");
      setStatus("draft");
      setContent(DEFAULT_CONTENT);
      setSlugValue("");
      setDirty(false);
      setLoadError(null);
      setSlugTouched(false);
      return;
    }

    const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
    if (!client) {
      setLoadError("Supabase client is not configured. Check environment variables.");
      return;
    }

    let isMounted = true;

    const loadMemoir = async () => {
      setLoading(true);
      setLoadError(null);

      const { data: memoirData, error: memoirError } = await client
        .from("memoirs")
        .select("id, slug, title, subtitle, summary, status, live_url, hero_media")
        .eq("slug", slugParam)
        .maybeSingle();

      if (!isMounted) return;

      if (memoirError || !memoirData) {
        setLoadError(memoirError?.message ?? "Memoir not found.");
        setLoading(false);
        return;
      }

      const { data: sectionData, error: sectionError } = await client
        .from("memoir_sections")
        .select("id, body, section_type, display_order")
        .eq("memoir_id", memoirData.id)
        .order("display_order", { ascending: true });

      if (!isMounted) return;

      if (sectionError) {
        setLoadError(sectionError.message);
        setLoading(false);
        return;
      }

      const narrativeSection = sectionData?.find((section) => section.section_type === "narrative") ?? sectionData?.[0] ?? null;

      setMemoirId(memoirData.id);
      setSectionId(narrativeSection?.id ?? null);
      setTitle(memoirData.title ?? "");
      setSubtitle(memoirData.subtitle ?? "");
      setSummary(memoirData.summary ?? "");
      setLiveUrl(memoirData.live_url ?? "");
      
      // Parse hero_media
      const heroMedia = memoirData.hero_media as { src?: string; alt?: string } | null;
      if (heroMedia && typeof heroMedia === "object") {
        setHeroMediaSrc(heroMedia.src ?? "");
        setHeroMediaAlt(heroMedia.alt ?? "");
      } else {
        setHeroMediaSrc("");
        setHeroMediaAlt("");
      }
      
      setStatus((memoirData.status as MemoirStatus) ?? "draft");
      setSlugValue(memoirData.slug ?? "");
      setSlugTouched(true);
      setContent(normaliseBody(narrativeSection?.body ?? null));
      setDirty(false);
      setLoading(false);
    };

    void loadMemoir();

    return () => {
      isMounted = false;
    };
  }, [isNewMemoir, slugParam]);

  useEffect(() => {
    if (!isNewMemoir && slugParam) {
      setSlugTouched(true);
    }
  }, [isNewMemoir, slugParam]);

  useEffect(() => {
    if (!isNewMemoir || slugTouched) {
      return;
    }

    if (!title.trim()) {
      setSlugValue("");
      return;
    }

    setSlugValue(slugify(title));
  }, [isNewMemoir, slugTouched, title]);

  useEffect(() => {
    if (dirty) {
      setLastSavedAt(null);
    }
  }, [dirty]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setDirty(true);
    if (isNewMemoir && !slugTouched) {
      setSlugValue(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlugValue(value);
    setDirty(true);
  };

  const handleSlugBlur = () => {
    setSlugValue((current) => {
      const sanitized = slugify(current);
      if (sanitized !== current) {
        setDirty(true);
      }
      return sanitized;
    });
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedSlug = slugify(slugValue);

    const validation = memoirMetadataSchema.safeParse({ title: trimmedTitle, slug: trimmedSlug, status });
    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message ?? "Please review the highlighted fields.");
      return;
    }

    if (!session?.user?.id) {
      setFormError("You must be signed in to save memoirs.");
      return;
    }

    setFormError(null);

    try {
      // Prepare hero_media
      const heroMedia = heroMediaSrc.trim()
        ? {
            src: heroMediaSrc.trim(),
            alt: heroMediaAlt.trim() || trimmedTitle,
          }
        : null;

      const result = await upsertMemoir.mutateAsync({
        memoir: {
          id: memoirId ?? undefined,
          title: trimmedTitle,
          slug: trimmedSlug,
          subtitle: subtitle.trim() || null,
          summary: summary.trim() || null,
          live_url: liveUrl.trim() || null,
          hero_media: heroMedia,
          status,
          updated_by: session.user.id,
        },
        sections: [
          {
            id: sectionId ?? undefined,
            body: content ?? "",
            section_type: "narrative",
            display_order: 1,
          },
        ],
      });

      setMemoirId(result.memoir.id);
      setSlugValue(result.memoir.slug);
      if (result.sections[0]?.id) {
        setSectionId(result.sections[0].id);
      }
      setDirty(false);
      toast({
        title: "Memoir saved",
        description: "Your changes have been stored successfully.",
      });

      if (isNewMemoir) {
        navigate(`/admin/memoirs/${result.memoir.slug}`, { replace: true });
      }
      setLastSavedAt(new Date());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save memoir.";
      setFormError(message);
      toast({
        title: "Save failed",
        description: message,
      });
    }
  };

  const memoisedStatusOptions = useMemo(() => statusOptions, []);
  const canSave = dirty && !upsertMemoir.isPending && !heroMediaUploading;
  const timelineEntriesWithOrder = useMemo(
    () =>
      [...timelineEntries].sort((a, b) => {
        const orderA = a.display_order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.display_order ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }).map((entry, index) => ({
        ...entry,
        resolvedOrder: entry.display_order ?? index + 1,
      })),
    [timelineEntries],
  );
  const nextTimelineOrder =
    timelineEntriesWithOrder.length > 0
      ? Math.max(...timelineEntriesWithOrder.map((entry) => entry.resolvedOrder)) + 1
      : 1;
  const highlightEntriesWithOrder = useMemo(
    () =>
      highlightEntries.map((entry, index) => ({
        ...entry,
        resolvedOrder: entry.display_order ?? index + 1,
      })),
    [highlightEntries],
  );
  const nextHighlightOrder =
    highlightEntriesWithOrder.length > 0
      ? Math.max(...highlightEntriesWithOrder.map((entry) => entry.resolvedOrder)) + 1
      : 1;
  const tributeEntriesWithOrder = useMemo(
    () =>
      tributeEntries.map((entry, index) => ({
        ...entry,
        resolvedOrder: entry.display_order ?? index + 1,
      })),
    [tributeEntries],
  );
  const nextTributeOrder =
    tributeEntriesWithOrder.length > 0
      ? Math.max(...tributeEntriesWithOrder.map((entry) => entry.resolvedOrder)) + 1
      : 1;
  const timelineErrorMessage =
    timelineError instanceof Error ? timelineError.message : "Unable to load timeline entries.";
  const highlightsErrorMessage =
    highlightsError instanceof Error ? highlightsError.message : "Unable to load gallery images.";
  const tributesErrorMessage =
    tributesError instanceof Error ? tributesError.message : "Unable to load tributes.";
  const formatTimelineDate = (value: string) =>
    new Date(value).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const handleTimelineReorder = (entryId: string, direction: "up" | "down") => {
    if (!timelineEnabled || !activeTimelineSlug) {
      return;
    }

    const currentIndex = timelineEntriesWithOrder.findIndex((entry) => entry.id === entryId);
    if (currentIndex === -1) {
      return;
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= timelineEntriesWithOrder.length) {
      return;
    }

    const reordered = [...timelineEntriesWithOrder];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(swapIndex, 0, removed);

    const payload = reordered.map((entry, index) => ({
      id: entry.id,
      display_order: index + 1,
    }));

    reorderTimeline.mutate({
      memoir_slug: activeTimelineSlug,
      entries: payload,
    });
  };
  const handleHighlightReorder = (entryId: string, direction: "up" | "down") => {
    if (!memoirId) {
      return;
    }

    const currentIndex = highlightEntriesWithOrder.findIndex((entry) => entry.id === entryId);
    if (currentIndex === -1) {
      return;
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= highlightEntriesWithOrder.length) {
      return;
    }

    const reordered = [...highlightEntriesWithOrder];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(swapIndex, 0, removed);

    const payload = reordered.map((entry, index) => ({
      id: entry.id,
      display_order: index + 1,
    }));

    reorderHighlights.mutate({
      memoir_id: memoirId,
      entries: payload,
    });
  };
  const handleTributeReorder = (entryId: string, direction: "up" | "down") => {
    if (!memoirId) {
      return;
    }

    const currentIndex = tributeEntriesWithOrder.findIndex((entry) => entry.id === entryId);
    if (currentIndex === -1) {
      return;
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= tributeEntriesWithOrder.length) {
      return;
    }

    const reordered = [...tributeEntriesWithOrder];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(swapIndex, 0, removed);

    const payload = reordered.map((entry, index) => ({
      id: entry.id,
      display_order: index + 1,
    }));

    reorderTributes.mutate({
      memoir_id: memoirId,
      entries: payload,
    });
  };
  const saveStatusLabel = upsertMemoir.isPending
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : lastSavedAt
        ? `Saved ${formatDistanceToNow(lastSavedAt, { addSuffix: true })}`
        : "All changes saved";
  const saveStatusTone = upsertMemoir.isPending
    ? "text-white"
    : dirty
      ? "text-amber-300"
      : "text-emerald-300";
  const currentDeleteTimelineId = deleteTimelineEntry.variables?.id;
  const currentDeleteTributeId = deleteTribute.variables?.id;
  const currentDeleteHighlightId = deleteHighlight.variables?.id;

  const body = loadError ? (
    <Card className="border-rose-500/30 bg-rose-500/10 text-rose-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-100">
          <AlertCircle className="h-5 w-5" />
          Unable to load memoir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{loadError}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="rounded-full" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button
            className="rounded-full bg-white text-black hover:bg-white/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : loading ? (
    <Card className="border-white/10 bg-white/5 text-white/70">
      <CardContent className="flex items-center gap-3 py-10 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading memoir…
      </CardContent>
    </Card>
  ) : (
    <>
      {formError ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <AlertCircle className="h-4 w-4" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Memoir Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white/70">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={handleSlugBlur}
                  className="bg-white/5 text-white"
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-white/70">
                  Slug
                </label>
                <Input
                  id="slug"
                  value={slugValue}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onBlur={handleSlugBlur}
                  className="bg-white/5 text-white"
                />
              </div>
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-white/70">
                  Subtitle
                </label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    setDirty(true);
                  }}
                  className="bg-white/5 text-white"
                />
              </div>
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-white/70">
                  Summary
                </label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    setDirty(true);
                  }}
                  className="bg-white/5 text-white"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-white/70">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as MemoirStatus);
                    setDirty(true);
                  }}
                  className="bg-white/5 text-white"
                >
                  {memoisedStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="live-url" className="block text-sm font-medium text-white/70">
                  Live URL
                </label>
                <Input
                  id="live-url"
                  type="url"
                  value={liveUrl}
                  onChange={(e) => {
                    setLiveUrl(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="https://example.com/memoir"
                  className="bg-white/5 text-white"
                />
                <p className="mt-1 text-xs text-white/50">
                  Optional: Link to the live/published memoir page when status is "Published" or "Live"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Memoir Hero Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-white/70">
                Upload a hero image that will be displayed on the memoir card in the memoirs list. This image appears as the thumbnail for the memoir.
              </p>
              <div className="space-y-3 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 md:w-1/2">
                    {heroMediaPreview ? (
                      <img src={heroMediaPreview} alt="Hero image preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs uppercase tracking-[0.3em] text-white/40">No image selected</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      ref={heroMediaFileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleHeroMediaFileChange}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-white/20 text-white/80 hover:bg-white/10"
                        onClick={handleHeroMediaClick}
                        disabled={heroMediaUploading}
                      >
                        {heroMediaUploading ? "Uploading…" : "Choose image"}
                      </Button>
                      {heroMediaPreview ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-full border border-white/20 text-white/70 hover:text-white"
                          onClick={handleHeroMediaRemove}
                          disabled={heroMediaUploading}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    {heroMediaUploadError ? <p className="text-xs text-rose-200">{heroMediaUploadError}</p> : null}
                  </div>
                </div>
                {heroMediaPreview ? (
                  <div>
                    <label htmlFor="hero-media-alt" className="block text-sm font-medium text-white/70 mb-2">
                      Alt text
                    </label>
                    <Input
                      id="hero-media-alt"
                      value={heroMediaAlt}
                      onChange={(e) => {
                        setHeroMediaAlt(e.target.value);
                        setDirty(true);
                      }}
                      placeholder="Descriptive text for the image"
                      className="bg-white/5 text-white"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Memoir Narrative</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={content}
              onChange={({ html }) => {
                setContent(html);
                setDirty(true);
              }}
              placeholder="Write your memoir narrative here..."
              className="border-white/10 bg-white/5"
            />
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Memoir Timeline</h2>
            <p className="text-sm text-white/70">Sequence the key moments that appear on the public timeline.</p>
          </div>
          {timelineEnabled && activeTimelineSlug ? (
            <CrudTable
              title="Timeline entries"
              description="Reorder entries and control their publish status."
              actions={
                <TimelineEntryForm
                  memoirSlug={activeTimelineSlug}
                  defaultOrder={nextTimelineOrder}
                  trigger={
                    <Button className="rounded-full bg-white text-black hover:bg-white/90" type="button">
                      <Plus className="mr-2 h-4 w-4" />
                      Add entry
                    </Button>
                  }
                />
              }
              dataCount={timelineEntriesWithOrder.length}
              isLoading={isTimelineLoading}
              isError={isTimelineError}
              errorMessage={timelineErrorMessage}
              emptyMessage="No timeline entries yet."
            >
              {timelineEntriesWithOrder.map((entry, index) => {
                const isFirst = index === 0;
                const isLast = index === timelineEntriesWithOrder.length - 1;
                const isDeleting = deleteTimelineEntry.isPending && currentDeleteTimelineId === entry.id;

                return (
                  <tr key={entry.id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4 text-white/60">{entry.resolvedOrder}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-white">{entry.title}</p>
                        <p className="text-xs text-white/50 line-clamp-2">{entry.excerpt}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">{formatTimelineDate(entry.timestamp)}</td>
                    <td className="px-6 py-4 text-white/60">{entry.era_label ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          entry.is_published ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-200"
                        }`}
                      >
                        {entry.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white"
                          onClick={() => handleTimelineReorder(entry.id, "up")}
                          disabled={isFirst || reorderTimeline.isPending}
                          aria-label="Move entry up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white"
                          onClick={() => handleTimelineReorder(entry.id, "down")}
                          disabled={isLast || reorderTimeline.isPending}
                          aria-label="Move entry down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <TimelineEntryForm
                          memoirSlug={activeTimelineSlug}
                          entry={entry}
                          defaultOrder={entry.resolvedOrder}
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-white/70 hover:text-white"
                              aria-label="Edit timeline entry"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          title="Remove timeline entry?"
                          description="This entry will no longer appear in the memoir timeline."
                          onConfirm={() =>
                            deleteTimelineEntry.mutateAsync({
                              id: entry.id,
                              memoir_slug: activeTimelineSlug,
                            })
                          }
                          isConfirming={isDeleting}
                          variant="danger"
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-rose-300 hover:text-rose-100"
                              aria-label="Delete timeline entry"
                              disabled={deleteTimelineEntry.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </CrudTable>
          ) : (
            <Card className="border-dashed border-white/20 bg-white/5 text-white/70">
              <CardContent className="space-y-2 py-6 text-sm">
                <p>Save the memoir details to unlock timeline management.</p>
                <p className="text-xs text-white/50">
                  Once saved, you can add milestones, reorder them, and control their publish state.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Memoir Gallery</h2>
            <p className="text-sm text-white/70">Curate imagery that represents the memoir celebration.</p>
          </div>
          {memoirId ? (
            <CrudTable
              title="Gallery images"
              description="Upload hero visuals, reorder them, and keep captions consistent."
              actions={
                <HighlightForm
                  memoirId={memoirId}
                  memoirSlug={timelineSlugCandidate}
                  defaultOrder={nextHighlightOrder}
                  trigger={
                    <Button className="rounded-full bg-white text-black hover:bg-white/90" type="button">
                      <Plus className="mr-2 h-4 w-4" />
                      Add image
                    </Button>
                  }
                />
              }
              dataCount={highlightEntriesWithOrder.length}
              isLoading={isHighlightsLoading}
              isError={isHighlightsError}
              errorMessage={highlightsErrorMessage}
              emptyMessage="No gallery images yet."
              columns={
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Order</th>
                  <th className="px-6 py-3 text-left font-medium">Preview</th>
                  <th className="px-6 py-3 text-left font-medium">Caption</th>
                  <th className="px-6 py-3 text-left font-medium">Updated</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              }
            >
              {highlightEntriesWithOrder.map((highlight, index) => {
                const isFirst = index === 0;
                const isLast = index === highlightEntriesWithOrder.length - 1;
                const isDeleting = deleteHighlight.isPending && currentDeleteHighlightId === highlight.id;
                const updatedDisplay = highlight.updated_at
                  ? new Date(highlight.updated_at).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—";

                return (
                  <tr key={highlight.id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4 text-white/60">{highlight.resolvedOrder}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-20 w-28 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                          {highlight.media.src ? (
                            <img
                              src={highlight.media.src}
                              alt={highlight.media.alt}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-white/50">No image</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white">{highlight.media.alt}</p>
                          {highlight.media.placeholder ? (
                            <p className="text-xs text-white/50">Placeholder available</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {highlight.caption ? (
                        <span className="line-clamp-3 text-sm">{highlight.caption}</span>
                      ) : (
                        <span className="text-xs uppercase tracking-[0.2em] text-white/40">No caption</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/60">{updatedDisplay}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white"
                          onClick={() => handleHighlightReorder(highlight.id, "up")}
                          disabled={isFirst || reorderHighlights.isPending}
                          aria-label="Move image up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white"
                          onClick={() => handleHighlightReorder(highlight.id, "down")}
                          disabled={isLast || reorderHighlights.isPending}
                          aria-label="Move image down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <HighlightForm
                          memoirId={memoirId}
                          memoirSlug={timelineSlugCandidate}
                          highlight={highlight}
                          defaultOrder={highlight.resolvedOrder}
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-white/70 hover:text-white"
                              aria-label="Edit image"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          title="Remove image?"
                          description="This image will no longer appear in the memoir gallery."
                          onConfirm={() => deleteHighlight.mutateAsync({ id: highlight.id, memoir_id: memoirId })}
                          isConfirming={isDeleting}
                          variant="danger"
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-rose-300 hover:text-rose-100"
                              aria-label="Delete image"
                              disabled={deleteHighlight.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </CrudTable>
          ) : (
            <Card className="border-dashed border-white/20 bg-white/5 text-white/70">
              <CardContent className="space-y-2 py-6 text-sm">
                <p>Save this memoir to unlock gallery management.</p>
                <p className="text-xs text-white/50">
                  Upload images, edit captions, and control their display order once the memoir exists.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Memoir Tributes</h2>
            <p className="text-sm text-white/70">Document the heartfelt words shared during the celebration.</p>
          </div>
          {memoirId ? (
            <CrudTable
              title="Tributes"
              description="Collect and organise tributes from family, friends, and collaborators."
              actions={
                <TributeForm
                  memoirId={memoirId}
                  defaultOrder={nextTributeOrder}
                  trigger={
                    <Button className="rounded-full bg-white text-black hover:bg-white/90" type="button">
                      <Plus className="mr-2 h-4 w-4" />
                      Add tribute
                    </Button>
                  }
                />
              }
              dataCount={tributeEntriesWithOrder.length}
              isLoading={isTributesLoading}
              isError={isTributesError}
              errorMessage={tributesErrorMessage}
              emptyMessage="No tributes have been recorded yet."
              columns={
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Order</th>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Relationship</th>
                  <th className="px-6 py-3 text-left font-medium">Message</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              }
            >
              {tributeEntriesWithOrder.map((entry, index) => {
                const isFirst = index === 0;
                const isLast = index === tributeEntriesWithOrder.length - 1;
                const isDeleting = deleteTribute.isPending && currentDeleteTributeId === entry.id;

                return (
                  <tr key={entry.id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4 text-white/60">{entry.resolvedOrder}</td>
                    <td className="px-6 py-4 text-white">{entry.name}</td>
                    <td className="px-6 py-4 text-white/70">{entry.relationship ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      <span className="line-clamp-3">{entry.message}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white"
                          onClick={() => handleTributeReorder(entry.id, "up")}
                          disabled={isFirst || reorderTributes.isPending}
                          aria-label="Move tribute up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-white/70 hover:text-white"
                          onClick={() => handleTributeReorder(entry.id, "down")}
                          disabled={isLast || reorderTributes.isPending}
                          aria-label="Move tribute down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <TributeForm
                          memoirId={memoirId}
                          tribute={entry}
                          defaultOrder={entry.resolvedOrder}
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-white/70 hover:text-white"
                              aria-label="Edit tribute"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          title="Remove tribute?"
                          description="This tribute will no longer appear on the memoir."
                          onConfirm={() => deleteTribute.mutateAsync({ id: entry.id, memoir_id: memoirId })}
                          isConfirming={isDeleting}
                          variant="danger"
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-rose-300 hover:text-rose-100"
                              aria-label="Delete tribute"
                              disabled={deleteTribute.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </CrudTable>
          ) : (
            <Card className="border-dashed border-white/20 bg-white/5 text-white/70">
              <CardContent className="space-y-2 py-6 text-sm">
                <p>Save this memoir to record tributes.</p>
                <p className="text-xs text-white/50">
                  Once saved, you can collect tributes, edit their wording, and control the reading order.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-white/5 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Memoirs</p>
          <h1 className="text-3xl font-semibold text-white">{isNewMemoir ? "Create memoir" : `Edit memoir`}</h1>
          <p className="text-sm text-white/70">Manage core details and craft the narrative using the rich text editor.</p>
          <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.2em] ${saveStatusTone}`}>{saveStatusLabel}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="rounded-full border-white/20 text-white/80" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button className="rounded-full bg-white text-black hover:bg-white/90" disabled={!canSave} onClick={handleSave}>
              {upsertMemoir.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {upsertMemoir.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      {body}
    </div>
  );
};

export default MemoirEditor;
