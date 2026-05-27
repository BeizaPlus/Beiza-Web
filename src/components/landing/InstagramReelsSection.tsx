import { SectionHeader } from "@/components/framer/SectionHeader";
import { InstagramReelPoster } from "@/components/landing/InstagramReelPoster";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { HISTORY_SERIES_EPISODES, type HistorySeriesEpisode } from "@/lib/instagramHistorySeries";
import { instagramEmbedSrc } from "@/lib/instagramEmbed";
import { LAYOUT_TW } from "@/lib/layoutBreakpoints";
import { cn } from "@/lib/utils";

export type InstagramPost = {
  id: string;
  url: string;
  label: string;
  /** Optional poster image beneath the cinematic frame */
  posterSrc?: string;
};

/** Crop Instagram header chrome on embed player. */
const EMBED_TOP_CROP_PX = 54;

function isHistoryEpisode(post: InstagramPost): post is HistorySeriesEpisode {
  return "eraLabel" in post && "backdrop" in post;
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm8.9 1.9a1.05 1.05 0 1 1 0 2.1a1.05 1.05 0 0 1 0-2.1ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z"
      />
    </svg>
  );
}

function InstagramReelCard({ post }: { post: InstagramPost }) {
  const cinematic = isHistoryEpisode(post);
  const embedSrc = instagramEmbedSrc(post.url, post.id);

  return (
    <article
      className={cn(
        "flex w-[min(88vw,280px)] shrink-0 snap-center flex-col",
        "min-[810px]:w-[min(44vw,300px)]",
        "min-[1200px]:w-[300px]",
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black">
        {cinematic ? (
          <div className="pointer-events-none absolute inset-0 z-0">
            <InstagramReelPoster post={post} />
          </div>
        ) : post.posterSrc ? (
          <img
            src={post.posterSrc}
            alt=""
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : null}

        <div className="absolute inset-0 z-10 overflow-hidden bg-transparent">
          <iframe
            key={embedSrc}
            src={embedSrc}
            title={`Instagram ${post.label}`}
            loading="eager"
            scrolling="no"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="pointer-events-auto absolute left-1/2 top-0 border-0 bg-transparent"
            style={{
              width: "min(340px, 100%)",
              height: `calc(100% + ${EMBED_TOP_CROP_PX}px)`,
              transform: `translate(-50%, -${EMBED_TOP_CROP_PX}px)`,
            }}
          />
        </div>
      </div>

      <a
        href={post.url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 flex min-h-[44px] items-center justify-center text-[#E6A817] transition hover:text-[#f0bc3a]"
        aria-label={`Open ${post.label} on Instagram`}
      >
        <InstagramGlyph className="h-5 w-5" />
      </a>
    </article>
  );
}

type InstagramReelsSectionProps = {
  id?: string;
  title?: string;
  description?: string;
  variant?: "panel" | "bare";
  /** Education home uses {@link HISTORY_SERIES_EPISODES}. */
  posts?: InstagramPost[];
  className?: string;
};

export function InstagramReelsSection({
  id = "history-reels",
  title = "Watch the full story episodes",
  description = "Episodes load inline — scroll the rail or open any post on Instagram.",
  variant = "bare",
  posts = HISTORY_SERIES_EPISODES,
  className,
}: InstagramReelsSectionProps) {
  const rowRef = useDraggableScroll();
  const isPanel = variant === "panel";

  if (posts.length === 0) return null;

  return (
    <section id={id} className={cn("w-full scroll-mt-24", className)}>
      <div
        className={cn(
          isPanel ? "mx-auto w-full max-w-6xl px-6" : "w-full px-[var(--beiza-site-padding-x,1.25rem)]",
        )}
      >
        <div
          className={cn(
            isPanel && "rounded-[24px] border border-white/10 bg-black px-4 py-10 md:px-6",
            !isPanel && "py-8 min-[810px]:py-10",
          )}
        >
          <SectionHeader
            eyebrow="INSTAGRAM SERIES"
            title={title}
            description={description}
            variant="dark"
          />

          <div
            ref={rowRef}
            data-draggable
            className={cn(
              "mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2",
              "pl-[max(0px,calc((100vw-min(88vw,280px))/2-var(--beiza-site-padding-x,1.25rem)))]",
              "pr-[max(1rem,var(--beiza-site-padding-x,1.25rem))]",
              "min-[810px]:gap-4 min-[810px]:pl-0 min-[810px]:pr-0",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {posts.map((post) => (
              <InstagramReelCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
