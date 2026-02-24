import { api } from "@/lib/api";
import type { PaginatedResponse, IQuotation, QuotationStatus } from "@/types";

export interface GetQuotationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
}

export interface CreateQuotationDto {
  title: string;
  customerId: string;
  currencyId?: string;
  notes?: string;
  terms?: string;
  validUntil?: string;
  discount?: number;
  tax?: number;
  items: CreateQuotationItemDto[];
}

export interface CreateQuotationItemDto {
  productId?: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
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

export async function getQuotationById(id: string): Promise<IQuotation> {
  const { data } = await api.get<IQuotation>(`/quotations/${id}`);
  return data;
}

export async function createQuotation(
  dto: CreateQuotationDto
): Promise<IQuotation> {
  const { data } = await api.post<IQuotation>("/quotations", dto);
  return data;
}

export async function updateQuotation(
  id: string,
  dto: Partial<CreateQuotationDto>
): Promise<IQuotation> {
  const { data } = await api.patch<IQuotation>(`/quotations/${id}`, dto);
  return data;
}

export async function deleteQuotation(id: string): Promise<void> {
  await api.delete(`/quotations/${id}`);
}

export async function changeQuotationStatus(
  id: string,
  status: QuotationStatus
): Promise<IQuotation> {
  const { data } = await api.patch<IQuotation>(`/quotations/${id}/status`, {
    status,
  });
  return data;
}

export async function duplicateQuotation(id: string): Promise<IQuotation> {
  const { data } = await api.post<IQuotation>(`/quotations/${id}/duplicate`);
  return data;
}

export async function exportQuotationPdf(id: string): Promise<Blob> {
  const { data } = await api.get(`/quotations/${id}/pdf`, {
    responseType: "blob",
  });
  return data;
}
