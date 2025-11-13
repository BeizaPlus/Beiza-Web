import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import type {
  MemoirDetail,
  MemoirHighlight,
  MemoirSection,
  MemoirSummary,
  MemoirLiveStream,
  MemoirTribute,
} from "@/types/memoir";
import type { JSONContent } from "@tiptap/react";

const STALE_TIME = 1000 * 60 * 5;
const isSupabaseReady = Boolean(supabase);

const handleError = (scope: string, error: Error | null | undefined) => {
  if (!error) return;
  console.warn(`[supabase:${scope}] falling back to static memoir content:`, error.message);
};

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

const normaliseSectionBody = (body: string | null): string => {
  if (!body) return "";
  const trimmed = body.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("<")) {
    return trimmed;
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as JSONContent;
      const html = convertTiptapJsonToHtml(parsed);
      return html || "";
    } catch (error) {
      console.warn("[memoirs] Unable to parse section JSON", error);
    }
  }

  return `<p>${escapeHtml(trimmed)}</p>`;
};

type MemoirRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  hero_media: {
    src: string;
    alt?: string | null;
    placeholder?: string | null;
  } | null;
  last_published_at: string | null;
  memoir_sections?: MemoirSectionRow[] | null;
  memoir_highlights?: MemoirHighlightRow[] | null;
  live_url?: string | null;
  live_stream_platform?: string | null;
  live_stream_title?: string | null;
  live_stream_url?: string | null;
  live_stream_embed_url?: string | null;
  live_stream_is_active?: boolean | null;
};

type MemoirSectionRow = {
  id: string;
  section_type: string;
  heading: string | null;
  body: string | null;
  display_order: number | null;
};

type MemoirHighlightRow = {
  id: string;
  media: {
    src: string;
    alt?: string | null;
    placeholder?: string | null;
  } | null;
  caption: string | null;
  display_order: number | null;
  updated_at: string | null;
};

const mapSummary = (row: MemoirRow): MemoirSummary => {
  // Convert hero_media src from storage path to public URL if needed
  let heroMediaSrc: string | undefined = undefined;
  if (row.hero_media?.src) {
    const src = row.hero_media.src;
    // If it's already a full URL (http/https), use it as-is
    if (src.startsWith("http://") || src.startsWith("https://")) {
      heroMediaSrc = src;
    } else {
      // Otherwise, it's a storage path - convert to public URL
      const { data } = supabase.storage.from("public-assets").getPublicUrl(src);
      heroMediaSrc = data.publicUrl;
    }
  }

  // Use live_url if available, otherwise fall back to live_stream_url
  const liveUrl = row.live_url?.trim() || row.live_stream_url?.trim() || undefined;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    summary: row.summary ?? undefined,
    heroMedia: heroMediaSrc
      ? {
          src: heroMediaSrc,
          alt: row.hero_media?.alt ?? row.title,
          placeholder: row.hero_media?.placeholder ?? undefined,
        }
      : null,
    lastPublishedAt: row.last_published_at ?? undefined,
    liveStreamActive: row.live_stream_is_active ?? (liveUrl ? true : undefined),
    liveStreamUrl: liveUrl,
  };
};

