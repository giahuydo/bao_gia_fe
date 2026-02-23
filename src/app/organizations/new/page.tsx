"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OrganizationForm } from "@/components/organizations/organization-form";
import { Button } from "@/components/ui/button";

export default function NewOrganizationPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/organizations">
            <ChevronLeft className="size-4 mr-1" />
            Back to Organizations
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          New Organization
        </h1>
      </div>
      <OrganizationForm />
    </div>
  );
}
