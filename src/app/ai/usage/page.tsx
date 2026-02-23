"use client";

import { AiUsageDashboard } from "@/components/ai/ai-usage-dashboard";

export default function AiUsagePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">AI Usage</h1>
        <p className="text-muted-foreground">
          Monitor token usage, costs, and AI operation history.
        </p>
      </div>
      <AiUsageDashboard />
    </div>
  );
}
