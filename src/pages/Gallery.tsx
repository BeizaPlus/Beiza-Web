import { useState } from "react";
import { UnifiedCanvas } from "@/components/UnifiedCanvas";
import { SingleImageDialog } from "@/components/SingleImageDialog";
import { Footer } from "@/components/Footer";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [resetToken, setResetToken] = useState(0);

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setResetToken((token) => token + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Canvas */}
      <UnifiedCanvas onImageClick={handleImageClick} resetViewToken={resetToken} />

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