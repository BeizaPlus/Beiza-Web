/** Studio focal sliders 0–100 (50 = centered) */
export function clampImageOffset(n: number): number {
  return Math.min(100, Math.max(0, n));
}

export type WelcomeImagePan = {
  imageOffsetX: number;
  imageOffsetY: number;
  imageZoom: number;
};

export type CardDimensions = { width: number; height: number };

/** How far the image can move (px) at a given zoom — scales with zoom so high-zoom cards aren't cramped */
export function maxPanPixels(width: number, height: number, zoom: number) {
  const z = Math.max(zoom, 1);
  return {
    x: Math.max(width * (z - 1) * 0.5, width * 0.42),
    y: Math.max(height * (z - 1) * 0.5, height * 0.42),
  };
}

/** Slider 0–100 → pixel translate (50 = no shift) */
export function offsetsToTranslate(
  imageOffsetX: number,
  imageOffsetY: number,
  zoom: number,
  card: CardDimensions,
) {
  const max = maxPanPixels(card.width, card.height, zoom);
  const tx = ((50 - clampImageOffset(imageOffsetX)) / 50) * max.x;
  const ty = ((50 - clampImageOffset(imageOffsetY)) / 50) * max.y;
  return { tx, ty, max };
}

/** Pixel translate → slider values for persistence */
export function translateToOffsets(
  tx: number,
  ty: number,
  zoom: number,
  card: CardDimensions,
): Pick<WelcomeImagePan, "imageOffsetX" | "imageOffsetY"> {
  const max = maxPanPixels(card.width, card.height, zoom);
  return {
    imageOffsetX: clampImageOffset(50 - (tx / max.x) * 50),
    imageOffsetY: clampImageOffset(50 - (ty / max.y) * 50),
  };
}

/**
 * Center-anchored zoom + pixel pan (stable at any zoom).
 * Decouples pan from transform-origin so Edu/Farewell high-zoom cards don't jump or feel capped.
 */
export function welcomeImagePanStyle(pan: WelcomeImagePan, card: CardDimensions) {
  const { tx, ty } = offsetsToTranslate(pan.imageOffsetX, pan.imageOffsetY, pan.imageZoom, card);
  const z = pan.imageZoom;
  return {
    objectPosition: "50% 50%",
    transform: `translate(${tx}px, ${ty}px) scale(${z})`,
    transformOrigin: "50% 50%",
  } as const;
}

export function offsetsFromPointerDrag(
  start: WelcomeImagePan,
  clientX: number,
  clientY: number,
  pointerStartX: number,
  pointerStartY: number,
  card: CardDimensions,
): WelcomeImagePan {
  const { tx: startTx, ty: startTy } = offsetsToTranslate(
    start.imageOffsetX,
    start.imageOffsetY,
    start.imageZoom,
    card,
  );
  const deltaX = clientX - pointerStartX;
  const deltaY = clientY - pointerStartY;
  const offsets = translateToOffsets(startTx + deltaX, startTy + deltaY, start.imageZoom, card);
  return { imageZoom: start.imageZoom, ...offsets };
}
