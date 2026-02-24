"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGenerateQuotation } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AiGenerateForm() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const mutation = useGenerateQuotation();
  const { register, handleSubmit, formState: { errors } } = useForm<{
    description: string;
  }>();

  const onSubmit = (data: { description: string }) => {
    setResult(null);
    mutation.mutate(data, {
      onSuccess: (res) => {
        setResult(res);
        toast.success("Quotation generated");
      },
      onError: () => toast.error("Failed to generate quotation"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5" />
          Generate Quotation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              Describe the quotation you need (min 10 characters)
            </Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "At least 10 characters",
                },
              })}
              placeholder="e.g. Quotation for e-commerce website design for ABC Company, including UI/UX design, frontend and backend development, payment integration"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin mr-1" />
            ) : (
              <Sparkles className="size-4 mr-1" />
            )}
            Generate
          </Button>
        </form>

        {result && (
          <div className="mt-4 rounded-md border bg-muted/50 p-4">
            <Label className="text-xs text-muted-foreground">AI Result</Label>
            <pre className="mt-2 text-sm whitespace-pre-wrap overflow-auto max-h-80">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
