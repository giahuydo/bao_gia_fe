"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProductForm } from "@/components/products/product-form";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading } = useProduct(id);
  const updateMutation = useUpdateProduct();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link
          href="/products"
          className="text-primary hover:underline mt-2 inline-block"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Link
        href={`/products/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="size-3" /> Back to detail
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit Product</h1>
      <ProductForm
        defaultValues={product}
        onSubmit={(data) => {
          updateMutation.mutate(
            { id, dto: data },
            {
              onSuccess: () => {
                toast.success("Product updated");
                router.push(`/products/${id}`);
              },
              onError: () => toast.error("Failed to update product"),
            }
          );
        }}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
