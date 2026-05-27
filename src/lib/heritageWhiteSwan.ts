import { BRAND_IMAGES } from "@/lib/brandImages";
import { youtubeEmbedUrl } from "@/lib/youtubeEmbed";

/** White Swan memorial film — [YouTube](https://youtu.be/u5uQZ5AKO5Q) */
export const WHITE_SWAN_FILM_YOUTUBE = "https://youtu.be/u5uQZ5AKO5Q";

export const WHITE_SWAN_FILM_POSTER = BRAND_IMAGES.whiteSwanFilmPoster;

/** fs=0 hides YouTube fullscreen; playsinline keeps video in the card on mobile */
export const WHITE_SWAN_FILM_EMBED_URL =
  youtubeEmbedUrl(WHITE_SWAN_FILM_YOUTUBE, {
    autoplay: "1",
    fs: "0",
    playsinline: "1",
    controls: "1",
  }) ?? "";
