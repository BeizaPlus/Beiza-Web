import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CanvasGallery, { type GalleryImage } from "./CanvasGallery";
import { useGalleryAssets } from "@/hooks/usePublicContent";

interface UnifiedCanvasProps {
  onImageClick?: (image: any) => void;
  resetViewToken?: number;
}

export const UnifiedCanvas = ({ onImageClick, resetViewToken = 0 }: UnifiedCanvasProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { images, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useGalleryAssets();

  const galleryImages: GalleryImage[] = useMemo(
    () =>
      images.map((image) => ({
        id: image.id,
        src: image.src,
        width: 20,
        height: 15,
        alt: image.alt,
        caption: image.caption ?? undefined,
        memoirSlug: image.memoirSlug ?? undefined,
        memoirTitle: image.memoirTitle ?? undefined,
      })),
    [images],
  );

  const handleLogoClick = () => {
    navigate("/");
  };

  if (isLoading && galleryImages.length === 0) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-transparent">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-white">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-transparent">
      <CanvasGallery images={galleryImages} onImageClick={onImageClick} resetViewToken={resetViewToken} />

      <div className="absolute left-4 top-4 z-20">
        <button
          onClick={handleLogoClick}
          className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-white/10"
        >
          <img
            src="/Head.svg"
            alt="Beiza Plus"
            className="h-6 w-auto transition-transform duration-300 group-hover:scale-110"
          />
          <img
            src="/Beiza_White.svg"
            alt="Beiza Plus"
            className="h-4 w-auto transition-transform duration-300 group-hover:scale-110"
          />
        </button>
      </div>

      {location.pathname === "/" && (
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform z-10 md:block">
          <div className="glass-card rounded-2xl border border-white/20 p-6 text-center shadow-xl">
            <h3 className="mb-2 text-xl font-serif text-white">
              <em className="italic text-primary">Turbulent Waves</em> Gallery
            </h3>
            <p className="text-sm text-muted-foreground">Drag to explore • Click images to center</p>
          </div>
        </div>
      )}

      {hasNextPage ? (
        <div className="absolute bottom-8 right-8 z-20">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full bg-white/10 px-5 py-2 text-sm text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isFetchingNextPage ? "Loading…" : "Load more images"}
          </button>
        </div>
      ) : null}

      <div className="absolute bottom-8 left-8 z-10 hidden text-sm text-white/60 md:block">
        <p>Drag to pan • Scroll to zoom • Click images to center</p>
      </div>
    </div>
  );
};