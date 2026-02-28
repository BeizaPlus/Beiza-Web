import { useQueryClient } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { memoirTimelineAdminQueryKey } from "./useMemoirTimelineAdmin";
import { memoirHighlightsAdminQueryKey } from "./useMemoirHighlightsAdmin";
import { memoirTributesAdminQueryKey } from "./useMemoirTributesAdmin";
import { useSafeMutation } from "./useSafeMutation";

const ensureClient = () => {
  const client = getSupabaseClient({ privileged: true }) ?? getSupabaseClient();
  if (!client)
  {
    throw new Error("Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return client;
};

const ensurePrivilegedClient = () => {
  const client = getSupabaseClient({ privileged: true });
  if (!client)
  {
    throw new Error(
      "Privileged Supabase client is not configured. Set VITE_SUPABASE_PRIVILEGED_KEY (or move this operation to a secure environment)."
    );
  }
  return client;
};

export type MemoirStatus = "draft" | "review" | "scheduled" | "published" | "archived";
export type BlogPostStatus = "draft" | "published" | "archived";

export type MemoirUpsertInput = {
  memoir: {
    id?: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    summary?: string | null;
    status: MemoirStatus;
    hero_media?: Record<string, unknown> | null;
    live_url?: string | null;
    updated_by?: string | null;
  };
  sections?: Array<{
    id?: string;
    body: string | JSONContent;
    heading?: string | null;
    section_type?: string;
    display_order?: number;
  }>;
  sectionIdsToDelete?: string[];
  tributes?: Array<{
    id?: string;
    name: string;
    relationship?: string | null;
    message: string;
    display_order?: number;
  }>;
  tributeIdsToDelete?: string[];
};

export type MemoirUpsertResult = {
  memoir: {
    id: string;
    slug: string;
  };
  sections: { id: string }[];
  tributes: { id: string }[];
};

type MemoirSectionRecord = {
  id: string;
  memoir_id: string;
  body: string;
  heading: string | null;
  section_type: string | null;
  display_order: number | null;
};

type MemoirTributeRecord = {
  id: string;
  memoir_id: string;
  name: string;
  relationship: string | null;
  message: string;
  display_order: number | null;
};

type MemoirHighlightRecord = {
  id: string;
  memoir_id: string;
  caption: string | null;
  display_order: number | null;
  media: {
    src: string;
    alt?: string | null;
    placeholder?: string | null;
  } | null;
};

export type MemoirDeleteResult = {
  memoir: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    summary: string | null;
    status: MemoirStatus;
    hero_media: Record<string, unknown> | null;
    updated_by: string | null;
  };
  sections: MemoirSectionRecord[];
  tributes: MemoirTributeRecord[];
  highlights: MemoirHighlightRecord[];
};

export const useUpsertMemoirMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<MemoirUpsertResult, MemoirUpsertInput>({
    mutationFn: async (input) => {
      const client = ensureClient();
      const { memoir, sections = [], sectionIdsToDelete = [], tributes = [], tributeIdsToDelete = [] } = input;

      let updatedBy: string | null | undefined = memoir.updated_by;
      if (updatedBy)
      {
        const { data: managerRow, error: managerError } = await client
          .from("manager_profiles")
          .select("id")
          .eq("id", updatedBy)
          .maybeSingle();

        if (managerError || !managerRow)
        {
          updatedBy = null;
        }
      }

      const memoirPayload = {
        ...memoir,
        updated_by: updatedBy ?? null,
      };

      const { data: upsertedMemoir, error: memoirError } = await client
        .from("memoirs")
        .upsert(memoirPayload, { onConflict: "slug" })
        .select("id, slug")
        .single();

      if (memoirError || !upsertedMemoir)
      {
        throw new Error(memoirError?.message ?? "Unable to save memoir record.");
      }

      const memoirId = upsertedMemoir.id;

      if (sectionIdsToDelete.length > 0)
      {
        const { error: deleteSectionsError } = await client.from("memoir_sections").delete().in("id", sectionIdsToDelete);
        if (deleteSectionsError)
        {
          throw new Error(deleteSectionsError.message);
        }
      }

      if (tributeIdsToDelete.length > 0)
      {
        const { error: deleteTributesError } = await client.from("memoir_tributes").delete().in("id", tributeIdsToDelete);
        if (deleteTributesError)
        {
          throw new Error(deleteTributesError.message);
        }
      }

      let savedSections: { id: string }[] = [];
      if (sections.length > 0)
      {
        const sectionPayload = sections.map((section, index) => {
          const base = {
            memoir_id: memoirId,
            body: typeof section.body === "string" ? section.body : JSON.stringify(section.body),
            section_type: section.section_type ?? "narrative",
            display_order: section.display_order ?? index + 1,
          };

          if (section.heading !== undefined)
          {
            Object.assign(base, { heading: section.heading });
          }

          if (section.id)
          {
            Object.assign(base, { id: section.id });
          }

          return base;
        });

        const { data, error } = await client
          .from("memoir_sections")
          .upsert(sectionPayload, { onConflict: "id" })
          .select("id");

        if (error)
        {
          throw new Error(error.message);
        }

        savedSections = data ?? [];
      }

      let savedTributes: { id: string }[] = [];
      if (tributes.length > 0)
      {
        const tributePayload = tributes.map((tribute, index) => {
          const base = {
            memoir_id: memoirId,
            name: tribute.name,
            relationship: tribute.relationship ?? null,
            message: tribute.message,
            display_order: tribute.display_order ?? index + 1,
          };

          if (tribute.id)
          {
            Object.assign(base, { id: tribute.id });
          }

          return base;
        });

        const { data, error } = await client.from("memoir_tributes").upsert(tributePayload, { onConflict: "id" }).select("id");

        if (error)
        {
          throw new Error(error.message);
        }

        savedTributes = data ?? [];
      }

      return {
        memoir: upsertedMemoir,
        sections: savedSections,
        tributes: savedTributes,
      } satisfies MemoirUpsertResult;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to save memoir",
    },
    logScope: "[admin-memoirs]",
  });
};

export const useUpdateMemoirStatusMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<{ id: string; status: MemoirStatus }, { id: string; status: MemoirStatus }>({
    mutationFn: async ({ id, status }) => {
      const client = ensureClient();
      const { data, error } = await client.from("memoirs").update({ status }).eq("id", id).select("id, status").single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to update memoir status.");
      }

      return {
        id: data.id as string,
        status: data.status as MemoirStatus,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to update memoir status",
    },
    logScope: "[admin-memoirs]",
  });
};

export const useDeleteMemoirMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<MemoirDeleteResult, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();

      const { data, error } = await client
        .from("memoirs")
        .select(
          `
            id,
            slug,
            title,
            subtitle,
            summary,
            status,
            hero_media,
            updated_by,
            memoir_sections (
              id,
              memoir_id,
              body,
              heading,
              section_type,
              display_order
            ),
            memoir_tributes (
              id,
              memoir_id,
              name,
              relationship,
              message,
              display_order
            ),
            memoir_highlights (
              id,
              memoir_id,
              caption,
              display_order,
              media
            )
          `,
        )
        .eq("id", id)
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to fetch memoir for deletion.");
      }

      const { error: deleteError } = await client.from("memoirs").delete().eq("id", id);
      if (deleteError)
      {
        throw new Error(deleteError.message);
      }

      return {
        memoir: {
          id: data.id as string,
          slug: data.slug as string,
          title: data.title as string,
          subtitle: (data.subtitle as string | null) ?? null,
          summary: (data.summary as string | null) ?? null,
          status: data.status as MemoirStatus,
          hero_media: (data.hero_media as Record<string, unknown> | null) ?? null,
          updated_by: (data.updated_by as string | null) ?? null,
        },
        sections: ((data as Record<string, unknown>).memoir_sections ?? []) as MemoirSectionRecord[],
        tributes: ((data as Record<string, unknown>).memoir_tributes ?? []) as MemoirTributeRecord[],
        highlights: ((data as Record<string, unknown>).memoir_highlights ?? []) as MemoirHighlightRecord[],
      };
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
      if (result.memoir.slug)
      {
        void queryClient.removeQueries({ queryKey: memoirTimelineAdminQueryKey(result.memoir.slug) });
      }
    },
    successToast: false,
    errorToast: {
      title: "Unable to delete memoir",
    },
    logScope: "[admin-memoirs]",
  });
};

export const useRestoreMemoirMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, MemoirDeleteResult>({
    mutationFn: async ({ memoir, sections, tributes, highlights }) => {
      const client = ensureClient();

      const { error: memoError } = await client
        .from("memoirs")
        .upsert(
          {
            id: memoir.id,
            slug: memoir.slug,
            title: memoir.title,
            subtitle: memoir.subtitle ?? null,
            summary: memoir.summary ?? null,
            status: memoir.status,
            hero_media: memoir.hero_media ?? null,
            updated_by: memoir.updated_by ?? null,
          },
          { onConflict: "id" },
        );

      if (memoError)
      {
        throw new Error(memoError.message);
      }

      if (sections.length > 0)
      {
        const sectionPayload = sections.map((section) => ({
          ...section,
          memoir_id: memoir.id,
        }));

        const { error: sectionError } = await client.from("memoir_sections").upsert(sectionPayload, { onConflict: "id" });
        if (sectionError)
        {
          throw new Error(sectionError.message);
        }
      }

      if (tributes.length > 0)
      {
        const tributePayload = tributes.map((tribute) => ({
          ...tribute,
          memoir_id: memoir.id,
        }));

        const { error: tributeError } = await client.from("memoir_tributes").upsert(tributePayload, { onConflict: "id" });
        if (tributeError)
        {
          throw new Error(tributeError.message);
        }
      }

      if (highlights.length > 0)
      {
        const highlightPayload = highlights.map((highlight) => ({
          ...highlight,
          memoir_id: memoir.id,
        }));

        const { error: highlightError } = await client
          .from("memoir_highlights")
          .upsert(highlightPayload, { onConflict: "id" });
        if (highlightError)
        {
          throw new Error(highlightError.message);
        }
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
      if (variables.memoir.slug)
      {
        void queryClient.invalidateQueries({ queryKey: memoirTimelineAdminQueryKey(variables.memoir.slug) });
      }
    },
    successToast: {
      title: "Memoir restored",
    },
    errorToast: {
      title: "Unable to restore memoir",
    },
    logScope: "[admin-memoirs]",
  });
};

export type MemoirSectionInput = {
  id?: string;
  memoir_id: string;
  body: string | JSONContent;
  heading?: string | null;
  section_type?: string;
  display_order?: number;
};

export type MemoirHighlightInput = {
  id?: string;
  memoir_id: string;
  caption?: string | null;
  media: {
    src: string;
    alt: string;
    placeholder?: string | null;
  };
  display_order?: number;
};

export const useUpsertMemoirSectionMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<{ id: string }, MemoirSectionInput>({
    mutationFn: async (section) => {
      const client = ensureClient();
      const payload = {
        ...section,
        body: typeof section.body === "string" ? section.body : JSON.stringify(section.body),
        section_type: section.section_type ?? "narrative",
        display_order: section.display_order ?? 1,
      };

      const { data, error } = await client.from("memoir_sections").upsert(payload).select("id").single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to save memoir section.");
      }

      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to save memoir section",
    },
    logScope: "[admin-memoirs]",
  });
};

export const useDeleteMemoirSectionMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      const { error } = await client.from("memoir_sections").delete().eq("id", id);
      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to delete memoir section",
    },
    logScope: "[admin-memoirs]",
  });
};

export type MemoirTributeInput = {
  id?: string;
  memoir_id: string;
  name: string;
  relationship?: string | null;
  message: string;
  display_order?: number;
};

export type MemoirTimelineInput = {
  id?: string;
  memoir_slug: string;
  title: string;
  excerpt: string;
  timestamp: string;
  end_timestamp?: string | null;
  era_label?: string | null;
  location?: string | null;
  story_url?: string | null;
  audio_clip_url?: string | null;
  tags?: string[];
  participants?: string[];
  image?: {
    src: string;
    alt: string;
    placeholder?: string | null;
  } | null;
  display_order?: number | null;
  is_published: boolean;
};

export type MemoirTimelineReorderInput = {
  memoir_slug: string;
  entries: Array<{
    id: string;
    display_order: number;
  }>;
};

export type MemoirHighlightReorderInput = {
  memoir_id: string;
  entries: Array<{
    id: string;
    display_order: number;
  }>;
};

export type MemoirTributeReorderInput = {
  memoir_id: string;
  entries: Array<{
    id: string;
    display_order: number;
  }>;
};

export const useUpsertMemoirTributeMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<{ id: string }, MemoirTributeInput>({
    mutationFn: async (tribute) => {
      const client = ensureClient();
      const payload = {
        ...tribute,
        display_order: tribute.display_order ?? 1,
      };

      const { data, error } = await client.from("memoir_tributes").upsert(payload).select("id").single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to save memoir tribute.");
      }

      return data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
      if (variables.memoir_id)
      {
        void queryClient.invalidateQueries({ queryKey: memoirTributesAdminQueryKey(variables.memoir_id) });
      }
    },
    successToast: false,
    errorToast: {
      title: "Unable to save memoir tribute",
    },
    logScope: "[admin-memoirs]",
  });
};

export const useDeleteMemoirTributeMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, { id: string; memoir_id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      const { error } = await client.from("memoir_tributes").delete().eq("id", id);
      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
      if (variables.memoir_id)
      {
        void queryClient.invalidateQueries({ queryKey: memoirTributesAdminQueryKey(variables.memoir_id) });
      }
    },
    successToast: false,
    errorToast: {
      title: "Unable to delete memoir tribute",
    },
    logScope: "[admin-memoirs]",
  });
};

export const useReorderMemoirTributesMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, MemoirTributeReorderInput>({
    mutationFn: async ({ memoir_id, entries }) => {
      const client = ensureClient();
      if (entries.length === 0)
      {
        return;
      }

      const payload = entries.map((entry) => ({
        id: entry.id,
        memoir_id,
        display_order: entry.display_order,
      }));

      const { error } = await client.from("memoir_tributes").upsert(payload, { onConflict: "id" });
      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: memoirTributesAdminQueryKey(variables.memoir_id) });
    },
    successToast: false,
    errorToast: {
      title: "Unable to reorder memoir tributes",
    },
    logScope: "[admin-memoirs]",
  });
};

export const useUpsertMemoirHighlightMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<{ id: string; memoir_id: string }, MemoirHighlightInput>({
    mutationFn: async (highlight) => {
      const client = ensureClient();
      const payload = {
        ...highlight,
        caption: highlight.caption ?? null,
        display_order: highlight.display_order ?? 1,
        media: {
          src: highlight.media.src,
          alt: highlight.media.alt,
          placeholder: highlight.media.placeholder ?? null,
        },
      };

      const { data, error } = await client
        .from("memoir_highlights")
        .upsert(payload)
        .select("id, memoir_id")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to save memoir highlight.");
      }

      return data as { id: string; memoir_id: string };
    },
    onSuccess: (result, variables) => {
      const memoirId = result?.memoir_id ?? variables.memoir_id;
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
      if (memoirId)
      {
        void queryClient.invalidateQueries({ queryKey: memoirHighlightsAdminQueryKey(memoirId) });
      }
    },
    successToast: {
      title: "Memoir image saved",
    },
    errorToast: {
      title: "Unable to save memoir image",
    },
    logScope: "[admin-memoirs-highlights]",
  });
};

export const useDeleteMemoirHighlightMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, { id: string; memoir_id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      const { error } = await client.from("memoir_highlights").delete().eq("id", id);
      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-memoirs"] });
      void queryClient.invalidateQueries({ queryKey: memoirHighlightsAdminQueryKey(variables.memoir_id) });
    },
    successToast: false,
    errorToast: {
      title: "Unable to delete memoir image",
    },
    logScope: "[admin-memoirs-highlights]",
  });
};

export const useReorderMemoirHighlightsMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, MemoirHighlightReorderInput>({
    mutationFn: async ({ memoir_id, entries }) => {
      const client = ensureClient();
      if (entries.length === 0)
      {
        return;
      }

      const payload = entries.map((entry) => ({
        id: entry.id,
        memoir_id,
        display_order: entry.display_order,
      }));

      const { error } = await client.from("memoir_highlights").upsert(payload, { onConflict: "id" });
      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: memoirHighlightsAdminQueryKey(variables.memoir_id) });
    },
    successToast: false,
    errorToast: {
      title: "Unable to reorder memoir images",
    },
    logScope: "[admin-memoirs-highlights]",
  });
};


export const useUpsertMemoirTimelineMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<{ id: string }, MemoirTimelineInput>({
    mutationFn: async (entry) => {
      const client = ensureClient();

      // First, fetch the memoir_id from the memoir_slug
      const { data: memoirData, error: memoirError } = await client
        .from("memoirs")
        .select("id")
        .eq("slug", entry.memoir_slug)
        .single();

      if (memoirError || !memoirData)
      {
        throw new Error(`Unable to find memoir with slug: ${entry.memoir_slug}`);
      }

      const payload = {
        id: entry.id,
        memoir_id: memoirData.id,
        memoir_slug: entry.memoir_slug,
        title: entry.title,
        excerpt: entry.excerpt,
        timestamp: entry.timestamp,
        end_timestamp: entry.end_timestamp ?? null,
        era_label: entry.era_label ?? null,
        location: entry.location ?? null,
        story_url: entry.story_url ?? null,
        audio_clip_url: entry.audio_clip_url ?? null,
        tags: entry.tags ?? [],
        participants: entry.participants ?? [],
        image: entry.image ?? null,
        display_order: entry.display_order ?? null,
        is_published: entry.is_published,
      };

      const { data, error } = await client.from("memoir_timelines").upsert(payload).select("id").single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to save timeline entry.");
      }

      return data as { id: string };
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: memoirTimelineAdminQueryKey(variables.memoir_slug) });
    },
    successToast: {
      title: "Timeline entry saved",
    },
    errorToast: {
      title: "Unable to save timeline entry",
    },
    logScope: "[admin-memoirs-timeline]",
  });
};

export const useDeleteMemoirTimelineMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, { id: string; memoir_slug: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      const { error } = await client.from("memoir_timelines").delete().eq("id", id);

      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: memoirTimelineAdminQueryKey(variables.memoir_slug) });
    },
    successToast: {
      title: "Timeline entry removed",
    },
    errorToast: {
      title: "Unable to delete timeline entry",
    },
    logScope: "[admin-memoirs-timeline]",
  });
};

export const useReorderMemoirTimelineMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, MemoirTimelineReorderInput>({
    mutationFn: async ({ entries }) => {
      const client = ensureClient();
      if (entries.length === 0)
      {
        return;
      }

      const payload = entries.map((entry) => ({
        id: entry.id,
        display_order: entry.display_order,
      }));

      const { error } = await client.from("memoir_timelines").upsert(payload);

      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: memoirTimelineAdminQueryKey(variables.memoir_slug) });
    },
    successToast: {
      title: "Timeline order updated",
    },
    errorToast: {
      title: "Unable to reorder timeline",
    },
    logScope: "[admin-memoirs-timeline]",
  });
};

export type TestimonialInput = {
  id?: string;
  author: string;
  quote: string;
  role?: string | null;
  surfaces: string[];
  is_published: boolean;
};

export const useUpsertTestimonialMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<TestimonialInput, TestimonialInput>({
    mutationFn: async (testimonial) => {
      const client = ensureClient();
      const payload = {
        ...testimonial,
        role: testimonial.role ?? null,
        surfaces: testimonial.surfaces ?? [],
      };

      const { data, error } = await client.from("testimonials").upsert(payload).select().single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to save testimonial.");
      }

      return data as TestimonialInput;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to save testimonial",
    },
    logScope: "[admin-testimonials]",
  });
};

export const useDeleteTestimonialMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<TestimonialInput, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      const { data, error } = await client
        .from("testimonials")
        .delete()
        .eq("id", id)
        .select("id, author, role, quote, surfaces, is_published")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to delete testimonial.");
      }

      return {
        id: data.id,
        author: data.author,
        role: data.role ?? null,
        quote: data.quote,
        surfaces: (data.surfaces as string[] | null) ?? [],
        is_published: data.is_published,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to delete testimonial",
    },
    logScope: "[admin-testimonials]",
  });
};

export const useUpdateTestimonialPublishMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<TestimonialInput, { id: string; is_published: boolean }>({
    mutationFn: async ({ id, is_published }) => {
      const client = ensureClient();
      const { data, error } = await client
        .from("testimonials")
        .update({ is_published })
        .eq("id", id)
        .select("id, author, role, quote, surfaces, is_published")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to update testimonial.");
      }

      return {
        id: data.id,
        author: data.author,
        role: data.role ?? null,
        quote: data.quote,
        surfaces: (data.surfaces as string[] | null) ?? [],
        is_published: data.is_published,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to update testimonial",
    },
    logScope: "[admin-testimonials]",
  });
};

export type OfferingInput = {
  id?: string;
  title: string;
  description?: string | null;
  icon_key?: string | null;
  display_order?: number;
  is_published: boolean;
};

export const useUpsertOfferingMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<OfferingInput, OfferingInput>({
    mutationFn: async (offering) => {
      const client = ensureClient();
      const payload = {
        ...offering,
        description: offering.description ?? null,
        icon_key: offering.icon_key ?? null,
        display_order: offering.display_order ?? 1,
      };

      const { data, error } = await client.from("offerings").upsert(payload).select().single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to save offering.");
      }

      return data as OfferingInput;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-offerings"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to save offering",
    },
    logScope: "[admin-offerings]",
  });
};

export const useDeleteOfferingMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<OfferingInput, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      const { data, error } = await client
        .from("offerings")
        .delete()
        .eq("id", id)
        .select("id, title, description, icon_key, display_order, is_published")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to delete offering.");
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description ?? null,
        icon_key: data.icon_key ?? null,
        display_order: data.display_order ?? 1,
        is_published: data.is_published,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-offerings"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to delete offering",
    },
    logScope: "[admin-offerings]",
  });
};

export const useUpdateOfferingPublishMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<OfferingInput, { id: string; is_published: boolean }>({
    mutationFn: async ({ id, is_published }) => {
      const client = ensureClient();
      const { data, error } = await client
        .from("offerings")
        .update({ is_published })
        .eq("id", id)
        .select("id, title, description, icon_key, display_order, is_published")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to update offering.");
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description ?? null,
        icon_key: data.icon_key ?? null,
        display_order: data.display_order ?? 1,
        is_published: data.is_published,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-offerings"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to update offering",
    },
    logScope: "[admin-offerings]",
  });
};

export type PricingTierInput = {
  id?: string;
  name: string;
  tagline?: string | null;
  price_label?: string | null;
  description?: string | null;
  badge_label?: string | null;
  is_recommended?: boolean;
  is_published?: boolean;
  display_order?: number;
  features?: PricingFeatureInput[];
};

export type PricingFeatureInput = {
  id?: string;
  tier_id?: string;
  label: string;
  display_order?: number;
};

