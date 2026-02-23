import { useQuery, useMutation } from "@tanstack/react-query";
import {
  generateQuotation,
  suggestItems,
  improveDescription,
  compareSpecs,
  getUsageSummary,
  getUsageRecords,
  type GenerateQuotationRequest,
  type SuggestItemsRequest,
  type ImproveDescriptionRequest,
  type CompareSpecsRequest,
  type UsageRecordsParams,
} from "@/lib/api/ai";

export function useGenerateQuotation() {
  return useMutation({
    mutationFn: (dto: GenerateQuotationRequest) => generateQuotation(dto),
  });
}

export function useSuggestItems() {
  return useMutation({
    mutationFn: (dto: SuggestItemsRequest) => suggestItems(dto),
  });
}

export function useImproveDescription() {
  return useMutation({
    mutationFn: (dto: ImproveDescriptionRequest) => improveDescription(dto),
  });
}

export function useCompareSpecs() {
  return useMutation({
    mutationFn: (dto: CompareSpecsRequest) => compareSpecs(dto),
  });
}

export function useUsageSummary(params: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: ["ai-usage-summary", params],
    queryFn: () => getUsageSummary(params),
  });
}

export function useUsageRecords(params: UsageRecordsParams = {}) {
  return useQuery({
    queryKey: ["ai-usage-records", params],
    queryFn: () => getUsageRecords(params),
  });
}
