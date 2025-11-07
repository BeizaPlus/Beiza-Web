import { useState, useEffect } from 'react';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export function usePublicImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load only images from gallery folder
        const galleryImages: GalleryImage[] = [
          'IMG_0024.jpg',
          'IMG_0057.jpg', 
          'IMG_0059.jpg',
          'IMG_0101.jpg',
          'IMG_0114.jpg',
          'IMG_0117.jpg',
          'IMG_0422.jpg',
          'IMG_0465.jpg',
          'IMG_0539.jpg',
          'IMG_0540.jpg',
          'IMG_0748.jpg',
          'IMG_0790.jpg',
          'IMG_0812.jpg',
        ].map((filename, index) => ({
          id: `gallery-${index}`,
          src: `/images/gallery/${filename}`,
          alt: `Gallery image ${index + 1}`,
          caption: `Gallery ${index + 1}`,
        }));

        setImages(galleryImages);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  return { images, loading };
}