export const useUpsertPricingTierMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<PricingTierInput, PricingTierInput>({
    mutationFn: async (tier) => {
      const client = ensureClient();
      const tierPayload = {
        id: tier.id,
        name: tier.name,
        tagline: tier.tagline ?? null,
        price_label: tier.price_label ?? null,
        description: tier.description ?? null,
        badge_label: tier.badge_label ?? null,
        is_recommended: tier.is_recommended ?? false,
        is_published: tier.is_published ?? true,
        display_order: tier.display_order ?? 0,
      };

      const { data: tierData, error: tierError } = await client
        .from("pricing_tiers")
        .upsert(tierPayload)
        .select()
        .single();

      if (tierError || !tierData)
      {
        throw new Error(tierError?.message ?? "Unable to save pricing tier.");
      }

      const tierId = tierData.id;

      // Handle features
      if (tier.features && tier.features.length > 0)
      {
        // Delete existing features if this is an update
        if (tier.id)
        {
          await client.from("pricing_features").delete().eq("tier_id", tierId);
        }

        // Insert new features
        const featurePayloads = tier.features.map((feature, index) => ({
          tier_id: tierId,
          label: feature.label,
          display_order: feature.display_order ?? index + 1,
        }));

        const { error: featuresError } = await client.from("pricing_features").insert(featurePayloads);

        if (featuresError)
        {
          throw new Error(featuresError.message);
        }
      }

      return {
        ...tier,
        id: tierId,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-pricing-tiers"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to save pricing tier",
    },
    logScope: "[admin-pricing]",
  });
};

export const useDeletePricingTierMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<PricingTierInput, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      // Features are deleted via CASCADE, so we only need to delete the tier
      const { data, error } = await client
        .from("pricing_tiers")
        .delete()
        .eq("id", id)
        .select("id, name, tagline, price_label, description, badge_label, is_recommended, is_published, display_order")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to delete pricing tier.");
      }

      return {
        id: data.id,
        name: data.name,
        tagline: data.tagline,
        price_label: data.price_label,
        description: data.description,
        badge_label: data.badge_label,
        is_recommended: data.is_recommended,
        is_published: data.is_published,
        display_order: data.display_order,
        features: [],
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-pricing-tiers"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to delete pricing tier",
    },
    logScope: "[admin-pricing]",
  });
};

export const useUpdatePricingTierPublishMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, { id: string; is_published: boolean }>({
    mutationFn: async ({ id, is_published }) => {
      const client = ensureClient();
      const { error } = await client.from("pricing_tiers").update({ is_published }).eq("id", id);

      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-pricing-tiers"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to update pricing tier visibility",
    },
    logScope: "[admin-pricing]",
  });
};

export type EventInput = {
  id?: string;
  slug: string;
  title: string;
  location?: string | null;
  occurs_on?: string | null;
  hero_media?: Record<string, unknown> | null;
  description?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
};

export const useUpsertEventMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<EventInput, EventInput>({
    mutationFn: async (event) => {
      const client = ensureClient();
      const payload = {
        ...event,
        location: event.location ?? null,
        occurs_on: event.occurs_on ?? null,
        hero_media: event.hero_media ?? null,
        description: event.description ?? null,
        is_featured: event.is_featured ?? false,
        is_published: event.is_published ?? false,
      };

      const { data, error } = await client.from("events").upsert(payload, { onConflict: "slug" }).select().single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to save event.");
      }

      return data as EventInput;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to save event",
    },
    logScope: "[admin-events]",
  });
};

export const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<EventInput, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      const { data, error } = await client
        .from("events")
        .delete()
        .eq("id", id)
        .select("id, slug, title, location, occurs_on, hero_media, description, is_featured, is_published")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to delete event.");
      }

      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        location: data.location ?? null,
        occurs_on: data.occurs_on ?? null,
        hero_media: (data.hero_media as Record<string, unknown> | null) ?? null,
        description: data.description ?? null,
        is_featured: data.is_featured ?? false,
        is_published: data.is_published ?? false,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to delete event",
    },
    logScope: "[admin-events]",
  });
};

type EventStatusInput = {
  id: string;
  is_published?: boolean;
  is_featured?: boolean;
};

export const useUpdateEventStatusMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<EventInput, EventStatusInput>({
    mutationFn: async ({ id, is_published, is_featured }) => {
      const client = ensureClient();
      const payload: Partial<EventInput> = {};
      if (typeof is_published === "boolean")
      {
        payload.is_published = is_published;
      }
      if (typeof is_featured === "boolean")
      {
        payload.is_featured = is_featured;
      }

      const { data, error } = await client
        .from("events")
        .update(payload)
        .eq("id", id)
        .select("id, slug, title, location, occurs_on, hero_media, description, is_featured, is_published")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to update event.");
      }

      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        location: data.location ?? null,
        occurs_on: data.occurs_on ?? null,
        hero_media: (data.hero_media as Record<string, unknown> | null) ?? null,
        description: data.description ?? null,
        is_featured: data.is_featured ?? false,
        is_published: data.is_published ?? false,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to update event",
    },
    logScope: "[admin-events]",
  });
};

export type SiteSettingInput = {
  key: string;
  value: string;
  description?: string | null;
};