const mapSections = (rows: MemoirSectionRow[] | null | undefined): MemoirSection[] =>
  (rows ?? [])
    .filter((row) => Boolean(row?.body))
    .map((row) => ({
      id: row.id,
      sectionType: row.section_type,
      heading: row.heading,
      body: normaliseSectionBody(row.body),
      displayOrder: row.display_order ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

const mapHighlights = (rows: MemoirHighlightRow[] | null | undefined): MemoirHighlight[] =>
  (rows ?? [])
    .filter((row) => Boolean(row?.media?.src))
    .map((row) => ({
      id: row.id,
      media: {
        src: row.media?.src ?? "",
        alt: row.media?.alt ?? "",
        placeholder: row.media?.placeholder ?? undefined,
      },
      caption: row.caption ?? undefined,
      displayOrder: row.display_order ?? Number.MAX_SAFE_INTEGER,
      updatedAt: row.updated_at ?? undefined,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

const deriveYouTubeEmbedUrl = (url: string) => {
  if (!url) return undefined;

  try {
    const ytRegex =
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/;
    const match = url.match(ytRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  } catch (error) {
    handleError("memoirs.embed", error as Error);
  }

  return undefined;
};

const mapLiveStream = (row: MemoirRow): MemoirLiveStream | undefined => {
  // Use live_url if available, otherwise fall back to live_stream_url
  const url = row.live_url?.trim() || row.live_stream_url?.trim() || undefined;
  const embedUrl = row.live_stream_embed_url?.trim() || undefined;
  const title = row.live_stream_title?.trim() || undefined;
  const isActive = row.live_stream_is_active ?? (url ? true : false);
  const platform = row.live_stream_platform?.trim() || undefined;

  // If there's no URL, embed URL, title, platform, or active status, return undefined
  if (!url && !embedUrl && !title && !platform && !isActive) {
    return undefined;
  }

  // Derive embed URL from regular URL if embed URL is not provided
  const finalEmbedUrl = embedUrl || (url ? deriveYouTubeEmbedUrl(url) : undefined);

  return {
    platform,
    title,
    url,
    embedUrl: finalEmbedUrl,
    isActive,
  };
};

type MemoirHighlightPage = {
  items: MemoirHighlight[];
  nextOffset: number | null;
};

type MemoirTributePage = {
  items: MemoirTribute[];
  nextOffset: number | null;
};

const ensurePositive = (value: number | null | undefined, fallback: number) =>
  value && value > 0 ? value : fallback;

const fetchMemoirHighlightPage = async ({
  memoirId,
  memoirSlug,
  offset,
  limit,
}: {
  memoirId?: string;
  memoirSlug?: string;
  offset: number;
  limit: number;
}): Promise<MemoirHighlightPage> => {
  if (!memoirId || !isSupabaseReady) {
    return { items: [], nextOffset: null };
  }

  const { data, error } = await supabase
    .from("memoir_highlights")
    .select("id, caption, display_order, media, updated_at")
    .eq("memoir_id", memoirId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    handleError("memoir_highlights", error);
    return { items: [], nextOffset: null };
  }

  const items = data.map((row, index) => ({
    id: row.id,
    media: {
      src: (row.media as Record<string, unknown> | null)?.src?.toString() ?? "",
      alt: (row.media as Record<string, unknown> | null)?.alt?.toString() ?? "",
      placeholder: (row.media as Record<string, unknown> | null)?.placeholder?.toString() ?? undefined,
    },
    caption: (row.caption as string | null) ?? undefined,
    displayOrder: ensurePositive(row.display_order as number | null, offset + index + 1),
    updatedAt: (row.updated_at as string | null) ?? undefined,
  }));

  const hasMore = data.length === limit;
  return {
    items,
    nextOffset: hasMore ? offset + limit : null,
  };
};

const fetchMemoirTributePage = async ({
  memoirId,
  memoirSlug,
  offset,
  limit,
}: {
  memoirId?: string;
  memoirSlug?: string;
  offset: number;
  limit: number;
}): Promise<MemoirTributePage> => {
  if (!memoirId || !isSupabaseReady) {
    return { items: [], nextOffset: null };
  }

  const { data, error } = await supabase
    .from("memoir_tributes")
    .select("id, name, relationship, message, display_order")
    .eq("memoir_id", memoirId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    handleError("memoir_tributes", error);
    return { items: [], nextOffset: null };
  }

  const items = data.map((row, index) => ({
    id: row.id as string,
    name: row.name as string,
    relationship: (row.relationship as string | null) ?? null,
    message: row.message as string,
    displayOrder: ensurePositive(row.display_order as number | null, offset + index + 1),
  }));

  const hasMore = data.length === limit;
  return {
    items,
    nextOffset: hasMore ? offset + limit : null,
  };
};

const fetchMemoirSummaries = async (): Promise<MemoirSummary[]> => {
  if (!isSupabaseReady) {
    return [];
  }

  const { data, error } = await supabase
    .from("memoirs")
    .select(
      "id, slug, title, subtitle, summary, hero_media, last_published_at, live_url, live_stream_url, live_stream_is_active"
    )
    .eq("status", "published")
    .order("last_published_at", { ascending: false, nullsFirst: false });

  if (error || !data) {
    handleError("memoirs.list", error);
    return [];
  }

  return data.map(mapSummary);
};

const fetchMemoirDetail = async (slug: string): Promise<MemoirDetail | undefined> => {
  if (!slug) return undefined;

  if (!isSupabaseReady) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("memoirs")
    .select(
      "id, slug, title, subtitle, summary, hero_media, last_published_at, live_url, live_stream_platform, live_stream_title, live_stream_url, live_stream_embed_url, live_stream_is_active, memoir_sections(*), memoir_highlights(*)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<MemoirRow>();

  if (error || !data) {
    handleError("memoirs.detail", error);
    return undefined;
  }

  const summary = mapSummary(data);
  const sections = mapSections(data.memoir_sections);
  const highlights = mapHighlights(data.memoir_highlights);
  const liveStream = mapLiveStream(data);

  return {
    summary,
    sections,
    highlights,
    liveStream,
  };
};

export const useMemoirSummaries = () =>
  useQuery({
    queryKey: ["public-memoirs"],
    staleTime: STALE_TIME,
    queryFn: fetchMemoirSummaries,
  });

export const useMemoirDetail = (slug?: string) =>
  useQuery({
    queryKey: ["public-memoir-detail", slug],
    queryFn: () => fetchMemoirDetail(slug as string),
    staleTime: STALE_TIME,
    enabled: Boolean(slug),
  });

export const useMemoirHighlightPages = (
  memoirId?: string,
  memoirSlug?: string,
  pageSize = 6,
  enabled = true,
) =>
  useInfiniteQuery({
    queryKey: ["public-memoir-highlights", memoirId ?? memoirSlug, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      fetchMemoirHighlightPage({
        memoirId,
        memoirSlug,
        offset: pageParam,
        limit: pageSize,
      }),
    staleTime: STALE_TIME,
    enabled: enabled && Boolean(memoirId ?? memoirSlug),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });

export const useMemoirTributePages = (
  memoirId?: string,
  memoirSlug?: string,
  pageSize = 6,
  enabled = true,
) =>
  useInfiniteQuery({
    queryKey: ["public-memoir-tributes", memoirId ?? memoirSlug, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      fetchMemoirTributePage({
        memoirId,
        memoirSlug,
        offset: pageParam,
        limit: pageSize,
      }),
    staleTime: STALE_TIME,
    enabled: enabled && Boolean(memoirId ?? memoirSlug),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });


