"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IQuotation } from "@/types";
import type { CreateQuotationDto } from "@/lib/api/quotations";

interface QuotationFormProps {
  defaultValues?: IQuotation;
  onSubmit: (data: CreateQuotationDto) => void;
  isSubmitting?: boolean;
}

interface FormValues {
  title: string;
  customerId: string;
  currency: string;
  notes: string;
  terms: string;
  validUntil: string;
  items: {
    name: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export function QuotationForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: QuotationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaultValues
      ? {
          title: defaultValues.title,
          customerId: defaultValues.customerId,
          currency: defaultValues.currencyId || "VND",
          notes: defaultValues.notes || "",
          terms: defaultValues.terms || "",
          validUntil: defaultValues.validUntil
            ? defaultValues.validUntil.split("T")[0]
            : "",
          items: defaultValues.items.map((item) => ({
            name: item.name,
            description: item.description || "",
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }
      : {
          title: "",
          customerId: "",
          currency: "VND",
          notes: "",
          terms: "",
          validUntil: "",
          items: [
            {
              name: "",
              description: "",
              unit: "pcs",
              quantity: 1,
              unitPrice: 0,
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  const subtotal = watchedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      title: data.title,
      customerId: data.customerId,
      currencyId: data.currency,
      notes: data.notes || undefined,
      terms: data.terms || undefined,
      validUntil: data.validUntil || undefined,
      items: data.items.map((item, index) => ({
        name: item.name,
        description: item.description || undefined,
        unit: item.unit,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        sortOrder: index,
      })),
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. Website Development Proposal"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID *</Label>
            <Input
              id="customerId"
              {...register("customerId", {
                required: "Customer is required",
              })}
              placeholder="Customer UUID"
            />
            {errors.customerId && (
              <p className="text-sm text-destructive">
                {errors.customerId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={watch("currency")}
              onValueChange={(v) => setValue("currency", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input id="validUntil" type="date" {...register("validUntil")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              {...register("terms")}
              placeholder="Payment terms, delivery conditions..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                name: "",
                description: "",
                unit: "pcs",
                quantity: 1,
                unitPrice: 0,
              })
            }
          >
            <Plus className="size-4 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const qty = watchedItems[index]?.quantity || 0;
            const price = watchedItems[index]?.unitPrice || 0;
            const lineTotal = qty * price;

            return (
              <div
                key={field.id}
                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-12"
              >
                <div className="space-y-1 sm:col-span-4">
                  <Label className="text-xs">Name *</Label>
                  <Input
                    {...register(`items.${index}.name`, {
                      required: "Required",
                    })}
                    placeholder="Item name"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Unit</Label>
                  <Input
                    {...register(`items.${index}.unit`)}
                    placeholder="pcs"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Qty *</Label>
                  <Input
                    type="number"
                    min={1}
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                      required: true,
                      min: 1,
                    })}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Unit Price *</Label>
                  <Input
                    type="number"
                    min={0}
                    {...register(`items.${index}.unitPrice`, {
                      valueAsNumber: true,
                      required: true,
                      min: 0,
                    })}
                  />
                </div>
                <div className="flex items-end gap-2 sm:col-span-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Total</Label>
                    <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                      {formatCurrency(lineTotal)}
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-2xl font-bold">{formatCurrency(subtotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : defaultValues
              ? "Update Quotation"
              : "Create Quotation"}
        </Button>
      </div>
    </form>
  );
}
