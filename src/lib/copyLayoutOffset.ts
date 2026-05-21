import type { CSSProperties } from "react";
import { looksLikePxOffset, pxToVh, pxToVw } from "@/lib/layoutOffsetUnits";

/** Copy block shift — vw / vh (viewport-relative) */
export type CopyOffsetFields = {
  offsetX: number;
  offsetY: number;
  copyLift?: number;
};

export const COPY_OFFSET_LIMITS = {
  offsetX: { min: -20, max: 40, step: 0.5 },
  offsetY: { min: -30, max: 30, step: 0.5 },
  copyLift: { min: 0, max: 20, step: 0.5 },
} as const;

export function migrateCopyOffsetFields<T extends CopyOffsetFields>(
  partial: Partial<T>,
): Partial<T> {
  const next = { ...partial };
  if (typeof next.offsetX === "number" && looksLikePxOffset(next.offsetX)) {
    next.offsetX = pxToVw(next.offsetX) as T["offsetX"];
  }
  if (typeof next.offsetY === "number" && looksLikePxOffset(next.offsetY)) {
    next.offsetY = pxToVh(next.offsetY) as T["offsetY"];
  }
  if (typeof next.copyLift === "number" && looksLikePxOffset(next.copyLift)) {
    next.copyLift = pxToVh(next.copyLift) as T["copyLift"];
  }
  return next;
}

export function clampCopyOffsetFields<T extends CopyOffsetFields>(frame: T): T {
  const { offsetX, offsetY, copyLift } = COPY_OFFSET_LIMITS;
  return {
    ...frame,
    offsetX: Math.min(offsetX.max, Math.max(offsetX.min, frame.offsetX)),
    offsetY: Math.min(offsetY.max, Math.max(offsetY.min, frame.offsetY)),
    copyLift:
      frame.copyLift === undefined
        ? undefined
        : Math.min(copyLift.max, Math.max(copyLift.min, frame.copyLift)),
  };
}

export function copyOffsetStyle(frame: CopyOffsetFields): CSSProperties {
  const parts: string[] = [];
  if (frame.offsetX !== 0 || frame.offsetY !== 0) {
    parts.push(`translate(${frame.offsetX}vw, ${frame.offsetY}vh)`);
  }
  if (frame.copyLift && frame.copyLift > 0) {
    parts.push(`translateY(-${frame.copyLift}vh)`);
  }
  return {
    transform: parts.length > 0 ? parts.join(" ") : undefined,
  };
}
