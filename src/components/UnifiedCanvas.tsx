import { useState, useEffect } from "react";
import { usePublicImages } from "@/hooks/usePublicImages";
import { useNavigate, useLocation } from "react-router-dom";
import CanvasGallery, { type GalleryImage } from "./CanvasGallery";

interface UnifiedCanvasProps {
  onImageClick?: (image: any) => void;
}

export const UnifiedCanvas = ({ onImageClick }: UnifiedCanvasProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { images, loading } = usePublicImages();

  // Convert public images to GalleryImage format with true sizes
  const galleryImages: GalleryImage[] = images.map((image) => ({
    id: image.id,
    src: image.src,
    width: 20, // Fixed width - will be overridden by actual image dimensions
    height: 15, // Fixed height - will be overridden by actual image dimensions
    alt: image.alt,
    caption: image.caption,
  }));

  const handleLogoClick = () => {
    navigate('/');
  };

  if (loading)
  {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-transparent flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-transparent">
      {/* Canvas Gallery */}
      <CanvasGallery
        images={galleryImages}
        onImageClick={onImageClick}
      />

      {/* Beiza Logo Navigation (top-left corner) */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 glass-card rounded-xl p-3 hover:bg-white/10 transition-all duration-300 group"
        >
          <img
            src="/Head.svg"
            alt="Beiza Plus"
            className="h-6 w-auto group-hover:scale-110 transition-transform duration-300"
          />
          <img
            src="/Beiza_White.svg"
            alt="Beiza Plus"
            className="h-4 w-auto group-hover:scale-110 transition-transform duration-300"
          />
        </button>
      </div>

      {/* Page-specific content overlays */}
      {location.pathname === '/' && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
          <div className="glass-card rounded-2xl p-6 text-center border border-white/20 shadow-xl">
            <h3 className="text-xl font-serif text-white mb-2">
              <em className="italic text-primary">Turbulent Waves</em> Gallery
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag to explore • Click images to center
            </p>
          </div>
        </div>
      )}

      {/* Instructions - Hidden on mobile to avoid interference */}
      <div className="absolute bottom-8 left-8 z-10 text-white/60 text-sm hidden md:block">
        <p>Drag to pan • Scroll to zoom • Click images to center</p>
      </div>
    </div>
  );
};