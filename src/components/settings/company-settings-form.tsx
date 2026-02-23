"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/hooks/use-company-settings";
import type { UpdateCompanySettingsDto } from "@/lib/api/company-settings";

interface FormValues {
  companyName: string;
  companyNameEn: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
  quotationPrefix: string;
  quotationTerms: string;
  quotationNotes: string;
}

export function CompanySettingsForm() {
  const { data: settings, isLoading, isError } = useCompanySettings();
  const updateMutation = useUpdateCompanySettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      companyName: "",
      companyNameEn: "",
      taxCode: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      logoUrl: "",
      bankName: "",
      bankAccount: "",
      bankBranch: "",
      quotationPrefix: "BG",
      quotationTerms: "",
      quotationNotes: "",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        companyName: settings.companyName || "",
        companyNameEn: settings.companyNameEn || "",
        taxCode: settings.taxCode || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        website: settings.website || "",
        logoUrl: settings.logoUrl || "",
        bankName: settings.bankName || "",
        bankAccount: settings.bankAccount || "",
        bankBranch: settings.bankBranch || "",
        quotationPrefix: settings.quotationPrefix || "BG",
        quotationTerms: settings.quotationTerms || "",
        quotationNotes: settings.quotationNotes || "",
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: FormValues) => {
    const dto: UpdateCompanySettingsDto = {
      companyName: data.companyName,
      companyNameEn: data.companyNameEn || undefined,
      taxCode: data.taxCode || undefined,
      address: data.address || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      website: data.website || undefined,
      logoUrl: data.logoUrl || undefined,
      bankName: data.bankName || undefined,
      bankAccount: data.bankAccount || undefined,
      bankBranch: data.bankBranch || undefined,
      quotationPrefix: data.quotationPrefix,
      quotationTerms: data.quotationTerms || undefined,
      quotationNotes: data.quotationNotes || undefined,
    };

    updateMutation.mutate(dto, {
      onSuccess: () => toast.success("Settings saved"),
      onError: () => toast.error("Failed to save settings"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p>Failed to load company settings. Please try again.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              {...register("companyName", {
                required: "Company name is required",
              })}
              placeholder="e.g. HD WebSoft"
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">
                {errors.companyName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyNameEn">Company Name (English)</Label>
            <Input
              id="companyNameEn"
              {...register("companyNameEn")}
              placeholder="e.g. HD WebSoft Co., Ltd."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxCode">Tax Code</Label>
            <Input
              id="taxCode"
              {...register("taxCode")}
              placeholder="e.g. 0312345678"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="e.g. 028 1234 5678"
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
              placeholder="e.g. info@company.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register("website")}
              placeholder="e.g. https://company.com"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="e.g. 123 Nguyen Hue, District 1, Ho Chi Minh City"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              {...register("logoUrl")}
              placeholder="e.g. https://company.com/logo.png"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Info */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              {...register("bankName")}
              placeholder="e.g. Vietcombank"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankBranch">Branch</Label>
            <Input
              id="bankBranch"
              {...register("bankBranch")}
              placeholder="e.g. Ho Chi Minh City"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bankAccount">Account Number</Label>
            <Input
              id="bankAccount"
              {...register("bankAccount")}
              placeholder="e.g. 0071001234567"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quotation Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Defaults</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2 max-w-[200px]">
            <Label htmlFor="quotationPrefix">Quotation Number Prefix</Label>
            <Input
              id="quotationPrefix"
              {...register("quotationPrefix")}
              placeholder="BG"
            />
            <p className="text-xs text-muted-foreground">
              Quotation numbers will be like {settings?.quotationPrefix || "BG"}
              -001, {settings?.quotationPrefix || "BG"}-002...
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="quotationTerms">Default Terms & Conditions</Label>
            <Textarea
              id="quotationTerms"
              {...register("quotationTerms")}
              placeholder="Payment terms, warranty conditions, delivery terms..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Applied automatically to new quotations.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quotationNotes">Default Notes</Label>
            <Textarea
              id="quotationNotes"
              {...register("quotationNotes")}
              placeholder="Additional notes that appear on every quotation..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isDirty ? "You have unsaved changes." : "All changes saved."}
        </p>
        <Button type="submit" disabled={updateMutation.isPending || !isDirty}>
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
