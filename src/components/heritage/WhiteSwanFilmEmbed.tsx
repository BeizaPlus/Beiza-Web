import { useState } from "react";
import {
  WHITE_SWAN_FILM_EMBED_URL,
  WHITE_SWAN_FILM_POSTER,
  WHITE_SWAN_FILM_YOUTUBE,
} from "@/lib/heritageWhiteSwan";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
};

export function WhiteSwanFilmEmbed({
  className,
  title = "White Swan — Beiza memorial gathering",
}: Props) {
  const [playing, setPlaying] = useState(false);

  if (!WHITE_SWAN_FILM_EMBED_URL) return null;

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-[12px] border border-border bg-black",
        className,
      )}
    >
      {playing ? (
        <iframe
          src={WHITE_SWAN_FILM_EMBED_URL}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label="Play White Swan film"
        >
          <img
            src={WHITE_SWAN_FILM_POSTER}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
          <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" aria-hidden />
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f5c518] shadow-lg transition group-hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]">
              <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-black" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <span className="sr-only">Play on YouTube — {WHITE_SWAN_FILM_YOUTUBE}</span>
        </button>
      )}
    </div>
  );
}
