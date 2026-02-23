"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useCreateCurrency,
  useUpdateCurrency,
} from "@/hooks/use-currencies";
import type { ICurrency } from "@/lib/api/currencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CurrencyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: ICurrency;
}

interface FormValues {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  decimalPlaces: number;
}

export function CurrencyFormDialog({
  open,
  onOpenChange,
  defaultValues,
}: CurrencyFormDialogProps) {
  const createMutation = useCreateCurrency();
  const updateMutation = useUpdateCurrency();
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      symbol: "",
      exchangeRate: 1,
      decimalPlaces: 0,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        code: defaultValues.code,
        name: defaultValues.name,
        symbol: defaultValues.symbol,
        exchangeRate: defaultValues.exchangeRate,
        decimalPlaces: defaultValues.decimalPlaces,
      });
    } else {
      reset({
        code: "",
        name: "",
        symbol: "",
        exchangeRate: 1,
        decimalPlaces: 0,
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = (data: FormValues) => {
    const dto = {
      code: data.code.toUpperCase(),
      name: data.name,
      symbol: data.symbol,
      exchangeRate: Number(data.exchangeRate),
      decimalPlaces: Number(data.decimalPlaces),
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: defaultValues.id, dto },
        {
          onSuccess: () => {
            toast.success("Currency updated");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update currency"),
        }
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          toast.success("Currency created");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create currency"),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Currency" : "Add Currency"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                maxLength={3}
                {...register("code", {
                  required: "Code is required",
                  maxLength: { value: 3, message: "Max 3 characters" },
                })}
                placeholder="VND"
                className="uppercase font-mono"
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                {...register("symbol", { required: "Symbol is required" })}
                placeholder="₫"
                className="font-mono"
              />
              {errors.symbol && (
                <p className="text-sm text-destructive">
                  {errors.symbol.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="Vietnamese Dong"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Exchange Rate</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="any"
                min={0}
                {...register("exchangeRate", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Must be >= 0" },
                })}
              />
              <p className="text-xs text-muted-foreground">
                Relative to base currency
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="decimalPlaces">Decimal Places</Label>
              <Input
                id="decimalPlaces"
                type="number"
                min={0}
                max={4}
                {...register("decimalPlaces", {
                  valueAsNumber: true,
                  min: 0,
                  max: 4,
                })}
              />
              <p className="text-xs text-muted-foreground">
                0 for VND, 2 for USD
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
