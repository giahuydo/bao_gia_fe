"use client";

import { useEffect, useState } from "react";
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
import { CustomerCombobox } from "@/components/quotations/customer-combobox";
import { ProductCombobox } from "@/components/quotations/product-combobox";
import { getCustomerById } from "@/lib/api/customers";
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
  discount: number;
  tax: number;
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
  const [customerName, setCustomerName] = useState("");

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
          discount: defaultValues.discount ?? 0,
          tax: defaultValues.tax ?? 0,
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
          discount: 0,
          tax: 0,
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
  const watchedDiscount = watch("discount") || 0;
  const watchedTax = watch("tax") || 0;
  const watchedCustomerId = watch("customerId");

  // Fetch customer name when editing existing quotation
  useEffect(() => {
    if (defaultValues?.customerId && !customerName) {
      getCustomerById(defaultValues.customerId)
        .then((c) => setCustomerName(c.name))
        .catch(() => setCustomerName("Unknown customer"));
    }
  }, [defaultValues?.customerId, customerName]);

  // Calculations
  const subtotal = watchedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const discountAmount = subtotal * (watchedDiscount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (watchedTax / 100);
  const total = afterDiscount + taxAmount;

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      title: data.title,
      customerId: data.customerId,
      currencyId: data.currency,
      notes: data.notes || undefined,
      terms: data.terms || undefined,
      validUntil: data.validUntil || undefined,
      discount: data.discount || 0,
      tax: data.tax || 0,
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
    new Intl.NumberFormat("vi-VN").format(Math.round(amount));

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
            <Label>Customer *</Label>
            <CustomerCombobox
              value={watchedCustomerId}
              displayName={customerName}
              onChange={(id, name) => {
                setValue("customerId", id, { shouldValidate: true });
                setCustomerName(name);
              }}
            />
            <input
              type="hidden"
              {...register("customerId", { required: "Customer is required" })}
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
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input id="validUntil" type="date" {...register("validUntil")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              min={0}
              max={100}
              step={0.1}
              {...register("discount", {
                valueAsNumber: true,
                min: { value: 0, message: "Min 0%" },
                max: { value: 100, message: "Max 100%" },
              })}
            />
            {errors.discount && (
              <p className="text-sm text-destructive">
                {errors.discount.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Tax (%)</Label>
            <Input
              id="tax"
              type="number"
              min={0}
              max={100}
              step={0.1}
              {...register("tax", {
                valueAsNumber: true,
                min: { value: 0, message: "Min 0%" },
                max: { value: 100, message: "Max 100%" },
              })}
            />
            {errors.tax && (
              <p className="text-sm text-destructive">{errors.tax.message}</p>
            )}
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
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Item {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <ProductCombobox
                      onSelect={(product) => {
                        setValue(`items.${index}.name`, product.name);
                        setValue(`items.${index}.unit`, product.unit);
                        setValue(`items.${index}.unitPrice`, product.unitPrice);
                        setValue(
                          `items.${index}.description`,
                          product.description
                        );
                      }}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-12">
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
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Total</Label>
                    <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                      {formatCurrency(lineTotal)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    {...register(`items.${index}.description`)}
                    placeholder="Item description (optional)"
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            );
          })}

          {/* Total breakdown */}
          <div className="border-t pt-4">
            <div className="ml-auto w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {watchedDiscount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount ({watchedDiscount}%)
                    </span>
                    <span className="text-destructive">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      After Discount
                    </span>
                    <span>{formatCurrency(afterDiscount)}</span>
                  </div>
                </>
              )}
              {watchedTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tax ({watchedTax}%)
                  </span>
                  <span>+{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
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
