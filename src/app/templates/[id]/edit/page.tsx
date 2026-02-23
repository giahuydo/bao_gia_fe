"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TemplateForm } from "@/components/templates/template-form";
import { useTemplate, useUpdateTemplate } from "@/hooks/use-templates";

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: template, isLoading } = useTemplate(id);
  const updateMutation = useUpdateTemplate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-muted-foreground">Template not found.</p>
        <Link
          href="/templates"
          className="text-primary hover:underline mt-2 inline-block"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Link
        href={`/templates/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="size-3" /> Back to detail
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit Template</h1>
      <TemplateForm
        defaultValues={template}
        onSubmit={(data) => {
          updateMutation.mutate(
            { id, dto: data },
            {
              onSuccess: () => {
                toast.success("Template updated");
                router.push(`/templates/${id}`);
              },
              onError: () => toast.error("Failed to update template"),
            }
          );
        }}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
