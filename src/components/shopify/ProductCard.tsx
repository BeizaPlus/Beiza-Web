/**
 * Product Card Component
 * Displays a single Shopify product
 */

import { Button } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify/client";

interface ProductCardProps {
  product: ShopifyProduct;
  onAddToCart?: (product: ShopifyProduct) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const image = product.images?.[0];
  const variant = product.variants?.[0];
  const price = variant ? parseFloat(variant.price) : 0;
  const shopifyUrl = `https://${import.meta.env.VITE_SHOPIFY_STORE_DOMAIN}/products/${product.id}`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10">
      {image && (
        <div className="aspect-square overflow-hidden bg-white/5">
          <img
            src={image.src}
            alt={image.alt || product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 font-semibold text-white">{product.title}</h3>
        {product.body_html && (
          <p className="mb-4 line-clamp-2 text-sm text-white/70" dangerouslySetInnerHTML={{ __html: product.body_html }} />
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-white">${price.toFixed(2)}</span>
          <Button
            asChild
            className="rounded-full bg-white text-black hover:bg-white/90"
            onClick={() => onAddToCart?.(product)}
          >
            <a href={shopifyUrl} target="_blank" rel="noopener noreferrer">
              View Product
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

