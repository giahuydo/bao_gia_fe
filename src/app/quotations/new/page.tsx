"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QuotationForm } from "@/components/quotations/quotation-form";
import { useCreateQuotation } from "@/hooks/use-quotations";

export default function NewQuotationPage() {
  const router = useRouter();
  const createMutation = useCreateQuotation();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Create Quotation
      </h1>
      <QuotationForm
        onSubmit={(data) => {
          createMutation.mutate(data, {
            onSuccess: (quotation) => {
              toast.success("Quotation created successfully");
              router.push(`/quotations/${quotation.id}`);
            },
            onError: () => {
              toast.error("Failed to create quotation");
            },
          });
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
