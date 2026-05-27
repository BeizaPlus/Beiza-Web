import type { InstagramPost } from "@/components/landing/InstagramReelsSection";
import { MEDIA_ASSETS } from "@/lib/mediaAssets";

/** Education-guide reel card — BEIZA mark + era hook for Instagram series. */
export type HistorySeriesEpisode = InstagramPost & {
  guideLabel: string;
  cardTitle: string;
  cardSubtitle: string;
  eraLabel: string;
  placeLabel: string;
  /** CSS background layers for poster art direction */
  backdrop: string;
  glow: string;
};

const REEL_TEXTURE = MEDIA_ASSETS.home.historySeriesReelTexture.src;

/** Episode 0 — OpenAI poster trial (approve before batch-generating the rest). */
const REEL_EP00_POSTER = "/images/beiza-history-series-reel-ep00-dvgzckrcje8.png";

/**
 * Chloe vs History reels — scraped 2026-05-27.
 * Source: dataset_instagram-reel-scraper (12 posts, channel order).
 */
export const HISTORY_SERIES_EPISODES: HistorySeriesEpisode[] = [
  {
    id: "DVGZcKrCJE8",
    url: "https://www.instagram.com/p/DVGZcKrCJE8/",
    label: "Episode 1",
    guideLabel: "Guide 01",
    cardTitle: "Ancient Egypt",
    cardSubtitle: "Temples & tombs",
    eraLabel: "Ancient world",
    placeLabel: "Nile civilization",
    backdrop:
      "radial-gradient(ellipse 130% 100% at 0% 0%, #4a3a18 0%, #181208 45%, #050505 100%)",
    glow: "radial-gradient(ellipse 85% 65% at 80% 20%, rgba(255,190,80,0.2) 0%, transparent 52%)",
    posterSrc: REEL_EP00_POSTER,
  },
  {
    id: "DU8xKfXDnxl",
    url: "https://www.instagram.com/p/DU8xKfXDnxl/",
    label: "Episode 2",
    guideLabel: "Guide 02",
    cardTitle: "Tudor London",
    cardSubtitle: "Streets of smoke",
    eraLabel: "Early modern",
    placeLabel: "England",
    backdrop:
      "radial-gradient(ellipse 125% 95% at 0% 0%, #2a2420 0%, #100c0a 48%, #050505 100%)",
    glow: "radial-gradient(ellipse 80% 60% at 75% 25%, rgba(180,120,80,0.18) 0%, transparent 50%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DX4pN1wOgAy",
    url: "https://www.instagram.com/p/DX4pN1wOgAy/",
    label: "Episode 3",
    guideLabel: "Guide 03",
    cardTitle: "Marathon",
    cardSubtitle: "Ancient Greece",
    eraLabel: "Classical era",
    placeLabel: "Running legend",
    backdrop:
      "radial-gradient(ellipse 125% 95% at 0% 0%, #283028 0%, #0c100c 48%, #050505 100%)",
    glow: "radial-gradient(ellipse 80% 60% at 78% 28%, rgba(120,180,140,0.16) 0%, transparent 50%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DVBDq7giDrm",
    url: "https://www.instagram.com/p/DVBDq7giDrm/",
    label: "Episode 4",
    guideLabel: "Guide 04",
    cardTitle: "Victorian London",
    cardSubtitle: "Top hat era",
    eraLabel: "19th century",
    placeLabel: "Gaslit streets",
    backdrop:
      "radial-gradient(ellipse 125% 95% at 0% 0%, #1e1c24 0%, #0a0a10 50%, #040404 100%)",
    glow: "radial-gradient(ellipse 75% 55% at 72% 25%, rgba(140,130,180,0.15) 0%, transparent 48%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DXKhOg4jtNl",
    url: "https://www.instagram.com/p/DXKhOg4jtNl/",
    label: "Episode 5",
    guideLabel: "Guide 05",
    cardTitle: "History deep dive",
    cardSubtitle: "Extended episode",
    eraLabel: "Time travel",
    placeLabel: "Chloe vs History",
    backdrop:
      "radial-gradient(ellipse 130% 100% at 0% 0%, #3a2818 0%, #140c08 44%, #050505 100%)",
    glow: "radial-gradient(ellipse 90% 70% at 82% 18%, rgba(230,168,23,0.2) 0%, transparent 52%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DWRoDDDiGqX",
    url: "https://www.instagram.com/p/DWRoDDDiGqX/",
    label: "Episode 6",
    guideLabel: "Guide 06",
    cardTitle: "English mystery",
    cardSubtitle: "Famous case",
    eraLabel: "Victorian",
    placeLabel: "Detective trail",
    backdrop:
      "radial-gradient(ellipse 125% 95% at 0% 0%, #242018 0%, #0c0a08 46%, #050505 100%)",
    glow: "radial-gradient(ellipse 85% 70% at 75% 22%, rgba(200,160,100,0.18) 0%, transparent 52%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DVJ03NXjr9-",
    url: "https://www.instagram.com/p/DVJ03NXjr9-/",
    label: "Episode 7",
    guideLabel: "Guide 07",
    cardTitle: "French Revolution",
    cardSubtitle: "Paris unrest",
    eraLabel: "Revolution",
    placeLabel: "Liberté",
    backdrop:
      "radial-gradient(ellipse 125% 95% at 0% 0%, #281820 0%, #10080c 48%, #050505 100%)",
    glow: "radial-gradient(ellipse 80% 60% at 78% 28%, rgba(200,80,80,0.16) 0%, transparent 50%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DV4BMjpjuFr",
    url: "https://www.instagram.com/p/DV4BMjpjuFr/",
    label: "Episode 8",
    guideLabel: "Guide 08",
    cardTitle: "Dancing plague",
    cardSubtitle: "Strasbourg",
    eraLabel: "Medieval mystery",
    placeLabel: "Mass hysteria",
    backdrop:
      "radial-gradient(ellipse 125% 95% at 0% 0%, #2a3040 0%, #0c0e14 50%, #040404 100%)",
    glow: "radial-gradient(ellipse 75% 55% at 72% 25%, rgba(120,150,200,0.15) 0%, transparent 48%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DVli3L3iMht",
    url: "https://www.instagram.com/p/DVli3L3iMht/",
    label: "Episode 9",
    guideLabel: "Guide 09",
    cardTitle: "Ice age",
    cardSubtitle: "Frozen world",
    eraLabel: "Prehistory",
    placeLabel: "Mammoth steppe",
    backdrop:
      "radial-gradient(ellipse 125% 95% at 0% 0%, #1a2838 0%, #081018 48%, #050505 100%)",
    glow: "radial-gradient(ellipse 80% 60% at 75% 25%, rgba(140,180,220,0.18) 0%, transparent 50%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DX92yFaOOkm",
    url: "https://www.instagram.com/p/DX92yFaOOkm/",
    label: "Episode 10",
    guideLabel: "Guide 10",
    cardTitle: "Woodstock",
    cardSubtitle: "1969",
    eraLabel: "Counterculture",
    placeLabel: "Festival fields",
    backdrop:
      "radial-gradient(ellipse 130% 100% at 0% 0%, #2a3810 0%, #101808 44%, #050505 100%)",
    glow: "radial-gradient(ellipse 90% 75% at 85% 18%, rgba(120,200,80,0.22) 0%, transparent 55%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DYurOfXuasO",
    url: "https://www.instagram.com/p/DYurOfXuasO/",
    label: "Episode 11",
    guideLabel: "Guide 11",
    cardTitle: "Gold rush",
    cardSubtitle: "San Francisco",
    eraLabel: "American west",
    placeLabel: "1849 dreams",
    backdrop:
      "radial-gradient(ellipse 130% 100% at 0% 0%, #4a3810 0%, #1a1408 44%, #050403 100%)",
    glow: "radial-gradient(ellipse 90% 75% at 82% 20%, rgba(255,180,60,0.28) 0%, transparent 58%)",
    posterSrc: REEL_TEXTURE,
  },
  {
    id: "DYIJNV7O-s1",
    url: "https://www.instagram.com/p/DYIJNV7O-s1/",
    label: "Episode 12",
    guideLabel: "Guide 12",
    cardTitle: "Swinging London",
    cardSubtitle: "1960s",
    eraLabel: "Modern era",
    placeLabel: "Mod culture",
    backdrop:
      "radial-gradient(ellipse 125% 95% at 0% 0%, #302818 0%, #120e0c 46%, #050505 100%)",
    glow: "radial-gradient(ellipse 85% 65% at 78% 22%, rgba(230,168,23,0.2) 0%, transparent 52%)",
    posterSrc: REEL_TEXTURE,
  },
];
