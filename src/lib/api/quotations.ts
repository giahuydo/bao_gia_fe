import { api } from "@/lib/api";
import type { PaginatedResponse, IQuotation, QuotationStatus } from "@/types";

export interface GetQuotationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  customerId?: string;
}

export async function getQuotations(
  params: GetQuotationsParams = {}
): Promise<PaginatedResponse<IQuotation>> {
  const { data } = await api.get<PaginatedResponse<IQuotation>>(
    "/quotations",
    { params }
  );
  return data;
}
