import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";

type TributeSubmission = {
  memoirId: string;
  name: string;
  relationship?: string | null;
  message: string;
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

  const { error } = await supabase.from("memoir_tributes").insert({
    memoir_id: tribute.memoirId,
    name: tribute.name.trim(),
    relationship: tribute.relationship?.trim() || null,
    message: tribute.message.trim(),
    display_order: displayOrder,
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



