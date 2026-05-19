import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pickRandomAdinkra } from "@/lib/adinkra";
import { supabase } from "@/lib/supabaseClient";
import type {
  FamilyCircle,
  FamilyMember,
  LegacyRecording,
  MemoryAboutChoice,
} from "@/lib/legacy/types";
import { linkRecordingToPeople } from "@/hooks/useFamilyTree";
import { extensionForMime, FREE_VAULT_STORAGE_BYTES } from "@/lib/legacy/audioRecording";
import type { StoryPrompt } from "@/lib/prompts";

const LEGACY_BUCKET = "legacy-recordings";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part()}-${part()}-${part()}`;
}

export function useLegacySession() {
  return useQuery({
    queryKey: ["legacy", "session"],
    queryFn: async () => {
      const { data, error } = await supabase!.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    enabled: Boolean(supabase),
  });
}

export function useMyLegacyCircle() {
  return useQuery({
    queryKey: ["legacy", "my-circle"],
    queryFn: async () => {
      const { data: userData, error: userError } = await supabase!.auth.getUser();
      if (userError) throw userError;
      const userId = userData.user?.id;
      if (!userId) return null;

      const { data: membership, error: memberError } = await supabase!
        .from("family_members")
        .select("*")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!membership) return null;

      const { data: circle, error: circleError } = await supabase!
        .from("family_circles")
        .select("*")
        .eq("id", membership.circle_id)
        .single();

      if (circleError) throw circleError;

      return {
        member: membership as FamilyMember,
        circle: circle as FamilyCircle,
      };
    },
    enabled: Boolean(supabase),
  });
}

export function useLegacyRecordings(circleId?: string) {
  return useQuery({
    queryKey: ["legacy", "recordings", circleId],
    queryFn: async () => {
      if (!circleId) return [];
      const { data, error } = await supabase!
        .from("recordings")
        .select("*")
        .eq("circle_id", circleId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LegacyRecording[];
    },
    enabled: Boolean(supabase && circleId),
  });
}

export function useCreateLegacyCircle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: userData, error: userError } = await supabase!.auth.getUser();
      if (userError) throw userError;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Sign in to start your Legacy Circle.");

      const inviteCode = generateInviteCode();
      const adinkra = pickRandomAdinkra();
      const { data: circle, error: circleError } = await supabase!
        .from("family_circles")
        .insert({
          name: name.trim(),
          invite_code: inviteCode,
          adinkra_id: adinkra.id,
          created_by: userId,
        })
        .select()
        .single();
      if (circleError) throw circleError;

      const { error: memberError } = await supabase!.from("family_members").insert({
        circle_id: circle.id,
        user_id: userId,
        role: "keeper",
        display_name: userData.user?.email?.split("@")[0] ?? "Legacy Keeper",
      });
      if (memberError) throw memberError;

      return circle as FamilyCircle;
    },
      onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["legacy"] });
    },
  });
}

export function useJoinLegacyCircle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const normalized = inviteCode.trim().toUpperCase();
      const { data: userData, error: userError } = await supabase!.auth.getUser();
      if (userError) throw userError;
      const userId = userData.user?.id;
      if (!userId) throw new Error("Sign in to join a Legacy Circle.");

      const { data: circle, error: circleError } = await supabase!
        .from("family_circles")
        .select("*")
        .eq("invite_code", normalized)
        .maybeSingle();
      if (circleError) throw circleError;
      if (!circle) throw new Error("Invite code not found.");

      const { error: memberError } = await supabase!.from("family_members").insert({
        circle_id: circle.id,
        user_id: userId,
        role: "member",
        display_name: userData.user?.email?.split("@")[0] ?? "Family member",
      });
      if (memberError) {
        if (memberError.code === "23505") {
          throw new Error("You are already in this Legacy Circle.");
        }
        throw memberError;
      }
      return circle as FamilyCircle;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["legacy"] });
    },
  });
}

export async function uploadLegacyRecording(params: {
  circleId: string;
  prompt: StoryPrompt;
  blob: Blob;
  durationSeconds: number;
  title?: string;
  memoryAbout?: MemoryAboutChoice;
}) {
  const { data: userData, error: userError } = await supabase!.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Sign in to record a memory.");

  if (params.blob.size > FREE_VAULT_STORAGE_BYTES) {
    throw new Error(
      "This recording exceeds your vault storage limit (5 GB on Circle). Free space or upgrade to Keeper.",
    );
  }

  const recordingId = crypto.randomUUID();
  const mime = params.blob.type || "audio/webm";
  const ext = extensionForMime(mime);
  const path = `${params.circleId}/${recordingId}.${ext}`;

  const { error: uploadError } = await supabase!.storage
    .from(LEGACY_BUCKET)
    .upload(path, params.blob, {
      contentType: mime,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase!.storage.from(LEGACY_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase!
    .from("recordings")
    .insert({
      id: recordingId,
      circle_id: params.circleId,
      recorded_by: userId,
      prompt: params.prompt.text,
      prompt_id: params.prompt.id,
      prompt_category: params.prompt.category,
      prompt_arc_position: params.prompt.arc_position,
      prompt_tags: params.prompt.tags,
      audio_url: publicUrl.publicUrl,
      duration_seconds: params.durationSeconds,
      title: params.title?.trim() || null,
    })
    .select()
    .single();
  if (error) throw error;
  const recording = data as LegacyRecording;

  if (params.memoryAbout) {
    await linkRecordingToPeople({
      recordingId: recording.id,
      circleId: params.circleId,
      choice: params.memoryAbout,
      recorderUserId: userId,
    });
  }

  return recording;
}

export function useUpdateLegacyRecordingTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase!
        .from("recordings")
        .update({ title: title.trim() || null })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as LegacyRecording;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["legacy", "recordings"] });
    },
  });
}

export function useDeleteLegacyRecording() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase!.from("recordings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["legacy", "recordings"] });
    },
  });
}

export async function fetchLegacyPrompts(params: {
  circleId: string;
  mode?: "suggest" | "refine" | "pack";
  topic?: string;
  roughPrompt?: string;
}) {
  const { data: session } = await supabase!.auth.getSession();
  const token = session.session?.access_token;
  if (!token) throw new Error("Sign in to get story prompts.");

  const base = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${base}/functions/v1/generate-prompts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      circleId: params.circleId,
      mode: params.mode ?? "suggest",
      topic: params.topic,
      roughPrompt: params.roughPrompt,
      count: 3,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? "Could not generate prompts.");
  }
  const json = (await res.json()) as { prompts?: string[] };
  return json.prompts ?? [];
}
