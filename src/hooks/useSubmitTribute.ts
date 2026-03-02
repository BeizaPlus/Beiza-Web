import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";

type TributeSubmission = {
  memoirId: string;
  name: string;
  relationship?: string | null;
  message: string;
  audioBlob?: Blob | null;
};

const getNextDisplayOrder = async (memoirId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("memoir_tributes")
    .select("display_order")
    .eq("memoir_id", memoirId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned", which is fine
    console.warn("[tribute] Error fetching max display_order:", error);
  }

  const maxOrder = data?.display_order ?? 0;
  return maxOrder + 1;
};

const submitTribute = async (tribute: TributeSubmission): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase client is not available");
  }

  const displayOrder = await getNextDisplayOrder(tribute.memoirId);

  let audio_url: string | null = null;
  
  if (tribute.audioBlob) {
    try {
      const fileExt = tribute.audioBlob.type.replace("audio/", "").split(";")[0] || "webm";
      const fileName = `${tribute.memoirId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("tribute-uploads")
        .upload(fileName, tribute.audioBlob, {
          cacheControl: "3600",
          upsert: false
        });
        
      if (uploadError) {
        throw new Error(`Failed to upload audio: ${uploadError.message}`);
      }
      
      // We store the relative path in DB to be consistent with existing logic 
      // where we extract public URL at runtime using getPublicUrl
      audio_url = uploadData.path;
      
    } catch (err: any) {
      console.error("[tribute] Audio upload error:", err);
      throw new Error(err.message || "Failed to upload your voice note");
    }
  }

  const { error } = await supabase.from("memoir_tributes").insert({
    memoir_id: tribute.memoirId,
    name: tribute.name.trim(),
    relationship: tribute.relationship?.trim() || null,
    message: tribute.message.trim(),
    display_order: displayOrder,
    audio_url: audio_url
  });

  if (error) {
    throw new Error(error.message || "Failed to submit tribute");
  }
};

export const useSubmitTribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitTribute,
    onSuccess: () => {
      toast({
        title: "Tribute submitted successfully",
        description: "Thank you for sharing your tribute. It will be reviewed and published soon.",
      });
      // Invalidate relevant queries to refresh tribute lists
      queryClient.invalidateQueries({ queryKey: ["public-memoir-tributes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit tribute",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });
};



