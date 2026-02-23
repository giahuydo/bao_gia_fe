"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProduct, useDeleteProduct } from "@/hooks/use-products";
import { ProductStatusBadge } from "@/components/products/product-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CATEGORY_LABELS: Record<string, string> = {
  lab: "Lab Equipment",
  biotech: "Biotech",
  icu: "ICU",
  analytical: "Analytical",
  consumable: "Consumables",
  service: "Services",
  general: "General",
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError } = useProduct(id);
  const deleteMutation = useDeleteProduct();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Product deleted");
        router.push("/products");
      },
      onError: () => toast.error("Failed to delete product"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !product) {
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
    <div className="container mx-auto max-w-2xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="size-3" /> Back to list
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <ProductStatusBadge isActive={product.isActive} />
          </div>
          <p className="text-muted-foreground mt-1">
            Added {format(new Date(product.createdAt), "dd/MM/yyyy HH:mm")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/products/${id}/edit`}>
              <Pencil className="size-4 mr-1" /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="size-4 mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete product?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this product from the catalog.
                  Existing quotation items will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Default Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(product.defaultPrice)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Unit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{product.unit}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {product.category
                ? CATEGORY_LABELS[product.category] || product.category
                : "Not specified"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Currency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{product.currencyId || "VND"}</p>
          </CardContent>
        </Card>
      </div>

      {product.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{product.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
