"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateOrganization,
  useUpdateOrganization,
} from "@/hooks/use-organizations";
import type {
  CreateOrganizationDto,
  IOrganization,
} from "@/lib/api/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  defaultValues?: IOrganization;
}

const PLANS = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "professional", label: "Professional" },
  { value: "enterprise", label: "Enterprise" },
];

export function OrganizationForm({ defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues;
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization(defaultValues?.id || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateOrganizationDto>({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || "",
          logoUrl: defaultValues.logoUrl || "",
          plan: defaultValues.plan,
        }
      : { plan: "free" },
  });

  const onSubmit = (data: CreateOrganizationDto) => {
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(data, {
      onSuccess: (org) => {
        toast.success(
          isEdit ? "Organization updated" : "Organization created"
        );
        router.push(`/organizations/${isEdit ? defaultValues!.id : org.id}`);
      },
      onError: () =>
        toast.error(
          isEdit
            ? "Failed to update organization"
            : "Failed to create organization"
        ),
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register("name", {
            required: "Name is required",
            minLength: { value: 2, message: "At least 2 characters" },
          })}
          placeholder="e.g. My Company"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Brief description of your organization"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Plan</Label>
        <Select
          value={watch("plan") || "free"}
          onValueChange={(v) =>
            setValue("plan", v as IOrganization["plan"])
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLANS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          {...register("logoUrl")}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="anthropicApiKey">Anthropic API Key</Label>
        <Input
          id="anthropicApiKey"
          type="password"
          {...register("anthropicApiKey")}
          placeholder="sk-ant-..."
        />
        <p className="text-xs text-muted-foreground">
          Encrypted in database. Leave empty to use system default.
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin mr-1" />}
          {isEdit ? "Update" : "Create"} Organization
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
