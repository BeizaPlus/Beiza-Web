/** @file Keeps track of images that have been loaded by the browser. */

class MultisizeImage {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Get the image URL with width parameter for the requested size.
   */
  getUrl(width: number): string {
    return `${this.url}?width=${width}`;
  }
}

class ImageStore {
  /** Map of image URLs to MultisizeImage instances. */
  map: Map<string, MultisizeImage>;

  constructor() {
    this.map = new Map();
  }

  /**
   * Request an image of a particular width, returning the URL.
   */
  requestSize(url: string, width: number): string {
    let img = this.map.get(url);
    if (!img) {
      img = new MultisizeImage(url);
      this.map.set(url, img);
    }
    return img.getUrl(width);
  }
}

// Create a singleton instance
const imageStore = new ImageStore();

export default imageStore;
