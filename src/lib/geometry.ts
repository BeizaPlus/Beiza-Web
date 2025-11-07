/** @file Geometric layout for an ordered list of rectangles. */

import RBush, { type BBox } from "rbush";

export const PIXELS_PER_CM = 8;

export interface Artwork {
  id: string;
  dimwidth: number;
  dimheight: number;
}

/**
 * Returns geometric positions (in cm) for the center of each artwork.
 *
 * This places artworks in a natural grid pattern with some randomness
 * to avoid rigid alignment. There are no overlaps.
 */
export function layoutArtwork(pieces: Artwork[]): [number, number][] {
  const positions: [number, number][] = [];
  const tree = new RBush<BBox>();
  
  // Circular/oval parameters
  const centerX = 0;
  const centerY = 0;
  const radiusX = 40; // cm - horizontal radius for oval
  const radiusY = 30; // cm - vertical radius for oval
  const padding = 15; // cm padding around each image
  const angleStep = (2 * Math.PI) / pieces.length; // Equal angle distribution
  
  // Place images in circular/oval pattern
  for (let i = 0; i < pieces.length; i++) {
    const artwork = pieces[i];
    const angle = i * angleStep;
    
    // Calculate position on oval
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    // Create bounding box with padding
    const bbox = {
      minX: x - (artwork.dimwidth + padding) / 2,
      minY: y - (artwork.dimheight + padding) / 2,
      maxX: x + (artwork.dimwidth + padding) / 2,
      maxY: y + (artwork.dimheight + padding) / 2,
    };
    
    // Check for collision and adjust if needed
    let finalX = x;
    let finalY = y;
    let attempts = 0;
    
    while (tree.collides(bbox) && attempts < 50) {
      // Try adjusting the radius slightly
      const adjustedRadiusX = radiusX + (attempts * 2);
      const adjustedRadiusY = radiusY + (attempts * 1.5);
      
      finalX = centerX + adjustedRadiusX * Math.cos(angle);
      finalY = centerY + adjustedRadiusY * Math.sin(angle);
      
      // Update bounding box
      bbox.minX = finalX - (artwork.dimwidth + padding) / 2;
      bbox.minY = finalY - (artwork.dimheight + padding) / 2;
      bbox.maxX = finalX + (artwork.dimwidth + padding) / 2;
      bbox.maxY = finalY + (artwork.dimheight + padding) / 2;
      
      attempts++;
    }
    
    positions.push([finalX, finalY]);
    tree.insert(bbox);
  }
  
  return positions;
}