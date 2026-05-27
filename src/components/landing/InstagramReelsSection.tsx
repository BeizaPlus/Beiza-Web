import { SectionHeader } from "@/components/framer/SectionHeader";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { cn } from "@/lib/utils";

type InstagramPost = {
  id: string;
  url: string;
  label: string;
};

/** Visual crop to hide Instagram top chrome (e.g. profile bar) for a more immersive reel rail. */
const EMBED_TOP_CROP_PX = 54;

const INSTAGRAM_POSTS: InstagramPost[] = [
  { id: "DU8xKfXDnxl", url: "https://www.instagram.com/p/DU8xKfXDnxl/", label: "Episode 0" },
  { id: "DYurOfXuasO", url: "https://www.instagram.com/p/DYurOfXuasO/", label: "Episode 1" },
  { id: "DYIJNV7O-s1", url: "https://www.instagram.com/p/DYIJNV7O-s1/", label: "Episode 2" },
  { id: "DX4pN1wOgAy", url: "https://www.instagram.com/p/DX4pN1wOgAy/", label: "Episode 3" },
  { id: "DXjMHBoDkIf", url: "https://www.instagram.com/p/DXjMHBoDkIf/", label: "Episode 4" },
  { id: "DWmbV_QDjWK", url: "https://www.instagram.com/p/DWmbV_QDjWK/", label: "Episode 5" },
];

function embedUrl(url: string) {
  return `${url}embed/captioned/`;
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm8.9 1.9a1.05 1.05 0 1 1 0 2.1a1.05 1.05 0 0 1 0-2.1ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z"
      />
    </svg>
  );
}

type InstagramReelsSectionProps = {
  id?: string;
  title?: string;
  description?: string;
  insetPanel?: boolean;
};

export function InstagramReelsSection({
  id = "history-reels",
  title = "Watch the full story episodes",
  description = "Pure video playback inside Beiza. If you want to interact with comments or profile, tap the Instagram icon on each reel.",
  insetPanel = false,
}: InstagramReelsSectionProps) {
  const rowRef = useDraggableScroll();

  return (
    <section id={id} className="mt-10 w-full md:mt-14">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className={cn("bg-black py-10", insetPanel && "rounded-[24px] border border-white/10 px-4 md:px-6")}>
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
            "mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {INSTAGRAM_POSTS.map((post) => (
            <article key={post.id} className="w-[min(92vw,360px)] shrink-0 snap-start">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={embedUrl(post.url)}
                  title={`Instagram ${post.label}`}
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  style={{
                    border: "none",
                    display: "block",
                    width: "100%",
                    height: `calc(100% + ${EMBED_TOP_CROP_PX}px)`,
                    transform: `translateY(-${EMBED_TOP_CROP_PX}px)`,
                  }}
                />
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-black"
                  aria-label={`Open ${post.label} on Instagram`}
                >
                  <InstagramGlyph />
                  Instagram
                </a>
              </div>
            </article>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

