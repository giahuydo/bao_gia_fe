"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TemplateForm } from "@/components/templates/template-form";
import { useCreateTemplate } from "@/hooks/use-templates";

export default function NewTemplatePage() {
  const router = useRouter();
  const createMutation = useCreateTemplate();

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Create Template
      </h1>
      <TemplateForm
        onSubmit={(data) => {
          createMutation.mutate(data, {
            onSuccess: (template) => {
              toast.success("Template created successfully");
              router.push(`/templates/${template.id}`);
            },
            onError: () => toast.error("Failed to create template"),
          });
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
