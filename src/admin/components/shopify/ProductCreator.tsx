/**
 * Product Creator Component
 * Allows creating Shopify products from memoirs or as standalone products
 */

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CrudFormDrawer } from "../crud/CrudFormDrawer";
import { MutationErrorBanner } from "../crud/MutationErrorBanner";
import { useCreateProductFromMemoir, useCreateStandaloneProduct, useMemoirDataForProduct } from "../../hooks/useProductCreation";
import { useMemoirsList } from "../../hooks/useAdminData";
import { extractSupabaseErrorMessage } from "@/lib/supabase-errors";
import type { ProductCategory } from "@/lib/shopify/service";

const productSchema = z.object({
  mode: z.enum(["memoir", "standalone"]),
  memoirId: z.string().optional(),
  productCategory: z.enum(["coffin", "photo_book", "memorabilia", "tribute", "archive", "memory_page"]),
  title: z.string().min(2, "Title is required."),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required."),
  sku: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductCreatorProps = {
  trigger: ReactNode;
};

const PRODUCT_CATEGORIES: Array<{ value: ProductCategory; label: string; description: string }> = [
  { value: "coffin", label: "Coffin", description: "Custom coffin or casket" },
  { value: "photo_book", label: "Photo Book", description: "Physical photo book from memoir content" },
  { value: "memorabilia", label: "Memorabilia", description: "Physical memorabilia from memoir" },
  { value: "tribute", label: "Digital Tribute", description: "Digital memorial tribute video/film" },
  { value: "archive", label: "Digital Archive", description: "Digital archive collection" },
  { value: "memory_page", label: "Memory Page", description: "Digital memory page" },
];

export const ProductCreator = ({ trigger }: ProductCreatorProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"memoir" | "standalone">("standalone");
  
  const createFromMemoir = useCreateProductFromMemoir();
  const createStandalone = useCreateStandaloneProduct();
  const { data: memoirs = [] } = useMemoirsList();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      mode: "standalone",
      productCategory: "coffin",
      title: "",
      description: "",
      price: "0.00",
      sku: "",
    },
  });

  const selectedMemoirId = form.watch("memoirId");
  const { data: memoirData } = useMemoirDataForProduct(selectedMemoirId || null);

  // Auto-populate title and description from memoir when memoir is selected
  useEffect(() => {
    if (mode === "memoir" && memoirData && form.getValues("productCategory")) {
      const category = form.getValues("productCategory");
      const memoir = memoirData.memoir;
      
      let title = "";
      if (category === "tribute") {
        title = `Memorial Tribute - ${memoir.title}`;
      } else if (category === "archive") {
        title = `Legacy Archive - ${memoir.title}`;
      } else if (category === "memory_page") {
        title = `Memory Page - ${memoir.title}`;
      } else if (category === "photo_book") {
        title = `Photo Book - ${memoir.title}`;
      } else if (category === "memorabilia") {
        title = `Memorabilia - ${memoir.title}`;
      }
      
      form.setValue("title", title);
      if (memoir.summary) {
        form.setValue("description", memoir.summary);
      }
    }
  }, [mode, memoirData, form]);

  useEffect(() => {
    if (open) {
      form.reset({
        mode: "standalone",
        productCategory: "coffin",
        title: "",
        description: "",
        price: "0.00",
        sku: "",
      });
      setMode("standalone");
    }
  }, [open, form]);

  const currentMutation = mode === "memoir" ? createFromMemoir : createStandalone;
  const mutationError = currentMutation.isError
    ? extractSupabaseErrorMessage(currentMutation.error)
    : null;

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      if (values.mode === "memoir" && values.memoirId) {
        await createFromMemoir.mutateAsync({
          memoirId: values.memoirId,
          productCategory: values.productCategory,
          title: values.title.trim(),
          description: values.description?.trim(),
          price: values.price,
        });
      } else {
        await createStandalone.mutateAsync({
          productCategory: values.productCategory,
          title: values.title.trim(),
          description: values.description?.trim(),
          price: values.price,
          sku: values.sku?.trim(),
        });
      }

      toast({
        title: "Product created",
        description: `"${values.title}" has been created in Shopify.`,
      });
      setOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  });

  return (
    <CrudFormDrawer
      title="Create Shopify Product"
      description="Create a new product in Shopify. You can create from a memoir or as a standalone product."
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button variant="outline" disabled={currentMutation.isPending}>
              Cancel
            </Button>
          </DrawerClose>
          <Button
            onClick={handleSubmit}
            disabled={currentMutation.isPending}
            className="bg-white text-black hover:bg-white/90"
          >
            {currentMutation.isPending ? "Creating…" : "Create Product"}
          </Button>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        {mutationError ? <MutationErrorBanner message={mutationError} /> : null}

        <div className="space-y-2">
          <Label htmlFor="product-mode">Creation Mode</Label>
          <Select
            value={mode}
            onValueChange={(value) => {
              setMode(value as "memoir" | "standalone");
              form.setValue("mode", value as "memoir" | "standalone");
            }}
          >
            <SelectTrigger id="product-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standalone">Standalone Product</SelectItem>
              <SelectItem value="memoir">From Memoir</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-white/50">
            {mode === "memoir"
              ? "Create a product linked to a memoir (tribute, archive, photo book, etc.)"
              : "Create a standalone product (e.g., coffin) with manual details"}
          </p>
        </div>

        {mode === "memoir" && (
          <div className="space-y-2">
            <Label htmlFor="product-memoir">Select Memoir</Label>
            <Select
              value={form.watch("memoirId") || ""}
              onValueChange={(value) => form.setValue("memoirId", value)}
            >
              <SelectTrigger id="product-memoir">
                <SelectValue placeholder="Choose a memoir" />
              </SelectTrigger>
              <SelectContent>
                {memoirs.map((memoir) => (
                  <SelectItem key={memoir.id} value={memoir.id}>
                    {memoir.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="product-category">Product Category</Label>
          <Select
            value={form.watch("productCategory")}
            onValueChange={(value) => form.setValue("productCategory", value as ProductCategory)}
          >
            <SelectTrigger id="product-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label} - {cat.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-title">Title</Label>
          <Input id="product-title" {...form.register("title")} />
          <p className="text-xs text-rose-200">{form.formState.errors.title?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description">Description</Label>
          <Textarea id="product-description" rows={4} {...form.register("description")} />
          <p className="text-xs text-rose-200">{form.formState.errors.description?.message}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-price">Price</Label>
            <Input id="product-price" type="number" step="0.01" {...form.register("price")} />
            <p className="text-xs text-rose-200">{form.formState.errors.price?.message}</p>
          </div>
          {mode === "standalone" && (
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU (Optional)</Label>
              <Input id="product-sku" {...form.register("sku")} />
            </div>
          )}
        </div>
      </form>
    </CrudFormDrawer>
  );
};

