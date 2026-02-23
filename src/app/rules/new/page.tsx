"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { RuleSetForm } from "@/components/rules/rule-set-form";
import { Button } from "@/components/ui/button";

export default function NewRuleSetPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/rules">
            <ChevronLeft className="size-4 mr-1" />
            Back to Rule Sets
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          New Rule Set
        </h1>
      </div>
      <RuleSetForm />
    </div>
  );
}