export const useUpsertSiteSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<SiteSettingInput[], SiteSettingInput[]>({
    mutationFn: async (settings) => {
      const client = ensureClient();
      if (settings.length === 0)
      {
        return [];
      }

      const payload = settings.map((setting) => ({
        ...setting,
        description: setting.description ?? null,
      }));

      const { error } = await client.from("site_settings").upsert(payload);

      if (error)
      {
        throw new Error(error.message);
      }

      return payload;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to update site settings",
    },
    logScope: "[admin-settings]",
  });
};

export type ManagerUpdateInput = {
  id: string;
  role?: string;
  status?: "active" | "invited" | "suspended";
  display_name?: string | null;
};

export type ManagerInviteInput = {
  email: string;
  role: string;
  status?: "active" | "invited" | "suspended";
  display_name?: string | null;
};

export const useCreateManagerMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<ManagerInviteInput & { id: string; last_sign_in_at: string | null }, ManagerInviteInput>({
    mutationFn: async (manager) => {
      const client = ensureClient();
      const email = manager.email.trim().toLowerCase();
      const role = manager.role.trim();
      const status = manager.status ?? "invited";
      const displayName = manager.display_name ?? null;

      const { data, error } = await client.functions.invoke("invite-manager", {
        body: {
          email,
          role,
          status,
          display_name: displayName,
        },
      });

      if (error) {
        throw new Error(`Unable to invite manager. ${error.message}`);
      }

      const profileData = data;

      return {
        email: profileData.email,
        role: profileData.role,
        status: profileData.status,
        display_name: profileData.display_name ?? null,
        id: profileData.id,
        last_sign_in_at: profileData.last_sign_in_at ?? null,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
    },
    successToast: {
      title: "Manager invited",
    },
    errorToast: {
      title: "Unable to invite manager",
    },
    logScope: "[admin-managers]",
  });
};

export const useUpdateManagerMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<ManagerUpdateInput, ManagerUpdateInput>({
    mutationFn: async (manager) => {
      const client = ensurePrivilegedClient();
      const payload = {
        ...manager,
        display_name: manager.display_name ?? null,
      };

      const { data, error } = await client.from("manager_profiles").update(payload).eq("id", manager.id).select().single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to update manager profile.");
      }

      return data as ManagerUpdateInput;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to update manager",
    },
    logScope: "[admin-managers]",
  });
};

export type GalleryAssetInput = {
  id?: string;
  storage_path: string;
  alt: string;
  caption?: string | null;
  memoir_id?: string | null;
  display_order?: number;
  is_published?: boolean;
  created_by?: string | null;
  updated_by?: string | null;
};

export const useUpsertGalleryAssetMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<GalleryAssetInput, GalleryAssetInput>({
    mutationFn: async (asset) => {
      const client = ensureClient();
      const session = await client.auth.getSession();
      const userId = session.data.session?.user?.id ?? null;

      const payload: Record<string, unknown> = {
        storage_path: asset.storage_path,
        alt: asset.alt,
        caption: asset.caption ?? null,
        memoir_id: asset.memoir_id ?? null,
        display_order: asset.display_order ?? 0,
        is_published: asset.is_published ?? true,
        updated_by: userId,
      };

      if (asset.id)
      {
        // Update existing
        const { data, error } = await client
          .from("gallery_assets")
          .update(payload)
          .eq("id", asset.id)
          .select()
          .single();

        if (error || !data)
        {
          throw new Error(error?.message ?? "Unable to update gallery asset.");
        }

        return data as GalleryAssetInput;
      } else
      {
        // Insert new
        payload.created_by = userId;
        const { data, error } = await client.from("gallery_assets").insert(payload).select().single();

        if (error || !data)
        {
          throw new Error(error?.message ?? "Unable to create gallery asset.");
        }

        return data as GalleryAssetInput;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-gallery-assets"] });
      void queryClient.invalidateQueries({ queryKey: ["public-gallery-assets"] });
    },
    successToast: {
      title: "Gallery asset saved",
    },
    errorToast: {
      title: "Unable to save gallery asset",
    },
    logScope: "[admin-gallery-assets]",
  });
};

export const useDeleteGalleryAssetMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();

      const { error } = await client.from("gallery_assets").delete().eq("id", id);

      if (error)
      {
        throw new Error(error.message ?? "Unable to delete gallery asset.");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-gallery-assets"] });
      void queryClient.invalidateQueries({ queryKey: ["public-gallery-assets"] });
    },
    successToast: {
      title: "Gallery asset deleted",
    },
    errorToast: {
      title: "Unable to delete gallery asset",
    },
    logScope: "[admin-gallery-assets]",
  });
};

export type BlogPostUpsertInput = {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  featured_image?: Record<string, unknown> | null;
  status: BlogPostStatus;
  published_at?: string | null;
  updated_by?: string | null;
};

export type BlogPostUpsertResult = {
  id: string;
  slug: string;
};

