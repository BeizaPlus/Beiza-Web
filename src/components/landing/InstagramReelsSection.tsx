import { useState } from "react";
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
};

/** Crop Instagram embed chrome without internal scrollbars. */
const EMBED_TOP_CROP_PX = 54;

function isHistoryEpisode(post: InstagramPost): post is HistorySeriesEpisode {
  return "eraLabel" in post && "backdrop" in post;
}

function embedUrl(url: string) {
  return `${url.replace(/\/$/, "")}/embed/captioned/`;
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
    <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7 fill-white" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function InstagramReelCard({ post }: { post: InstagramPost }) {
  const [playing, setPlaying] = useState(false);
  const cinematic = isHistoryEpisode(post);

  return (
    <article className="flex w-[min(85vw,300px)] shrink-0 snap-start flex-col sm:w-[min(42vw,300px)]">
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-2xl border bg-black",
          cinematic ? "border-[#E6A817]/25 shadow-[0_20px_50px_-24px_rgba(230,168,23,0.45)]" : "border-white/10",
        )}
      >
        {playing ? (
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src={embedUrl(post.url)}
              title={`Instagram ${post.label}`}
              loading="lazy"
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              className="pointer-events-auto absolute left-0 top-0 w-full border-0"
              style={{
                height: `calc(100% + ${EMBED_TOP_CROP_PX}px)`,
                transform: `translateY(-${EMBED_TOP_CROP_PX}px)`,
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex w-full items-center justify-center"
            aria-label={`Play ${post.label}`}
          >
            {cinematic ? (
              <InstagramReelPoster post={post} />
            ) : post.posterSrc ? (
              <>
                <img
                  src={post.posterSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/35" aria-hidden />
              </>
            ) : (
              <div className="absolute inset-0 bg-[#0a0a0a]" aria-hidden />
            )}

            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 bg-black/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-[3px] transition group-hover:scale-105">
              <PlayGlyph />
            </span>
          </button>
        )}
      </div>

      <a
        href={post.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex justify-center text-[#E6A817] transition hover:text-[#f0bc3a]"
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
  /** Required — education home passes {@link HISTORY_SERIES_EPISODES}; never reuse on farewell. */
  posts: InstagramPost[];
  className?: string;
};

export function InstagramReelsSection({
  id = "history-reels",
  title = "Watch the full story episodes",
  description = "Tap play to watch each episode here, or open the post on Instagram.",
  variant = "bare",
  posts,
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
            !isPanel && "py-8 md:py-10",
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
              "mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1",
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
