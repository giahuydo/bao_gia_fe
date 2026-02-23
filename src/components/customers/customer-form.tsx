"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ICustomer } from "@/types";
import type { CreateCustomerDto } from "@/lib/api/customers";

interface CustomerFormProps {
  defaultValues?: ICustomer;
  onSubmit: (data: CreateCustomerDto) => void;
  isSubmitting?: boolean;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxCode: string;
  contactPerson: string;
  notes: string;
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          email: defaultValues.email || "",
          phone: defaultValues.phone || "",
          address: defaultValues.address || "",
          taxCode: defaultValues.taxCode || "",
          contactPerson: defaultValues.contactPerson || "",
          notes: defaultValues.notes || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
          taxCode: "",
          contactPerson: "",
          notes: "",
        },
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      taxCode: data.taxCode || undefined,
      contactPerson: data.contactPerson || undefined,
      notes: data.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Company / Customer Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. ABC Corporation"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              {...register("contactPerson")}
              placeholder="e.g. Nguyen Van A"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              placeholder="e.g. contact@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="e.g. 0901234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxCode">Tax Code</Label>
            <Input
              id="taxCode"
              {...register("taxCode")}
              placeholder="e.g. 0123456789"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="e.g. 123 Nguyen Hue, District 1, HCMC"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about this customer..."
              rows={3}
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
              ? "Update Customer"
              : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
