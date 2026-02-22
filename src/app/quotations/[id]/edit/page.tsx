"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QuotationForm } from "@/components/quotations/quotation-form";
import { useQuotation, useUpdateQuotation } from "@/hooks/use-quotations";
import { QuotationStatus } from "@/types";

export default function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: quotation, isLoading } = useQuotation(id);
  const updateMutation = useUpdateQuotation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-muted-foreground">Quotation not found.</p>
        <Link href="/quotations" className="text-primary hover:underline mt-2 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  if (quotation.status !== QuotationStatus.DRAFT) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-muted-foreground">
          Only draft quotations can be edited.
        </p>
        <Link
          href={`/quotations/${id}`}
          className="text-primary hover:underline mt-2 inline-block"
        >
          View quotation
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Link
        href={`/quotations/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="size-3" /> Back to detail
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Edit Quotation
      </h1>
      <QuotationForm
        defaultValues={quotation}
        onSubmit={(data) => {
          updateMutation.mutate(
            { id, dto: data },
            {
              onSuccess: () => {
                toast.success("Quotation updated");
                router.push(`/quotations/${id}`);
              },
              onError: () => toast.error("Failed to update quotation"),
            }
          );
        }}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
