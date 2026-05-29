import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isLegacyStudioPreview } from "@/lib/layoutStudio";
import { STUDIO_MOCK_CIRCLE_ID, STUDIO_MOCK_PEOPLE, getStudioTreeEdges } from "@/lib/legacy/studioPreviewData";
import { supabase } from "@/lib/supabaseClient";
import type {
  FamilyPerson,
  MemoryAboutChoice,
  PersonBiographyFragment,
  PersonTrait,
  RecordingPersonLink,
} from "@/lib/legacy/types";
import { sortBiographyFragments } from "@/lib/legacy/familyTree";
import { fetchTreeEdges } from "@/lib/legacy/treeCanvasPersistence";
import type { TreeEdgeRow } from "@/lib/legacy/treeRelationships";

export function useFamilyPeople(circleId?: string) {
  const studio = isLegacyStudioPreview();
  const effectiveId = circleId ?? (studio ? STUDIO_MOCK_CIRCLE_ID : undefined);
  const query = useQuery({
    queryKey: ["legacy", "family-people", effectiveId],
    queryFn: async () => {
      if (studio) return STUDIO_MOCK_PEOPLE;
      if (!circleId) return [];
      const { data, error } = await supabase!
        .from("family_people")
        .select("*")
        .eq("circle_id", circleId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FamilyPerson[];
    },
    enabled: Boolean(supabase && effectiveId) && !studio,
  });
  if (studio) {
    return { ...query, data: STUDIO_MOCK_PEOPLE, isLoading: false, isFetching: false };
  }
  return query;
}

export function useRecordingPersonLinks(circleId?: string) {
  const studio = isLegacyStudioPreview();
  const effectiveId = circleId ?? (studio ? STUDIO_MOCK_CIRCLE_ID : undefined);
  const query = useQuery({
    queryKey: ["legacy", "recording-links", effectiveId],
    queryFn: async () => {
      if (studio) return [];
      if (!circleId) return [];
      const { data: recordings, error: recError } = await supabase!
        .from("recordings")
        .select("id")
        .eq("circle_id", circleId);
      if (recError) throw recError;
      const ids = (recordings ?? []).map((r) => r.id);
      if (ids.length === 0) return [];

      const { data, error } = await supabase!
        .from("recording_person_links")
        .select("*")
        .in("recording_id", ids);
      if (error) throw error;
      return (data ?? []) as RecordingPersonLink[];
    },
    enabled: Boolean(supabase && effectiveId) && !studio,
  });
  if (studio) {
    return { ...query, data: [], isLoading: false, isFetching: false };
  }
  return query;
}

export function usePersonBiography(personId?: string | null) {
  return useQuery({
    queryKey: ["legacy", "person-biography", personId],
    queryFn: async () => {
      if (!personId) return [];
      const { data, error } = await supabase!.rpc("get_person_biography", {
        p_person_id: personId,
      });
      if (error) throw error;
      const fragments = (data ?? []) as PersonBiographyFragment[];
      return sortBiographyFragments(fragments);
    },
    enabled: Boolean(supabase && personId),
  });
}

/** Ensures each circle member has a living tree node. */
export function useSyncCirclePeople() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (circleId: string) => {
      const { data: members, error: memberError } = await supabase!
        .from("family_members")
        .select("*")
        .eq("circle_id", circleId);
      if (memberError) throw memberError;

      const { data: existing, error: peopleError } = await supabase!
        .from("family_people")
        .select("id, member_id")
        .eq("circle_id", circleId);
      if (peopleError) throw peopleError;

      const existingMemberIds = new Set(
        (existing ?? []).map((p) => p.member_id).filter(Boolean) as string[],
      );

      const { data: userData } = await supabase!.auth.getUser();
      const userId = userData.user?.id;

      for (const member of members ?? []) {
        if (existingMemberIds.has(member.id)) continue;
        const { error: insertError } = await supabase!.from("family_people").insert({
          circle_id: circleId,
          display_name: member.display_name ?? "Family member",
          relation_label: member.role === "keeper" ? "KEEPER" : "MEMBER",
          status: "living",
          user_id: member.user_id,
          member_id: member.id,
          created_by: userId,
        });
        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, circleId) => {
      void queryClient.invalidateQueries({ queryKey: ["legacy", "family-people", circleId] });
    },
  });
}

