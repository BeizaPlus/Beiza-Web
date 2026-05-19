// The access code is the moat.
// The tree is private. The cover is public.
// You earn entry by belonging to the family.

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BeizaLogoLink } from "@/components/BeizaLogoLink";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePublicCircleCover,
  verifyCircleAccessCode,
} from "@/hooks/useFamilyTreesDirectory";
import { hasStoredCircleToken, storeCircleToken } from "@/lib/circleAccess";

export default function FamilyTreeEnterPage() {
  const { id: circleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cover, isLoading } = usePublicCircleCover(circleId);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [requestEmail, setRequestEmail] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    if (!circleId) return;
    if (hasStoredCircleToken(circleId)) {
      navigate(`/circle/${circleId}/tree`, { replace: true });
    }
  }, [circleId, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circleId) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await verifyCircleAccessCode(circleId, code.trim().toUpperCase());
      if (!result.valid || !result.token) {
        setError("That code isn't right. Check with your family admin.");
        return;
      }
      storeCircleToken(circleId, result.token);
      navigate(`/circle/${circleId}/tree`);
    } catch {
      setError("That code isn't right. Check with your family admin.");
    } finally {
      setSubmitting(false);
    }
  };

  const onRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Access request: ${cover?.name ?? "Family circle"}`);
    const body = encodeURIComponent(
      `I'd like access to this private circle.\n\nMy email: ${requestEmail}\nCircle: ${cover?.name ?? circleId}`,
    );
    window.location.href = `mailto:hello@beiza.com?subject=${subject}&body=${body}`;
  };

  if (!circleId) {
    return <p className="p-8 text-center text-[#666666]">Circle not found.</p>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <div className="flex flex-1 flex-col items-center px-6 py-12">
        <BeizaLogoLink variant="wordmark" wordmarkClassName="h-5 w-auto opacity-90" />

        {isLoading ? (
          <p className="mt-16 flex items-center gap-2 text-[#666666]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </p>
        ) : (
          <div className="mt-16 w-full max-w-sm text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#555555]">Private circle</p>
            <h1 className="mt-4 font-manrope text-[28px] font-bold leading-tight text-white">
              {cover?.name ?? "Family Circle"}
            </h1>
            <p className="mt-4 text-sm leading-[1.7] text-[#666666]">
              This circle is private. Enter your access code to continue.
            </p>

            <form onSubmit={(e) => void onSubmit(e)} className="mt-10 flex flex-col items-center">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                maxLength={6}
                autoComplete="off"
                spellCheck={false}
                className="h-14 max-w-[240px] border-[#2a2a2a] bg-[#111111] text-center font-manrope text-2xl font-medium tracking-[0.5em] text-white"
                placeholder="······"
                aria-label="Access code"
              />
              {error ? (
                <p className="mt-3 text-xs text-[#CE1126]" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={code.length !== 6 || submitting}
                className="mt-6 h-11 w-full max-w-[240px] rounded-full bg-primary font-medium text-[#0a0a0a] hover:bg-primary/90"
              >
                {submitting ? "Checking…" : "Enter circle →"}
              </Button>
            </form>

            <div className="mt-10 space-y-1 text-sm text-[#666666]">
              <p>Don&apos;t have a code?</p>
              <p>
                Ask the circle admin to invite you, or{" "}
                <button
                  type="button"
                  onClick={() => setShowRequestForm((v) => !v)}
                  className="text-[#888888] underline-offset-2 hover:text-white hover:underline"
                >
                  request access →
                </button>
              </p>
              {showRequestForm ? (
                <form onSubmit={onRequestAccess} className="mt-4 space-y-3">
                  <Input
                    type="email"
                    required
                    placeholder="Your email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    className="border-[#2a2a2a] bg-[#111111]"
                  />
                  <Button type="submit" variant="secondary" className="w-full rounded-full">
                    Email request
                  </Button>
                </form>
              ) : null}
            </div>

            <p className="mt-10 text-[13px] text-[#555555]">
              Lost someone and need to recover their recordings?{" "}
              <Link to="/recover" className="hover:text-primary">
                → Recover a voice
              </Link>
            </p>

            <Link
              to="/circle"
              className="mt-8 inline-block text-xs text-[#444444] hover:text-[#888888]"
            >
              ← All circles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
