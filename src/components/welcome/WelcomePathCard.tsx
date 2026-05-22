import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { copyOffsetStyle } from "@/lib/copyLayoutOffset";
import { cn } from "@/lib/utils";
import { welcomePathIconIdleClass } from "@/lib/welcomePathIconStyles";
import {
  offsetsFromPointerDrag,
  welcomeImagePanStyle,
  type CardDimensions,
} from "@/lib/welcomeImagePan";

export type WelcomePathCardProps = {
  to: string;
  label: string;
  title: string;
  subtitle: string;
  meta: string;
  icon: LucideIcon;
  iconHoverFgClass: string;
  iconHoverBgClass?: string;
  iconClass?: string;
  backgroundImage?: string;
  backgroundImageAlt?: string;
  backgroundGradient?: string;
  featured?: boolean;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  iconOffsetY?: number;
  copyOffsetX?: number;
  copyOffsetY?: number;
  copyLift?: number;
  showIconCircleBg?: boolean;
  disableNavigation?: boolean;
  studioImageDrag?: boolean;
  onImagePositionLive?: (position: { imageOffsetX: number; imageOffsetY: number }) => void;
  onImagePositionCommit?: (position: { imageOffsetX: number; imageOffsetY: number }) => void;
  /** Full-viewport scroll section — fills parent height */
  layout?: "grid" | "scroll";
};

const PHOTO_OVERLAY =
  "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.95) 100%)";

/** Portrait 2:3 at every tier — matches desktop card proportion */
const CARD_SURFACE_GRID =
  "group relative aspect-[2/3] w-full min-w-0 max-w-full overflow-hidden rounded-[10px] border-0 outline-none transition-[filter] duration-500 max-[809px]:mx-auto max-[809px]:max-w-[min(20rem,calc(100vw-1.5rem))] min-[810px]:min-h-[260px] min-[1200px]:min-h-[380px] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

const CARD_SURFACE_SCROLL =
  "group relative h-full min-h-0 w-full max-w-lg overflow-hidden rounded-[10px] border-0 outline-none transition-[filter] duration-500 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

function readCardSize(el: HTMLElement | null): CardDimensions {
  if (!el) return { width: 1, height: 1 };
  const r = el.getBoundingClientRect();
  return { width: Math.max(r.width, 1), height: Math.max(r.height, 1) };
}

