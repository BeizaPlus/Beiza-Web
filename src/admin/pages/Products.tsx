/**
 * Shopify Products Admin Page
 */

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { CrudTable, ConfirmDialog } from "@/admin/components/crud";
import { ProductCreator } from "@/admin/components/shopify/ProductCreator";
import { useShopifyProducts, useDeleteShopifyProduct } from "../hooks/useShopifyProducts";

const Products = () => {
  const { data: products = [], isLoading, isError, error } = useShopifyProducts();
  const errorMessage = error instanceof Error ? error.message : "Unable to load products.";
  const deleteProduct = useDeleteShopifyProduct();

  const handleDelete = async (product: (typeof products)[number]) => {
    try {
      await deleteProduct.mutateAsync(product.shopify_product_id);
      toast({
        title: "Product deleted",
        description: `Product "${product.shopify_product_id}" was removed from Shopify.`,
      });
    } catch {
      // Error toast handled by mutation
    }
  };

  const getProductTypeLabel = (type: string) => {
    return type === "physical" ? "Physical" : "Digital";
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return "—";
    const labels: Record<string, string> = {
      coffin: "Coffin",
      photo_book: "Photo Book",
      memorabilia: "Memorabilia",
      tribute: "Tribute",
      archive: "Archive",
      memory_page: "Memory Page",
    };
    return labels[category] || category;
  };

  const getSyncStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      synced: "bg-emerald-100 text-emerald-700",
      syncing: "bg-amber-100 text-amber-700",
      pending: "bg-slate-100 text-slate-700",
      error: "bg-rose-100 text-rose-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Shopify Products</h1>
        <p className="text-sm text-white/70">Manage products synchronized with Shopify.</p>
      </header>

      <CrudTable
        title="Products"
        description="View and manage Shopify product mappings."
        actions={
          <ProductCreator
            trigger={
              <Button className="rounded-full bg-white text-black hover:bg-white/90">
                Create Product
              </Button>
            }
          />
        }
        dataCount={products.length}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyMessage="No products configured."
        columns={
          <tr>
            <th className="px-6 py-4 text-left font-medium">Shopify ID</th>
            <th className="px-6 py-4 text-left font-medium">Type</th>
            <th className="px-6 py-4 text-left font-medium">Category</th>
            <th className="px-6 py-4 text-left font-medium">Local Type</th>
            <th className="px-6 py-4 text-center font-medium">Sync Status</th>
            <th className="px-6 py-4 text-left font-medium">Last Synced</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        }
      >
        {products.map((product) => {
          const isDeleting = deleteProduct.isPending && deleteProduct.variables === product.shopify_product_id;

          return (
            <tr key={product.id} className="transition hover:bg-white/5">
              <td className="px-6 py-4 font-medium text-white">{product.shopify_product_id}</td>
              <td className="px-6 py-4 text-white/70">{getProductTypeLabel(product.product_type)}</td>
              <td className="px-6 py-4 text-white/70">{getCategoryLabel(product.product_category)}</td>
              <td className="px-6 py-4 text-white/70">{product.local_type}</td>
              <td className="px-6 py-4 text-center">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getSyncStatusColor(product.sync_status)}`}>
                  {product.sync_status}
                </span>
              </td>
              <td className="px-6 py-4 text-white/60">
                {product.last_synced_at
                  ? new Date(product.last_synced_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <ConfirmDialog
                    title="Delete product?"
                    description={`Product ${product.shopify_product_id} will be removed from Shopify and the mapping will be deleted.`}
                    onConfirm={() => handleDelete(product)}
                    isConfirming={isDeleting}
                    variant="danger"
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-50"
                        disabled={deleteProduct.isPending}
                        aria-label={`Delete product ${product.shopify_product_id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </CrudTable>
    </div>
  );
};

export default Products;

