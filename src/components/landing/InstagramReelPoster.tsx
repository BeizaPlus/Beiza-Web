import { cn } from "@/lib/utils";
import type { HistorySeriesEpisode } from "@/lib/instagramHistorySeries";
import { MEDIA_ASSETS } from "@/lib/mediaAssets";

type InstagramReelPosterProps = {
  post: HistorySeriesEpisode;
  className?: string;
};

/** Minimal (flat) reel poster — title + subtitle only. */
export function InstagramReelPoster({ post, className }: InstagramReelPosterProps) {
  const texture =
    post.posterSrc ??
    MEDIA_ASSETS.home.historySeriesReelTexture?.src ??
    "/images/beiza-history-series-reel-texture.png";

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
      <div className="absolute inset-0 bg-black/35" aria-hidden />

      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end px-5 pb-5 pt-24">
        <div className="text-left">
          <h3 className="font-manrope text-[1.65rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[1.75rem]">
            {post.cardTitle}
          </h3>
          <p className="mt-1.5 font-manrope text-sm font-normal text-white/60">
            {post.cardSubtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
