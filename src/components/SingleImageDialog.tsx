import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface SingleImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    src: string;
    alt: string;
    caption?: string;
  };
}

export const SingleImageDialog = ({ isOpen, onClose, image }: SingleImageDialogProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (isOpen)
    {
      setImageError(false);
      setImageLoading(true);
      document.body.style.overflow = 'hidden';
    } else
    {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;
    if (event.key === 'Escape')
    {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen)
    {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Close button */}
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20"
        size="icon"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Image container */}
      <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {imageError ? (
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-xl mb-2">Failed to load image</p>
            <p className="text-white/60">The image could not be displayed</p>
          </div>
        ) : (
          <img
            src={image.src}
            alt={image.alt}
            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />
        )}
      </div>

      {/* Image info */}
      {image.caption && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="glass-card rounded-xl p-4 text-center border border-white/20">
            <p className="text-white font-medium mb-1">{image.alt}</p>
            <p className="text-white/80 text-sm">{image.caption}</p>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="absolute top-4 left-4 z-10">
        <div className="glass-card rounded-lg p-3 border border-white/20">
          <p className="text-white/80 text-xs">
            <span className="font-medium">Esc</span> Close
          </p>
        </div>
      </div>
    </div>
  );
};
