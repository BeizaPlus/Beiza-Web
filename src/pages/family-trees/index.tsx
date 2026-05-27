import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { CircleCardVisual } from "@/components/family-trees/CircleCardVisual";
import { usePublicFamilyCircles } from "@/hooks/useFamilyTreesDirectory";
import { useMyLegacyCircle } from "@/hooks/useLegacy";
import { marketingContainer, marketingSection } from "@/lib/brandUi";
import { BEIZA_LINKS } from "@/lib/beizaMasterLinks";
import { Loader2 } from "lucide-react";

export default function FamilyTreesDirectoryPage() {
  const { data: circles = [], isLoading, error } = usePublicFamilyCircles();
  const { data: myCircle } = useMyLegacyCircle();

  useEffect(() => {
    document.title = "Circle · Beiza";
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className={`${marketingSection} border-t border-[#1a1a1a]`}>
        <div className={marketingContainer}>
          <p className="text-eyebrow text-[#555555]">PRIVATE CIRCLES</p>
          <h1 className="mt-3 font-manrope text-4xl font-bold text-white">Circle</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#888888]">
            Each cover is public. The tree inside is private — enter your family&apos;s access code
            to continue.
          </p>

          <p className="mt-6 text-[13px] text-[#555555]">
            Lost someone and need to recover their recordings?{" "}
            <Link to={BEIZA_LINKS.marketing.recover} className="text-[#888888] hover:text-primary">
              → Recover a voice
            </Link>
          </p>

          {isLoading ? (
            <p className="mt-12 flex items-center gap-2 text-[#666666]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading circles…
            </p>
          ) : error ? (
            <p className="mt-12 text-sm text-[#CE1126]">
              Apply migration <code className="text-xs">20260524T100000_recovery_access_family_trees.sql</code>{" "}
              to load the directory.
            </p>
          ) : circles.length === 0 ? (
            <p className="mt-12 text-sm text-[#666666]">
              No family circles yet.{" "}
              <Link to={BEIZA_LINKS.legacy.family} className="text-primary hover:underline">
                Start yours →
              </Link>
            </p>
          ) : (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {circles.map((circle) => {
                const isYours = myCircle?.circle?.id === circle.id;
                const since = circle.since_year ?? new Date().getFullYear();
                return (
                  <li key={circle.id}>
                    <Link
                      to={`/circle/${circle.id}/enter`}
                      className="group block overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] transition-colors hover:border-[#2a2a2a]"
                    >
                      <CircleCardVisual adinkraId={circle.adinkra_id} />
                      <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-manrope text-lg font-semibold text-white group-hover:text-primary">
                          {circle.name}
                          {circle.branch ? (
                            <span className="ml-1.5 font-manrope text-sm font-normal text-[#E6A817]/70">
                              · {circle.branch}
                            </span>
                          ) : null}
                        </h2>
                        {isYours ? (
                          <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                            Your circle
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs text-[#666666]">
                        {circle.member_count} members · {circle.memory_count} memories · Since{" "}
                        {since}
                      </p>
                      <span
                        className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                          circle.is_in_memoriam
                            ? "bg-[#1a1a1a] text-[#888888]"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {circle.is_in_memoriam ? "In memoriam" : "Active"}
                      </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
