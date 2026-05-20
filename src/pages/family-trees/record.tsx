import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { RecordMemoryView } from "@/components/legacy/RecordMemoryView";
import { fetchCircleTreeData, type CircleTreePayload } from "@/hooks/useFamilyTreesDirectory";
import { clearCircleToken, getStoredCircleToken } from "@/lib/circleAccess";

/** Public circle canvas — bearer token + `POST /api/circle/record-memory` (service role). */
export default function CircleRecordPage() {
  const { id: circleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
          className="mt-4 text-sm text-[#E6A817] hover:underline"
        >
          Enter access code →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10">
      <div className="mx-auto max-w-md">
        <Link
          to={`/circle/${circleId}/tree`}
          className="mb-6 inline-block font-manrope text-[13px] text-[#888888] hover:text-white"
        >
          ← Back to tree
        </Link>
        <RecordMemoryView
          circleId={circleId}
          circleLabel={payload.circle.name}
          people={payload.people}
          persistViaApi
          treeHref={`/circle/${circleId}/tree`}
        />
      </div>
    </div>
  );
}
