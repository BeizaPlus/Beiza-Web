import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export interface DialogImageProps {
  src: string;
  alt: string;
  caption?: string;
  memoirSlug?: string | null;
  memoirTitle?: string | null;
}

interface SingleImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  image?: DialogImageProps;
  images?: DialogImageProps[];
  initialIndex?: number;
}

export const SingleImageDialog = ({ isOpen, onClose, image, images, initialIndex = 0 }: SingleImageDialogProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentImage = images?.[currentIndex] || image;

  useEffect(() => {
    if (isOpen)
    {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (isOpen)
    {
      document.body.style.overflow = 'hidden';
    } else
    {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [currentIndex, currentImage?.src]);

  const hasMultipleImages = images && images.length > 1;
  const hasNext = hasMultipleImages && currentIndex < (images.length - 1);
  const hasPrev = hasMultipleImages && currentIndex > 0;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasNext) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPrev) setCurrentIndex((prev) => prev - 1);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;
    if (event.key === 'Escape')
    {
      onClose();
    } else if (event.key === 'ArrowRight' && hasNext)
    {
      setCurrentIndex(prev => prev + 1);
    } else if (event.key === 'ArrowLeft' && hasPrev)
    {
      setCurrentIndex(prev => prev - 1);
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
  }, [isOpen, hasNext, hasPrev]);

  const handleViewMemoir = () => {
    if (currentImage?.memoirSlug)
    {
      navigate(`/memoirs/${currentImage.memoirSlug}`);
      onClose();
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 transition-colors"
        size="icon"
      >
        <X className="w-5 h-5" />
      </Button>

      {hasPrev && (
        <Button
          onClick={handlePrev}
          className="absolute left-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 transition-colors hidden md:flex"
          size="icon"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

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
            src={currentImage.src}
            alt={currentImage.alt}
            className={`max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />
        )}
      </div>

      {hasNext && (
        <Button
          onClick={handleNext}
          className="absolute right-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 transition-colors hidden md:flex"
          size="icon"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      {/* Image info */}
      {(currentImage.caption || currentImage.memoirSlug || currentImage.alt || hasMultipleImages) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="glass-card rounded-lg p-4 text-center border border-white/20 max-w-md bg-black/60 shadow-lg backdrop-blur-md">
            {currentImage.alt && (
              <p className="text-white font-medium mb-1">{currentImage.alt}</p>
            )}
            {currentImage.caption && (
              <p className="text-white/80 text-sm mb-3">{currentImage.caption}</p>
            )}
            {hasMultipleImages && (
              <p className="text-white/60 text-xs mb-2">
                {currentIndex + 1} of {images.length}
              </p>
            )}
            {currentImage.memoirSlug && (
              <Button
                onClick={handleViewMemoir}
                className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 mt-2"
                size="sm"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {currentImage.memoirTitle ? `View ${currentImage.memoirTitle}` : "View Memoir"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Mobile navigation controls (shown only on small screens) */}
      {hasMultipleImages && (
        <div className="absolute bottom-28 left-0 right-0 z-10 flex justify-between px-4 md:hidden">
          <Button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 disabled:opacity-30 disabled:pointer-events-none"
            size="icon"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleNext}
            disabled={!hasNext}
            className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 disabled:opacity-30 disabled:pointer-events-none"
            size="icon"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="absolute top-4 left-4 z-10 hidden md:block">
        <div className="glass-card rounded-lg p-3 border border-white/20 bg-black/40 backdrop-blur-md">
          <p className="text-white/80 text-xs flex items-center gap-2">
            <span className="font-medium px-1.5 py-0.5 bg-white/10 rounded">Esc</span> Close
            {hasMultipleImages && (
              <>
                <span className="font-medium px-1.5 py-0.5 bg-white/10 rounded ml-2">←</span>
                <span className="font-medium px-1.5 py-0.5 bg-white/10 rounded">→</span> Navigate
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

