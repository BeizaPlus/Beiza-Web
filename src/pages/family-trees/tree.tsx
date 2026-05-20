// The recordings are the inheritance.
// Recovery is how we make sure it isn't lost.

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { FamilyTreeCircleView } from "@/components/family-trees/FamilyTreeCircleView";
import { fetchCircleTreeData, type CircleTreePayload } from "@/hooks/useFamilyTreesDirectory";
import { clearCircleToken, getStoredCircleToken } from "@/lib/circleAccess";
import { BEIZA_TREE_UPDATED, type BeizaTreeUpdatedDetail } from "@/lib/legacy/personaEvents";
import { useToast } from "@/hooks/use-toast";

export default function FamilyTreeCanvasPage() {
  const { id: circleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payload, setPayload] = useState<CircleTreePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!circleId) return;

    const token = getStoredCircleToken(circleId);
    if (!token) {
      navigate(`/circle/${circleId}/enter`, { replace: true });
      return;
    }

    setLoading(true);
    void fetchCircleTreeData(circleId, token)
      .then(setPayload)
      .catch((err: Error) => {
        clearCircleToken(circleId);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [circleId, navigate]);

  useEffect(() => {
    if (!circleId) return;

    const onTreeUpdated = (event: Event) => {
      const detail = (event as CustomEvent<BeizaTreeUpdatedDetail>).detail;
      if (detail?.circleId !== circleId) return;
      const token = getStoredCircleToken(circleId);
      if (!token) return;
      void fetchCircleTreeData(circleId, token).then(setPayload).catch(() => {
        /* keep current tree if refresh fails */
      });
    };

    window.addEventListener(BEIZA_TREE_UPDATED, onTreeUpdated);
    return () => window.removeEventListener(BEIZA_TREE_UPDATED, onTreeUpdated);
  }, [circleId]);

  const copyCode = async () => {
    if (!payload?.circle.access_code) return;
    await navigator.clipboard.writeText(payload.circle.access_code);
    toast({ title: "Access code copied" });
  };

  if (!circleId) {
    return <p className="p-8 text-center text-[#666666]">Circle not found.</p>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#666666]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
        <p className="text-sm text-[#666666]">{error ?? "Access required."}</p>
        <Link
          to={`/circle/${circleId}/enter`}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Enter access code →
        </Link>
      </div>
    );
  }

  return (
    <FamilyTreeCircleView
      circleId={circleId}
      circleName={payload.circle.name}
      people={payload.people}
      links={payload.links}
      recordings={payload.recordings}
      treeEdges={payload.treeEdges ?? []}
      healthConditions={payload.healthConditions ?? []}
      persistViaApi
      backHref="/circle"
      showInviteBar
      accessCode={payload.circle.access_code}
      onCopyAccessCode={() => void copyCode()}
    />
  );
}

