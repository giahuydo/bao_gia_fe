import { api } from "@/lib/api";

export interface GenerateQuotationRequest {
  description: string;
}

export interface SuggestItemsRequest {
  title: string;
  existingItems?: string[];
}

export interface ImproveDescriptionRequest {
  itemName: string;
  currentDescription: string;
}

export interface CompareSpecsRequest {
  vendorSpec: { items: SpecItem[] };
  customerRequirement: { items: SpecItem[]; budget?: number };
  quotationId?: string;
}

export interface SpecItem {
  name: string;
  description?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  category?: string;
}

export interface UsageSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  byOperation: Record<
    string,
    {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      costUsd: number;
    }
  >;
  byModel: Record<
    string,
    {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      costUsd: number;
    }
  >;
}

export interface UsageRecordsParams {
  from?: string;
  to?: string;
  operation?: string;
  page?: number;
  limit?: number;
}

export async function generateQuotation(
  dto: GenerateQuotationRequest
): Promise<unknown> {
  const { data } = await api.post("/ai/generate-quotation", dto);
  return data;
}

export async function suggestItems(
  dto: SuggestItemsRequest
): Promise<unknown> {
  const { data } = await api.post("/ai/suggest-items", dto);
  return data;
}

export async function improveDescription(
  dto: ImproveDescriptionRequest
): Promise<unknown> {
  const { data } = await api.post("/ai/improve-description", dto);
  return data;
}

export async function compareSpecs(
  dto: CompareSpecsRequest
): Promise<unknown> {
  const { data } = await api.post("/ai/compare", dto);
  return data;
}

export async function getUsageSummary(params: {
  from?: string;
  to?: string;
}): Promise<UsageSummary> {
  const { data } = await api.get<UsageSummary>("/ai/usage/summary", {
    params,
  });
  return data;
}

export async function getUsageRecords(
  params: UsageRecordsParams
): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
  const { data } = await api.get("/ai/usage/records", { params });
  return data;
}
