import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/framer/SectionHeader";
import { InstagramReelPoster } from "@/components/landing/InstagramReelPoster";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { HISTORY_SERIES_EPISODES, type HistorySeriesEpisode } from "@/lib/instagramHistorySeries";
import { cn } from "@/lib/utils";

export type InstagramPost = {
  id: string;
  url: string;
  label: string;
  /** Optional poster image beneath the cinematic frame */
  posterSrc?: string;
  /** Direct video source from scraped dataset */
  videoSrc?: string;
};

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

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="ml-0.5 h-8 w-8 fill-white drop-shadow-md" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function InstagramReelCard({
  post,
  isActive,
  onPlay,
}: {
  post: InstagramPost;
  isActive: boolean;
  onPlay: (node: HTMLDivElement | null) => void;
}) {
  const cinematic = isHistoryEpisode(post);
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isActive || !videoRef.current) return;
    void videoRef.current.play().catch(() => {
      /* Autoplay may be blocked until user interacts with controls */
    });
  }, [isActive, post.id]);

  return (
    <article
      className={cn(
        "flex w-[min(78vw,260px)] shrink-0 snap-center flex-col",
        "min-[768px]:w-[min(34vw,280px)]",
        "min-[1200px]:w-[280px]",
      )}
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-black">
        {post.posterSrc && !isActive ? (
          <img
            src={post.posterSrc}
            alt=""
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : !isActive && cinematic ? (
          <div className="pointer-events-none absolute inset-0 z-0">
            <InstagramReelPoster post={post} />
          </div>
        ) : null}

        <div
          ref={overlayRef}
          className={cn(
            "absolute inset-0 z-10 overflow-hidden",
            isActive ? "bg-black" : "bg-transparent",
          )}
        >
          {isActive ? (
            post.videoSrc ? (
              <video
                ref={videoRef}
                key={post.id}
                src={post.videoSrc}
                poster={post.posterSrc}
                controls
                playsInline
                preload="auto"
                className="relative z-10 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-white/70">
                Video unavailable
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={() => onPlay(overlayRef.current)}
              className="group absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/10 transition hover:bg-black/25"
              aria-label={`Play ${post.label}`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/25 transition group-hover:scale-105 group-hover:bg-black/70">
                <PlayGlyph />
              </span>
            </button>
          )}
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
  description = "Tap play on an episode — only one plays at a time.",
  variant = "bare",
  posts = HISTORY_SERIES_EPISODES,
  className,
}: InstagramReelsSectionProps) {
  const rowRef = useDraggableScroll();
  const isPanel = variant === "panel";
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const playPost = useCallback((postId: string, node: HTMLDivElement | null) => {
    setActivePostId(postId);
    node?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, []);

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
            !isPanel && "py-8 min-[768px]:py-10",
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
              "pl-[max(0px,calc((100vw-min(78vw,260px))/2-var(--beiza-site-padding-x,1.25rem)))]",
              "pr-[max(1rem,var(--beiza-site-padding-x,1.25rem))]",
              "min-[768px]:gap-4 min-[768px]:pl-0 min-[768px]:pr-0",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {posts.map((post) => (
              <InstagramReelCard
                key={post.id}
                post={post}
                isActive={activePostId === post.id}
                onPlay={(node) => playPost(post.id, node)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