export function useCreateFamilyPerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      circleId: string;
      displayName: string;
      status?: FamilyPerson["status"];
      relationLabel?: string;
      parentId?: string;
    }) => {
      const { data: userData, error: userError } = await supabase!.auth.getUser();
      if (userError) throw userError;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Sign in required.");

      const { data, error } = await supabase!
        .from("family_people")
        .insert({
          circle_id: params.circleId,
          display_name: params.displayName.trim(),
          status: params.status ?? "invited",
          relation_label: params.relationLabel ?? null,
          parent_id: params.parentId ?? null,
          created_by: userId,
        })
        .select()
        .single();
      if (error) throw error;
      return data as FamilyPerson;
    },
    onSuccess: (person) => {
      void queryClient.invalidateQueries({ queryKey: ["legacy", "family-people", person.circle_id] });
    },
  });
}

export async function linkRecordingToPeople(params: {
  recordingId: string;
  circleId: string;
  choice: MemoryAboutChoice;
  recorderUserId: string;
}) {
  const links: { recording_id: string; person_id: string; link_type: "about" | "by" }[] = [];

  const { data: people } = await supabase!
    .from("family_people")
    .select("*")
    .eq("circle_id", params.circleId);

  const allPeople = (people ?? []) as FamilyPerson[];

  let aboutPerson: FamilyPerson | null = null;

  if (params.choice.type === "self") {
    aboutPerson =
      allPeople.find((p) => p.user_id === params.recorderUserId) ??
      null;
    if (aboutPerson) {
      links.push({ recording_id: params.recordingId, person_id: aboutPerson.id, link_type: "by" });
      links.push({ recording_id: params.recordingId, person_id: aboutPerson.id, link_type: "about" });
    }
  } else if (params.choice.type === "person") {
    aboutPerson = allPeople.find((p) => p.id === params.choice.personId) ?? null;
    if (aboutPerson) {
      links.push({ recording_id: params.recordingId, person_id: aboutPerson.id, link_type: "about" });
    }
    const recorderPerson = allPeople.find((p) => p.user_id === params.recorderUserId);
    if (recorderPerson) {
      links.push({ recording_id: params.recordingId, person_id: recorderPerson.id, link_type: "by" });
    }
  } else if (params.choice.type === "new") {
    const { data: userData } = await supabase!.auth.getUser();
    const { data: created, error: createError } = await supabase!
      .from("family_people")
      .insert({
        circle_id: params.circleId,
        display_name: params.choice.name.trim(),
        status: "invited",
        created_by: userData.user?.id,
      })
      .select()
      .single();
    if (createError) throw createError;
    aboutPerson = created as FamilyPerson;
    links.push({ recording_id: params.recordingId, person_id: aboutPerson.id, link_type: "about" });
    const recorderPerson = allPeople.find((p) => p.user_id === params.recorderUserId);
    if (recorderPerson) {
      links.push({ recording_id: params.recordingId, person_id: recorderPerson.id, link_type: "by" });
    }
  }

  if (links.length === 0) return { aboutPerson, createdPlaceholder: false };

  const { error: linkError } = await supabase!.from("recording_person_links").insert(links);
  if (linkError) throw linkError;

  return {
    aboutPerson,
    createdPlaceholder: params.choice.type === "new",
  };
}

export function useTreeEdges(circleId?: string) {
  const studio = isLegacyStudioPreview();
  const effectiveId = circleId ?? (studio ? STUDIO_MOCK_CIRCLE_ID : undefined);
  const query = useQuery({
    queryKey: ["legacy", "tree-edges", effectiveId],
    queryFn: async () => {
      if (studio) return getStudioTreeEdges(STUDIO_MOCK_CIRCLE_ID);
      if (!circleId) return [];
      return fetchTreeEdges(circleId, false);
    },
    enabled: Boolean(supabase && effectiveId) && !studio,
  });
  if (studio) {
    return {
      ...query,
      data: getStudioTreeEdges(STUDIO_MOCK_CIRCLE_ID),
      isLoading: false,
      isFetching: false,
    };
  }
  return query;
}

export function usePersonTraits(circleId?: string) {
  const studio = isLegacyStudioPreview();
  const effectiveId = circleId ?? (studio ? STUDIO_MOCK_CIRCLE_ID : undefined);
  const query = useQuery({
    queryKey: ["legacy", "person-traits", effectiveId],
    queryFn: async () => {
      if (studio) return [] as PersonTrait[];
      if (!circleId) return [] as PersonTrait[];
      const { data, error } = await supabase!
        .from("person_traits")
        .select("*")
        .eq("circle_id", circleId);
      if (error) throw error;
      return (data ?? []) as PersonTrait[];
    },
    enabled: Boolean(supabase && effectiveId) && !studio,
  });
  if (studio) {
    return { ...query, data: [] as PersonTrait[], isLoading: false, isFetching: false };
  }
  return query;
}
