"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useImproveDescription } from "@/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AiImproveForm() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const mutation = useImproveDescription();
  const { register, handleSubmit, formState: { errors } } = useForm<{
    itemName: string;
    currentDescription: string;
  }>();

  const onSubmit = (data: {
    itemName: string;
    currentDescription: string;
  }) => {
    setResult(null);
    mutation.mutate(data, {
      onSuccess: (res) => {
        setResult(res);
        toast.success("Description improved");
      },
      onError: () => toast.error("Failed to improve description"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="size-5" />
          Improve Description
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              {...register("itemName", { required: "Required" })}
              placeholder="e.g. Thiet ke UI"
            />
            {errors.itemName && (
              <p className="text-sm text-destructive">
                {errors.itemName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentDescription">Current Description</Label>
            <Textarea
              id="currentDescription"
              {...register("currentDescription", { required: "Required" })}
              placeholder="e.g. Thiet ke giao dien cho website"
              rows={3}
            />
            {errors.currentDescription && (
              <p className="text-sm text-destructive">
                {errors.currentDescription.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin mr-1" />
            ) : (
              <Wand2 className="size-4 mr-1" />
            )}
            Improve
          </Button>
        </form>

        {result && (
          <div className="mt-4 rounded-md border bg-muted/50 p-4">
            <Label className="text-xs text-muted-foreground">
              Improved Description
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