export const useUpsertBlogPostMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<BlogPostUpsertResult, BlogPostUpsertInput>({
    mutationFn: async (input) => {
      const client = ensureClient();

      let updatedBy: string | null | undefined = input.updated_by;
      if (updatedBy)
      {
        const { data: managerRow, error: managerError } = await client
          .from("manager_profiles")
          .select("id")
          .eq("id", updatedBy)
          .maybeSingle();

        if (managerError || !managerRow)
        {
          updatedBy = null;
        }
      }

      const now = new Date().toISOString();
      const shouldSetPublishedAt = input.status === "published" && !input.published_at;
      const shouldSetLastPublishedAt = input.status === "published";

      const blogPostPayload = {
        ...input,
        updated_by: updatedBy ?? null,
        published_at: shouldSetPublishedAt ? now : input.published_at ?? null,
        last_published_at: shouldSetLastPublishedAt ? now : input.id ? undefined : null,
      };

      // Remove undefined fields
      if (blogPostPayload.last_published_at === undefined)
      {
        delete blogPostPayload.last_published_at;
      }

      const { data: upsertedBlogPost, error: blogPostError } = await client
        .from("blog_posts")
        .upsert(blogPostPayload, { onConflict: "slug" })
        .select("id, slug")
        .single();

      if (blogPostError || !upsertedBlogPost)
      {
        throw new Error(blogPostError?.message ?? "Unable to save blog post record.");
      }

      return {
        id: upsertedBlogPost.id,
        slug: upsertedBlogPost.slug,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["public-blog-posts"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to save blog post",
    },
    logScope: "[admin-blog-posts]",
  });
};

export const useUpdateBlogPostStatusMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<{ id: string; status: BlogPostStatus }, { id: string; status: BlogPostStatus }>({
    mutationFn: async ({ id, status }) => {
      const client = ensureClient();
      const now = new Date().toISOString();

      const updatePayload: Record<string, unknown> = { status };
      if (status === "published")
      {
        updatePayload.last_published_at = now;
        // Only set published_at if it hasn't been set before
        const { data: existing } = await client.from("blog_posts").select("published_at").eq("id", id).single();
        if (!existing?.published_at)
        {
          updatePayload.published_at = now;
        }
      }

      const { data, error } = await client
        .from("blog_posts")
        .update(updatePayload)
        .eq("id", id)
        .select("id, status")
        .single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to update blog post status.");
      }

      return {
        id: data.id as string,
        status: data.status as BlogPostStatus,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["public-blog-posts"] });
    },
    successToast: false,
    errorToast: {
      title: "Unable to update blog post status",
    },
    logScope: "[admin-blog-posts]",
  });
};

export const useDeleteBlogPostMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();

      const { error: deleteError } = await client.from("blog_posts").delete().eq("id", id);
      if (deleteError)
      {
        throw new Error(deleteError.message);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      void queryClient.invalidateQueries({ queryKey: ["public-blog-posts"] });
    },
    successToast: {
      title: "Blog post deleted",
    },
    errorToast: {
      title: "Unable to delete blog post",
    },
    logScope: "[admin-blog-posts]",
  });
};
export type AdsInput = {
  id?: string;
  title: string;
  image_url: string;
  link_url: string;
  placement: string;
  status?: "draft" | "active" | "archived";
};

export const useUpsertAdMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<{ id: string }, AdsInput>({
    mutationFn: async (ad) => {
      const client = ensureClient();
      const payload = {
        ...ad,
        status: ad.status ?? "draft",
      };

      const { data, error } = await client.from("ads").upsert(payload).select("id").single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to save ad.");
      }

      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    },
    successToast: {
      title: "Ad saved",
    },
    errorToast: {
      title: "Unable to save ad",
    },
    logScope: "[admin-ads]",
  });
};

export const useDeleteAdMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<void, { id: string }>({
    mutationFn: async ({ id }) => {
      const client = ensureClient();
      const { error } = await client.from("ads").delete().eq("id", id);

      if (error)
      {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    },
    successToast: {
      title: "Ad deleted",
    },
    errorToast: {
      title: "Unable to delete ad",
    },
    logScope: "[admin-ads]",
  });
};

export const useUpdateAdStatusMutation = () => {
  const queryClient = useQueryClient();

  return useSafeMutation<{ id: string; status: string }, { id: string; status: "draft" | "active" | "archived" }>({
    mutationFn: async ({ id, status }) => {
      const client = ensureClient();
      const { data, error } = await client.from("ads").update({ status }).eq("id", id).select("id, status").single();

      if (error || !data)
      {
        throw new Error(error?.message ?? "Unable to update ad status.");
      }

      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    },
    successToast: {
      title: "Status updated",
    },
    errorToast: {
      title: "Update failed",
    },
    logScope: "[admin-ads]",
  });
};
