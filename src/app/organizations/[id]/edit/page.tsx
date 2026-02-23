"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useOrganization } from "@/hooks/use-organizations";
import { OrganizationForm } from "@/components/organizations/organization-form";
import { Button } from "@/components/ui/button";

export default function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: org, isLoading } = useOrganization(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-center text-muted-foreground py-16">
          Organization not found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/organizations/${id}`}>
            <ChevronLeft className="size-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit Organization
        </h1>
      </div>
      <OrganizationForm defaultValues={org} />
    </div>
  );
}
