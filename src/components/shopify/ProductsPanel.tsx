/**
 * Products Panel Component
 * Injectable carousel component for displaying Shopify products
 */

import { useShopifyProducts, useMemoirProducts } from "@/hooks/useShopifyProducts";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "../framer/SectionHeader";
import { useMemo } from "react";

interface ProductsPanelProps {
  memoirId?: string | null;
  productType?: string;
  tags?: string;
  limit?: number;
  title?: string;
  description?: string;
  className?: string;
}

export const ProductsPanel = ({
  memoirId,
  productType,
  tags,
  limit = 6,
  title = "Related Products",
  description,
  className,
}: ProductsPanelProps) => {
  // If memoirId is provided, fetch memoir-specific products
  const { data: memoirProducts = [] } = useMemoirProducts(memoirId || null);
  
  // Otherwise, fetch general products
  const { data: generalProducts = [], isLoading } = useShopifyProducts({
    limit,
    product_type: productType,
    tags,
    status: "active",
  });

  const products = useMemo(() => {
    if (memoirId && memoirProducts.length > 0) {
      return memoirProducts.slice(0, limit);
    }
    return generalProducts.slice(0, limit);
  }, [memoirId, memoirProducts, generalProducts, limit]);

  if (isLoading) {
    return (
      <section className={`py-24 ${className || ""}`}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center text-white/60">Loading products...</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render if no products
  }

  return (
    <section className={`py-24 ${className || ""}`}>
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Shop"
          title={title}
          description={description || "Explore our collection of memorial products and services."}
          align="center"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

