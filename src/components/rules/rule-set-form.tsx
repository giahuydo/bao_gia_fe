"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateRuleSet, useUpdateRuleSet } from "@/hooks/use-rules";
import type {
  CreateRuleSetDto,
  IRuleSet,
  RuleCategory,
  RuleOperator,
  RuleAction,
} from "@/lib/api/rules";
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
import { Separator } from "@/components/ui/separator";

const CATEGORIES: { value: RuleCategory; label: string }[] = [
  { value: "lab", label: "Lab" },
  { value: "biotech", label: "Biotech" },
  { value: "icu", label: "ICU" },
  { value: "analytical", label: "Analytical" },
  { value: "general", label: "General" },
];

const OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: "eq", label: "= (equals)" },
  { value: "neq", label: "!= (not equals)" },
  { value: "gt", label: "> (greater than)" },
  { value: "gte", label: ">= (greater or equal)" },
  { value: "lt", label: "< (less than)" },
  { value: "lte", label: "<= (less or equal)" },
  { value: "contains", label: "contains" },
  { value: "startsWith", label: "starts with" },
];

const ACTIONS: { value: RuleAction; label: string }[] = [
  { value: "flag", label: "Flag (review)" },
  { value: "reject", label: "Reject" },
  { value: "modify", label: "Modify" },
];

interface FormValues {
  category: RuleCategory;
  name: string;
  description: string;
  isActive: boolean;
  rules: {
    field: string;
    operator: RuleOperator;
    value: string;
    action: RuleAction;
    actionValue: string;
    priority: number;
    message: string;
  }[];
}

interface Props {
  defaultValues?: IRuleSet;
}

export function RuleSetForm({ defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues;
  const createMutation = useCreateRuleSet();
  const updateMutation = useUpdateRuleSet(defaultValues?.id || "");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaultValues
      ? {
          category: defaultValues.category,
          name: defaultValues.name,
          description: defaultValues.description || "",
          isActive: defaultValues.isActive,
          rules: defaultValues.rules.map((r) => ({
            field: r.field,
            operator: r.operator,
            value: String(r.value),
            action: r.action,
            actionValue: r.actionValue ? String(r.actionValue) : "",
            priority: r.priority,
            message: r.message || "",
          })),
        }
      : {
          category: "general",
          name: "",
          description: "",
          isActive: true,
          rules: [
            {
              field: "",
              operator: "gt" as RuleOperator,
              value: "",
              action: "flag" as RuleAction,
              actionValue: "",
              priority: 1,
              message: "",
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  const onSubmit = (data: FormValues) => {
    const dto: CreateRuleSetDto = {
      category: data.category,
      name: data.name,
      description: data.description || undefined,
      isActive: data.isActive,
      rules: data.rules.map((r) => ({
        field: r.field,
        operator: r.operator,
        value: isNaN(Number(r.value)) ? r.value : Number(r.value),
        action: r.action,
        actionValue: r.actionValue
          ? isNaN(Number(r.actionValue))
            ? r.actionValue
            : Number(r.actionValue)
          : undefined,
        priority: r.priority,
        message: r.message || undefined,
      })),
    };

    if (isEdit) {
      updateMutation.mutate(
        { name: dto.name, description: dto.description, rules: dto.rules, isActive: dto.isActive },
        {
          onSuccess: () => {
            toast.success("Rule set updated");
            router.push("/rules");
          },
          onError: () => toast.error("Failed to update rule set"),
        }
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => {
          toast.success("Rule set created");
          router.push("/rules");
        },
        onError: () => toast.error("Failed to create rule set"),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register("name", { required: "Name is required" })}
            placeholder="e.g. Lab Equipment Price Rules"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={watch("category")}
            onValueChange={(v) => setValue("category", v as RuleCategory)}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Brief description of what these rules check"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          {...register("isActive")}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Rules</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                field: "",
                operator: "gt",
                value: "",
                action: "flag",
                actionValue: "",
                priority: fields.length + 1,
                message: "",
              })
            }
          >
            <Plus className="size-3.5 mr-1" />
            Add Rule
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Rule #{index + 1}
              </span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Field</Label>
                <Input
                  {...register(`rules.${index}.field`, {
                    required: "Required",
                  })}
                  placeholder="e.g. unitPrice"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Operator</Label>
                <Select
                  value={watch(`rules.${index}.operator`)}
                  onValueChange={(v) =>
                    setValue(
                      `rules.${index}.operator`,
                      v as RuleOperator
                    )
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Value</Label>
                <Input
                  {...register(`rules.${index}.value`, {
                    required: "Required",
                  })}
                  placeholder="e.g. 100000"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Action</Label>
                <Select
                  value={watch(`rules.${index}.action`)}
                  onValueChange={(v) =>
                    setValue(`rules.${index}.action`, v as RuleAction)
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Action Value</Label>
                <Input
                  {...register(`rules.${index}.actionValue`)}
                  placeholder="For modify action"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Input
                  type="number"
                  {...register(`rules.${index}.priority`, {
                    valueAsNumber: true,
                  })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Message</Label>
                <Input
                  {...register(`rules.${index}.message`)}
                  placeholder="User-friendly message"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin mr-1" />}
          {isEdit ? "Update" : "Create"} Rule Set
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
