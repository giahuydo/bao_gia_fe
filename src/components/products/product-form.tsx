"use client";

import { useForm } from "react-hook-form";
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
import type { IProduct } from "@/types";
import type { CreateProductDto } from "@/lib/api/products";

interface ProductFormProps {
  defaultValues?: IProduct;
  onSubmit: (data: CreateProductDto) => void;
  isSubmitting?: boolean;
}

interface FormValues {
  name: string;
  description: string;
  unit: string;
  defaultPrice: number;
  category: string;
  currency: string;
  isActive: string;
}

const UNIT_OPTIONS = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "set", label: "Set" },
  { value: "unit", label: "Unit" },
  { value: "box", label: "Box" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "m", label: "Meter (m)" },
  { value: "lot", label: "Lot" },
];

const CATEGORY_OPTIONS = [
  { value: "lab", label: "Lab Equipment" },
  { value: "biotech", label: "Biotech" },
  { value: "icu", label: "ICU" },
  { value: "analytical", label: "Analytical" },
  { value: "consumable", label: "Consumables" },
  { value: "service", label: "Services" },
  { value: "general", label: "General" },
];

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || "",
          unit: defaultValues.unit,
          defaultPrice: defaultValues.defaultPrice,
          category: defaultValues.category || "",
          currency: defaultValues.currencyId || "VND",
          isActive: defaultValues.isActive ? "true" : "false",
        }
      : {
          name: "",
          description: "",
          unit: "pcs",
          defaultPrice: 0,
          category: "",
          currency: "VND",
          isActive: "true",
        },
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      name: data.name,
      description: data.description || undefined,
      unit: data.unit,
      defaultPrice: Number(data.defaultPrice),
      category: data.category || undefined,
      currencyId: data.currency,
      isActive: data.isActive === "true",
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Microscope XYZ-2000"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={watch("category")}
              onValueChange={(v) => setValue("category", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unit *</Label>
            <Select
              value={watch("unit")}
              onValueChange={(v) => setValue("unit", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultPrice">Default Price *</Label>
            <Input
              id="defaultPrice"
              type="number"
              min={0}
              {...register("defaultPrice", {
                valueAsNumber: true,
                required: "Price is required",
                min: { value: 0, message: "Price must be >= 0" },
              })}
            />
            {errors.defaultPrice && (
              <p className="text-sm text-destructive">
                {errors.defaultPrice.message}
              </p>
            )}
            {watch("defaultPrice") > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(watch("defaultPrice"))} {watch("currency")}
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
            <Label>Status</Label>
            <Select
              value={watch("isActive")}
              onValueChange={(v) => setValue("isActive", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Product specifications, features..."
              rows={4}
            />
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
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
