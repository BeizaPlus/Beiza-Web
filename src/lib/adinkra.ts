/** Circle identity symbols — one per family circle when `adinkra_id` is set. */

export type AdinkraSymbol = {
  id: string;
  name: string;
  meaning: string;
  image: string;
};

/** Default directory / fallback card visual (warm stamp — not a stick-figure tree). */
export const CIRCLE_CARD_STAMP_IMAGE = "/images/beiza-adinkra-stamp-hand.png";

export const ADINKRA_SYMBOLS: AdinkraSymbol[] = [
  {
    id: "sankofa",
    name: "Sankofa",
    meaning: "Return and fetch it — learn from the past",
    image: "/images/adinkra/sankofa.png",
  },
  {
    id: "gye-nyame",
    name: "Gye Nyame",
    meaning: "Except God — supreme power and permanence",
    image: "/images/adinkra/gye-nyame.png",
  },
  {
    id: "duafe",
    name: "Duafe",
    meaning: "Beauty, care, and femininity",
    image: "/images/adinkra/duafe.png",
  },
  {
    id: "ese-ne-tekrema",
    name: "Ese Ne Tekrema",
    meaning: "The teeth and tongue — friendship and interdependence",
    image: "/images/adinkra/ese-ne-tekrema.png",
  },
  {
    id: "nyame-biribi-wo-soro",
    name: "Nyame Biribi Wo Soro",
    meaning: "God is in the heavens — hope",
    image: "/images/adinkra/nyame-biribi.png",
  },
  {
    id: "funtunfunefu",
    name: "Funtunfunefu",
    meaning: "Siamese crocodiles — democracy and unity",
    image: "/images/adinkra/funtunfunefu.png",
  },
  {
    id: "akoma",
    name: "Akoma",
    meaning: "The heart — patience and goodwill",
    image: "/images/adinkra/akoma.png",
  },
  {
    id: "aya",
    name: "Aya",
    meaning: "The fern — endurance and resourcefulness",
    image: "/images/adinkra/aya.png",
  },
];

const byId = new Map(ADINKRA_SYMBOLS.map((s) => [s.id, s]));

export function getAdinkraById(id: string | null | undefined): AdinkraSymbol | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

export function pickRandomAdinkra(): AdinkraSymbol {
  return ADINKRA_SYMBOLS[Math.floor(Math.random() * ADINKRA_SYMBOLS.length)]!;
}

/**
 * Card background image.
 * Directory cards use the cultural stamp; when per-symbol PNGs exist under `/images/adinkra/`,
 * switch to `getAdinkraById(adinkraId)?.image` for assigned circles.
 */
export function getCircleCardImage(_adinkraId?: string | null | undefined): string {
  return CIRCLE_CARD_STAMP_IMAGE;
}

/** Enter gate copy: "Sankofa — return and fetch it" */
export function formatAdinkraCaption(symbol: AdinkraSymbol): string {
  const short = symbol.meaning.split("—")[0]?.trim() ?? symbol.meaning;
  return `${symbol.name} — ${short.charAt(0).toLowerCase()}${short.slice(1)}`;
}

export const DEFAULT_ADINKRA = ADINKRA_SYMBOLS[0]!;
