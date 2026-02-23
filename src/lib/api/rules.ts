import { api } from "@/lib/api";

export type RuleCategory =
  | "lab"
  | "biotech"
  | "icu"
  | "analytical"
  | "general";
export type RuleOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "startsWith";
export type RuleAction = "flag" | "reject" | "modify";

export interface IRule {
  field: string;
  operator: RuleOperator;
  value: unknown;
  action: RuleAction;
  actionValue?: unknown;
  priority: number;
  message?: string;
}

export interface IRuleSet {
  id: string;
  organizationId: string;
  category: RuleCategory;
  name: string;
  description?: string;
  rules: IRule[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRuleSetDto {
  category: RuleCategory;
  name: string;
  description?: string;
  rules: IRule[];
  isActive?: boolean;
}

export interface UpdateRuleSetDto {
  name?: string;
  description?: string;
  rules?: IRule[];
  isActive?: boolean;
}

export interface EvaluateRulesDto {
  category: RuleCategory;
  items: Record<string, unknown>[];
  ruleSetId?: string;
}

export interface RuleViolation {
  itemIndex: number;
  field: string;
  operator: string;
  value: unknown;
  actualValue: unknown;
  action: string;
  actionValue?: unknown;
  message?: string;
  priority: number;
}

export interface EvaluationResult {
  passed: boolean;
  requiresReview: boolean;
  violations: RuleViolation[];
  modifiedItems: Record<string, unknown>[];
}

export async function getRuleSets(
  category?: RuleCategory
): Promise<IRuleSet[]> {
  const { data } = await api.get("/rules", {
    params: category ? { category } : undefined,
  });
  return data;
}

export async function getRuleSet(id: string): Promise<IRuleSet> {
  const { data } = await api.get(`/rules/${id}`);
  return data;
}

export async function createRuleSet(
  dto: CreateRuleSetDto
): Promise<IRuleSet> {
  const { data } = await api.post("/rules", dto);
  return data;
}

export async function updateRuleSet(
  id: string,
  dto: UpdateRuleSetDto
): Promise<IRuleSet> {
  const { data } = await api.patch(`/rules/${id}`, dto);
  return data;
}

export async function deleteRuleSet(id: string): Promise<IRuleSet> {
  const { data } = await api.delete(`/rules/${id}`);
  return data;
}

export async function evaluateRules(
  dto: EvaluateRulesDto
): Promise<EvaluationResult> {
  const { data } = await api.post("/rules/evaluate", dto);
  return data;
}
