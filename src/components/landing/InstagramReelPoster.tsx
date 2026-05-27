import { cn } from "@/lib/utils";
import type { HistorySeriesEpisode } from "@/lib/instagramHistorySeries";
import { MEDIA_ASSETS } from "@/lib/mediaAssets";
import { BeizaEducationBrandMark } from "@/components/landing/BeizaEducationBrandMark";

type InstagramReelPosterProps = {
  post: HistorySeriesEpisode;
  className?: string;
};

/** Education-guide style 4:5 poster — BEIZA mark top-left, episode guide top-right. */
export function InstagramReelPoster({ post, className }: InstagramReelPosterProps) {
  const texture =
    post.posterSrc ?? MEDIA_ASSETS.home.historySeriesReelTexture.src;

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <img
        src={texture}
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-50"
        loading="lazy"
        draggable={false}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            post.backdrop ??
            "radial-gradient(ellipse 120% 90% at 0% 0%, #3d2e14 0%, #14100a 38%, #050505 100%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0" style={{ background: post.glow }} aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#4a3818]/30 via-transparent to-black/90"
        aria-hidden
      />

      <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
        <BeizaEducationBrandMark variant="full" compact />
        <span className="shrink-0 rounded-md border border-white/25 px-2 py-1 font-manrope text-[9px] font-medium uppercase tracking-[0.18em] text-white/70">
          {post.guideLabel}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end px-5 pb-5 pt-24">
        <div className="text-left">
          <h3 className="font-manrope text-[1.65rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[1.75rem]">
            {post.cardTitle}
          </h3>
          <p className="mt-1.5 font-manrope text-sm font-normal text-white/50">
            {post.cardSubtitle}
          </p>
        </div>

        <div
          className="mt-5 grid grid-cols-[1fr_1.6fr] gap-2 rounded-xl border border-white/15 p-2.5"
          aria-hidden
        >
          <div className="flex flex-col gap-2">
            <div className="aspect-square rounded-md bg-[#8b6f3a]/55" />
            <div className="aspect-square rounded-md bg-[#8b6f3a]/40" />
          </div>
          <div className="rounded-md bg-[#8b6f3a]/35" />
        </div>

        <p className="mt-3 font-manrope text-[10px] uppercase tracking-[0.22em] text-[#E6A817]/80">
          {post.eraLabel} · {post.placeLabel}
        </p>
      </div>
    </div>
  );
}
