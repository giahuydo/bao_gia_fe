"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCustomer, useDeleteCustomer } from "@/hooks/use-customers";
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

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: customer, isLoading, isError } = useCustomer(id);
  const deleteMutation = useDeleteCustomer();

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Customer deleted");
        router.push("/customers");
      },
      onError: () => toast.error("Failed to delete customer"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-muted-foreground">Customer not found.</p>
        <Link
          href="/customers"
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
            href="/customers"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="size-3" /> Back to list
          </Link>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground mt-1">
            Added {format(new Date(customer.createdAt), "dd/MM/yyyy HH:mm")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/customers/${id}/edit`}>
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
                <AlertDialogTitle>Delete customer?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this customer. Quotations linked
                  to this customer will not be affected.
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
              Contact Person
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {customer.contactPerson || "Not specified"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{customer.email || "Not specified"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Phone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{customer.phone || "Not specified"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Tax Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{customer.taxCode || "Not specified"}</p>
          </CardContent>
        </Card>
      </div>

      {customer.address && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{customer.address}</p>
          </CardContent>
        </Card>
      )}

      {customer.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
