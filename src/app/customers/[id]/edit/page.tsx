"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CustomerForm } from "@/components/customers/customer-form";
import { useCustomer, useUpdateCustomer } from "@/hooks/use-customers";

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: customer, isLoading } = useCustomer(id);
  const updateMutation = useUpdateCustomer();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
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
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <Link
        href={`/customers/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="size-3" /> Back to detail
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit Customer</h1>
      <CustomerForm
        defaultValues={customer}
        onSubmit={(data) => {
          updateMutation.mutate(
            { id, dto: data },
            {
              onSuccess: () => {
                toast.success("Customer updated");
                router.push(`/customers/${id}`);
              },
              onError: () => toast.error("Failed to update customer"),
            }
          );
        }}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
