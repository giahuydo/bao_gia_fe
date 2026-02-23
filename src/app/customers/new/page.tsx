"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomerForm } from "@/components/customers/customer-form";
import { useCreateCustomer } from "@/hooks/use-customers";

export default function NewCustomerPage() {
  const router = useRouter();
  const createMutation = useCreateCustomer();

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Add Customer</h1>
      <CustomerForm
        onSubmit={(data) => {
          createMutation.mutate(data, {
            onSuccess: (customer) => {
              toast.success("Customer created successfully");
              router.push(`/customers/${customer.id}`);
            },
            onError: () => {
              toast.error("Failed to create customer");
            },
          });
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
