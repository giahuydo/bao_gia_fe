"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ITemplate, CreateTemplateDto } from "@/lib/api/templates";

interface TemplateFormProps {
  defaultValues?: ITemplate;
  onSubmit: (data: CreateTemplateDto) => void;
  isSubmitting?: boolean;
}

interface FormValues {
  name: string;
  description: string;
  defaultTerms: string;
  defaultNotes: string;
  defaultTax: number;
  defaultDiscount: number;
  isDefault: boolean;
  items: {
    name: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export function TemplateForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: TemplateFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || "",
          defaultTerms: defaultValues.defaultTerms || "",
          defaultNotes: defaultValues.defaultNotes || "",
          defaultTax: defaultValues.defaultTax,
          defaultDiscount: defaultValues.defaultDiscount,
          isDefault: defaultValues.isDefault,
          items: defaultValues.items?.map((item) => ({
            name: item.name,
            description: item.description || "",
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })) || [],
        }
      : {
          name: "",
          description: "",
          defaultTerms: "",
          defaultNotes: "",
          defaultTax: 10,
          defaultDiscount: 0,
          isDefault: false,
          items: [],
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      name: data.name,
      description: data.description || undefined,
      defaultTerms: data.defaultTerms || undefined,
      defaultNotes: data.defaultNotes || undefined,
      defaultTax: Number(data.defaultTax),
      defaultDiscount: Number(data.defaultDiscount),
      isDefault: data.isDefault,
      items: data.items.length > 0
        ? data.items.map((item) => ({
            name: item.name,
            description: item.description || undefined,
            unit: item.unit,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          }))
        : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Standard Website Project"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="What this template is used for..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultTax">Default Tax (%)</Label>
            <Input
              id="defaultTax"
              type="number"
              min={0}
              max={100}
              step="0.01"
              {...register("defaultTax", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultDiscount">Default Discount (%)</Label>
            <Input
              id="defaultDiscount"
              type="number"
              min={0}
              max={100}
              step="0.01"
              {...register("defaultDiscount", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="defaultTerms">Default Terms & Conditions</Label>
            <Textarea
              id="defaultTerms"
              {...register("defaultTerms")}
              placeholder="Payment terms, warranty..."
              rows={3}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="defaultNotes">Default Notes</Label>
            <Textarea
              id="defaultNotes"
              {...register("defaultNotes")}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register("isDefault")}
              className="size-4"
            />
            <Label htmlFor="isDefault">Set as default template</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Default Line Items</CardTitle>
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
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No default items. Add items that will be pre-filled when using
              this template.
            </p>
          ) : (
            fields.map((field, index) => {
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
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min={1}
                      {...register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      min={0}
                      {...register(`items.${index}.unitPrice`, {
                        valueAsNumber: true,
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {fields.length > 0 && (
            <div className="flex justify-end border-t pt-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Items Subtotal</p>
                <p className="text-2xl font-bold">{formatCurrency(subtotal)}</p>
              </div>
            </div>
          )}
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
              ? "Update Template"
              : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
