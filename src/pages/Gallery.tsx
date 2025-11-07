import { useState } from "react";
import { UnifiedCanvas } from "@/components/UnifiedCanvas";
import { SingleImageDialog } from "@/components/SingleImageDialog";
import { Footer } from "@/components/Footer";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Canvas */}
      <UnifiedCanvas onImageClick={handleImageClick} />

      {/* Single Image Dialog */}
      {selectedImage && (
        <SingleImageDialog
          isOpen={!!selectedImage}
          onClose={handleCloseModal}
          image={selectedImage}
        />
      )}

      <Footer />
    </div>
  );
};

export default Gallery;