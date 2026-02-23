"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/products/product-form";
import { useCreateProduct } from "@/hooks/use-products";

export default function NewProductPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Add Product</h1>
      <ProductForm
        onSubmit={(data) => {
          createMutation.mutate(data, {
            onSuccess: (product) => {
              toast.success("Product created successfully");
              router.push(`/products/${product.id}`);
            },
            onError: () => {
              toast.error("Failed to create product");
            },
          });
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
