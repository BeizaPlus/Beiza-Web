import React, { useState } from 'react';
import imageStore from '../lib/ImageStore';
import { PIXELS_PER_CM } from '../lib/geometry';

// This is a transparent 1x1 PNG, used as a placeholder for images that are
// still loading.
const TRANSPARENT_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

export interface CanvasImageProps {
  image: {
    id: string;
    src: string;
    width: number; // in cm
    height: number; // in cm
    alt: string;
    caption?: string;
  };
  detail: number;
  grayed?: boolean;
  onClick?: () => void;
}

const CanvasImage: React.FC<CanvasImageProps> = ({
  image,
  detail,
  grayed = false,
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({ width: 20, height: 15 });

  const imageUrl = imageStore.requestSize(image.src, detail);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    // Calculate dimensions maintaining aspect ratio
    const maxWidth = 30; // cm
    const maxHeight = 25; // cm

    let width = maxWidth;
    let height = maxWidth / aspectRatio;

    if (height > maxHeight)
    {
      height = maxHeight;
      width = maxHeight * aspectRatio;
    }

    setImageDimensions({ width, height });
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div className="canvas-image relative">
      {imageLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/10 rounded-lg"
          style={{
            width: `${imageDimensions.width * PIXELS_PER_CM}px`,
            height: `${imageDimensions.height * PIXELS_PER_CM}px`,
          }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {imageError ? (
        <div
          className="inline-block object-contain bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white/60"
          style={{
            width: `${imageDimensions.width * PIXELS_PER_CM}px`,
            height: `${imageDimensions.height * PIXELS_PER_CM}px`,
          }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🖼️</div>
            <div className="text-xs">Failed to load</div>
          </div>
        </div>
      ) : (
        <img
          className={`inline-block object-contain bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-500 ${grayed ? 'opacity-40' : 'hover:shadow-glow-lg'
            } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            width: `${imageDimensions.width * PIXELS_PER_CM}px`,
            height: `${imageDimensions.height * PIXELS_PER_CM}px`,
          }}
          draggable={false}
          src={imageUrl || TRANSPARENT_PNG}
          alt={image.alt}
          onClick={onClick}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default CanvasImage;
