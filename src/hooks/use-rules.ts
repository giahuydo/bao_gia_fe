import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRuleSets,
  getRuleSet,
  createRuleSet,
  updateRuleSet,
  deleteRuleSet,
  evaluateRules,
  type RuleCategory,
  type CreateRuleSetDto,
  type UpdateRuleSetDto,
  type EvaluateRulesDto,
} from "@/lib/api/rules";

export function useRuleSets(category?: RuleCategory) {
  return useQuery({
    queryKey: ["rules", category],
    queryFn: () => getRuleSets(category),
  });
}

export function useRuleSet(id: string) {
  return useQuery({
    queryKey: ["rules", id],
    queryFn: () => getRuleSet(id),
    enabled: !!id,
  });
}

export function useCreateRuleSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRuleSetDto) => createRuleSet(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
  });
}

export function useUpdateRuleSet(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateRuleSetDto) => updateRuleSet(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
  });
}

export function useDeleteRuleSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRuleSet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
  });
}

export function useEvaluateRules() {
  return useMutation({
    mutationFn: (dto: EvaluateRulesDto) => evaluateRules(dto),
  });
}
