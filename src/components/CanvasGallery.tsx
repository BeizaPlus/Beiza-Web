import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';

import CanvasImage from './CanvasImage';
import { layoutArtwork, PIXELS_PER_CM } from '../lib/geometry';
import { TouchZoom } from '../lib/TouchZoom';

const SIDEBAR_WIDTH = 420;
const DEFAULT_ZOOM = 1.1;

export interface GalleryImage {
  id: string;
  src: string;
  width: number; // in cm
  height: number; // in cm
  alt: string;
  caption?: string;
}

export interface CanvasGalleryProps {
  images: GalleryImage[];
  onImageClick?: (image: GalleryImage) => void;
  resetViewToken?: number;
}

const CanvasGallery: React.FC<CanvasGalleryProps> = ({
  images,
  onImageClick,
  resetViewToken = 0,
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const touchZoomRef = useRef<TouchZoom | null>(null);

  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [lastMove, setLastMove] = useState(0);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (frameRef.current)
    {
      touchZoomRef.current = new TouchZoom(frameRef.current);

      // Set initial positioning and zoom
      touchZoomRef.current.center = [0, 0];
      touchZoomRef.current.zoom = DEFAULT_ZOOM;
      setCenter(touchZoomRef.current.center as [number, number]);
      setZoom(touchZoomRef.current.zoom);
      void touchZoomRef.current.moveTo(
        touchZoomRef.current.center,
        touchZoomRef.current.zoom
      );

      const unsubscribe = touchZoomRef.current.onMove((manual) => {
        if (touchZoomRef.current)
        {
          setCenter(touchZoomRef.current.center);
          setZoom(touchZoomRef.current.zoom);

          if (manual)
          {
            if (document.activeElement instanceof HTMLElement)
            {
              document.activeElement.blur();
            }
            setLastMove(Date.now());
            setSelected(null);
          }
        }
      });

      return () => {
        unsubscribe();
        touchZoomRef.current?.destroy();
      };
    }
  }, []);

  useEffect(() => {
    if (!touchZoomRef.current) return;
    void touchZoomRef.current.moveTo([0, 0], DEFAULT_ZOOM);
    setSelected(null);
  }, [resetViewToken]);

  function getTransform(pos: number[], center: number[], zoom: number): string {
    // Calculate parallax offset based on position and center
    const parallaxFactor = 0.3; // How much parallax effect
    const parallaxOffsetX = (pos[0] - center[0] / PIXELS_PER_CM) * parallaxFactor;
    const parallaxOffsetY = (pos[1] - center[1] / PIXELS_PER_CM) * parallaxFactor;

    return `scale(${(zoom * 100).toFixed(3)}%) translate(
      ${pos[0] * PIXELS_PER_CM - center[0] + parallaxOffsetX}px,
      ${pos[1] * PIXELS_PER_CM - center[1] + parallaxOffsetY}px
    )`;
  }

  /** Adaptively adjust image size based on visibility and screen size. */
  function getDetail(
    image: GalleryImage,
    pos: number[],
    center: number[],
    zoom: number
  ): number {
    if (!frameRef.current) return 400;

    const pxBounding = [
      zoom * ((pos[0] - image.width / 2) * PIXELS_PER_CM - center[0]),
      zoom * ((pos[0] + image.width / 2) * PIXELS_PER_CM - center[0]),
      zoom * ((pos[1] - image.height / 2) * PIXELS_PER_CM - center[1]),
      zoom * ((pos[1] + image.height / 2) * PIXELS_PER_CM - center[1]),
    ];
    const windowSize = [
      -frameRef.current.clientWidth / 2,
      frameRef.current.clientWidth / 2,
      -frameRef.current.clientHeight / 2,
      frameRef.current.clientHeight / 2,
    ];
    const physicalWidth =
      window.devicePixelRatio * zoom * image.width * PIXELS_PER_CM;

    // Not visible, outside the window.
    if (
      pxBounding[0] > 1.15 * windowSize[1] ||
      pxBounding[1] < 1.15 * windowSize[0] ||
      pxBounding[2] > 1.15 * windowSize[3] ||
      pxBounding[3] < 1.15 * windowSize[2]
    )
    {
      return 400;
    } else if (physicalWidth < 400)
    {
      return 400;
    } else if (physicalWidth < 800)
    {
      return 800;
    } else
    {
      return 4000; // full size
    }
  }

  /** Handle when an image is selected for more details. */
  function handleSelect(image: GalleryImage, pos: [number, number]) {
    if (lastMove < Date.now() - 50 && !touchZoomRef.current?.isPinching)
    {
      if (!frameRef.current) return;

      const sidebarOffset =
        frameRef.current.clientWidth > SIDEBAR_WIDTH ? SIDEBAR_WIDTH : 0;
      const desiredZoom =
        0.8 *
        Math.min(
          frameRef.current.clientHeight / (image.height * PIXELS_PER_CM),
          (frameRef.current.clientWidth - sidebarOffset) /
          (image.width * PIXELS_PER_CM)
        );

      void touchZoomRef.current?.moveTo(
        [
          pos[0] * PIXELS_PER_CM + (0.5 * sidebarOffset) / desiredZoom,
          pos[1] * PIXELS_PER_CM,
        ],
        desiredZoom
      );
      setSelected(image);
      onImageClick?.(image);
    }
  }

  // Convert images to artwork format for layout
  const artwork = useMemo(() =>
    images.map(img => ({
      id: img.id,
      dimwidth: img.width,
      dimheight: img.height,
    })), [images]
  );

  const positions = useMemo(() => layoutArtwork(artwork), [artwork]);

  return (
    <main className="absolute inset-0 overflow-hidden bg-background">
      <div
        ref={frameRef}
        className="w-full h-full flex justify-center items-center touch-none"
      >
        {images.map((image, i) => {
          const detail = getDetail(image, positions[i], center, zoom);
          const depth = Math.abs(positions[i][0]) + Math.abs(positions[i][1]); // Calculate depth
          const depthOpacity = Math.max(0.7, 1 - (depth / 100)); // Fade based on distance from center

          return (
            <motion.div
              key={image.id}
              className="absolute"
              style={{
                transform: getTransform(positions[i], center, zoom),
                opacity: depthOpacity,
                zIndex: Math.floor(depth / 10), // Layer based on depth
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: depthOpacity }}
              transition={{ duration: 0.3 }}
            >
              <button
                className="cursor-default"
                onClick={() => handleSelect(image, positions[i])}
                onTouchEnd={() => handleSelect(image, positions[i])}
              >
                <CanvasImage
                  image={image}
                  detail={detail}
                  grayed={Boolean(selected) && selected !== image}
                />
              </button>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
};

export default CanvasGallery;