export function WelcomePathCard({
  to,
  title,
  subtitle,
  meta,
  icon: Icon,
  iconHoverFgClass,
  iconHoverBgClass,
  iconClass = "h-5 w-5",
  backgroundImage,
  backgroundImageAlt = "",
  backgroundGradient,
  imageZoom = 1,
  imageOffsetX = 50,
  imageOffsetY = 50,
  iconOffsetY = 8,
  copyOffsetX = 0,
  copyOffsetY = 0,
  copyLift = 0,
  showIconCircleBg = true,
  disableNavigation = false,
  studioImageDrag = false,
  onImagePositionLive,
  onImagePositionCommit,
  layout = "grid",
}: WelcomePathCardProps) {
  const cardSurfaceClass = layout === "scroll" ? CARD_SURFACE_SCROLL : CARD_SURFACE_GRID;
  const iconTopPct = Math.min(100, Math.max(0, iconOffsetY));
  const cardRef = useRef<HTMLDivElement | HTMLAnchorElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    imageOffsetX: number;
    imageOffsetY: number;
    imageZoom: number;
    moved: boolean;
    lastLiveAt: number;
  } | null>(null);

  const applyPanToImg = (x: number, y: number, zoom: number) => {
    const el = imgRef.current;
    const card = readCardSize(cardRef.current);
    if (!el) return;
    const style = welcomeImagePanStyle({ imageOffsetX: x, imageOffsetY: y, imageZoom: zoom }, card);
    el.style.objectPosition = style.objectPosition;
    el.style.transform = style.transform;
    el.style.transformOrigin = style.transformOrigin;
  };

  useEffect(() => {
    if (!dragRef.current) {
      applyPanToImg(imageOffsetX, imageOffsetY, imageZoom);
    }
  }, [imageOffsetX, imageOffsetY, imageZoom]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!dragRef.current) applyPanToImg(imageOffsetX, imageOffsetY, imageZoom);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [imageOffsetX, imageOffsetY, imageZoom]);

  const panAtPointer = (clientX: number, clientY: number) => {
    const drag = dragRef.current;
    if (!drag || !cardRef.current) return null;
    const card = readCardSize(cardRef.current);
    const next = offsetsFromPointerDrag(
      {
        imageOffsetX: drag.imageOffsetX,
        imageOffsetY: drag.imageOffsetY,
        imageZoom: drag.imageZoom,
      },
      clientX,
      clientY,
      drag.startX,
      drag.startY,
      card,
    );
    const moved =
      Math.abs(next.imageOffsetX - drag.imageOffsetX) > 0.05 ||
      Math.abs(next.imageOffsetY - drag.imageOffsetY) > 0.05;
    return { ...next, moved };
  };

  const endDrag = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const last = panAtPointer(e.clientX, e.clientY);
    if (last && drag.moved) {
      onImagePositionCommit?.({
        imageOffsetX: last.imageOffsetX,
        imageOffsetY: last.imageOffsetY,
      });
    }

    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const onPhotoPointerDown = (e: React.PointerEvent) => {
    if (!studioImageDrag || !backgroundImage) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      imageOffsetX,
      imageOffsetY,
      imageZoom,
      moved: false,
      lastLiveAt: 0,
    };
    if (imgRef.current) imgRef.current.style.transition = "none";
  };

  const onPhotoPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const next = panAtPointer(e.clientX, e.clientY);
    if (!next) return;
    if (next.moved) drag.moved = true;
    applyPanToImg(next.imageOffsetX, next.imageOffsetY, next.imageZoom);

    const now = performance.now();
    if (onImagePositionLive && now - drag.lastLiveAt > 48) {
      drag.lastLiveAt = now;
      onImagePositionLive({
        imageOffsetX: next.imageOffsetX,
        imageOffsetY: next.imageOffsetY,
      });
    }
  };

  const studioPointerHandlers = studioImageDrag
    ? {
        onPointerDown: onPhotoPointerDown,
        onPointerMove: onPhotoPointerMove,
        onPointerUp: endDrag,
        onPointerCancel: endDrag,
      }
    : {};

  const cardSize = readCardSize(cardRef.current);
  const imageStyle = welcomeImagePanStyle({ imageOffsetX, imageOffsetY, imageZoom }, cardSize);

  const body: ReactNode = (
    <>
      {backgroundImage ? (
        <img
          ref={imgRef}
          src={backgroundImage}
          alt={backgroundImageAlt}
          className={cn(
            "pointer-events-none absolute inset-0 z-0 h-full w-full object-cover grayscale group-hover:grayscale-0",
            "transition-[filter] duration-500",
          )}
          style={imageStyle}
          loading="eager"
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0 z-0 grayscale transition-[filter] duration-500 group-hover:grayscale-0"
          style={{ background: backgroundGradient ?? "linear-gradient(160deg, #2a2622 0%, #121010 100%)" }}
          aria-hidden
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: PHOTO_OVERLAY }}
        aria-hidden
      />

      <span
        className={cn(
          "absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-center shadow-none",
          studioImageDrag && "pointer-events-none",
          "transition-colors duration-500",
          welcomePathIconIdleClass,
          iconHoverFgClass,
          showIconCircleBg && iconHoverBgClass,
          showIconCircleBg ? "h-11 w-11 rounded-full bg-white/10" : "bg-transparent",
        )}
        style={{ top: showIconCircleBg ? `calc(${iconTopPct}% - 1.375rem)` : `calc(${iconTopPct}% - 0.625rem)` }}
      >
        <Icon className={cn(iconClass, "text-current", !showIconCircleBg && "h-6 w-6")} aria-hidden />
      </span>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 px-4 pb-5 pt-16 text-left sm:px-5 sm:pb-6",
          studioImageDrag && "pointer-events-none",
        )}
        style={copyOffsetStyle({ offsetX: copyOffsetX, offsetY: copyOffsetY, copyLift })}
      >
        <h2 className="text-[1.15rem] font-semibold leading-tight text-white sm:text-[1.35rem] md:text-[1.5rem] lg:text-[1.65rem]">
          {title}
        </h2>
        <p className="mt-2 min-w-0 w-full break-words text-[13px] font-normal leading-snug text-white/90 sm:text-sm">
          {subtitle}
        </p>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-white/65">{meta}</p>
      </div>
    </>
  );

  if (disableNavigation) {
    return (
      <div
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className={cn(cardSurfaceClass, studioImageDrag && "touch-none cursor-grab active:cursor-grabbing")}
        {...studioPointerHandlers}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      ref={cardRef as React.RefObject<HTMLAnchorElement>}
      to={to}
      onClick={(e) => {
        if (dragRef.current?.moved) e.preventDefault();
      }}
      className={cn(cardSurfaceClass, studioImageDrag && "touch-none cursor-grab active:cursor-grabbing")}
      {...studioPointerHandlers}
    >
      {body}
    </Link>
  );
}
