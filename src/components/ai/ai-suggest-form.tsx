"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSuggestItems } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AiSuggestForm() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const mutation = useSuggestItems();
  const { register, handleSubmit, formState: { errors } } = useForm<{
    title: string;
  }>();

  const onSubmit = (data: { title: string }) => {
    setResult(null);
    mutation.mutate(
      { title: data.title },
      {
        onSuccess: (res) => {
          setResult(res);
          toast.success("Items suggested");
        },
        onError: () => toast.error("Failed to suggest items"),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="size-5" />
          Suggest Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quotation title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. Bao gia thiet ke website ecommerce"
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin mr-1" />
            ) : (
              <Lightbulb className="size-4 mr-1" />
            )}
            Suggest
          </Button>
        </form>

        {result && (
          <div className="mt-4 rounded-md border bg-muted/50 p-4">
            <Label className="text-xs text-muted-foreground">
              Suggested Items
            </Label>
            <pre className="mt-2 text-sm whitespace-pre-wrap overflow-auto max-h-80">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
