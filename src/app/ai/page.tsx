"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiGenerateForm } from "@/components/ai/ai-generate-form";
import { AiSuggestForm } from "@/components/ai/ai-suggest-form";
import { AiImproveForm } from "@/components/ai/ai-improve-form";

export default function AiToolsPage() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Tools</h1>
        <p className="text-muted-foreground">
          Use AI to generate quotations, suggest items, and improve
          descriptions.
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="suggest">Suggest</TabsTrigger>
          <TabsTrigger value="improve">Improve</TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <AiGenerateForm />
        </TabsContent>
        <TabsContent value="suggest">
          <AiSuggestForm />
        </TabsContent>
        <TabsContent value="improve">
          <AiImproveForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
