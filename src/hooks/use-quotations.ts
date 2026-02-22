import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  changeQuotationStatus,
  duplicateQuotation,
  type GetQuotationsParams,
  type CreateQuotationDto,
} from "@/lib/api/quotations";
import type { QuotationStatus } from "@/types";

export function useQuotations(params: GetQuotationsParams = {}) {
  return useQuery({
    queryKey: ["quotations", params],
    queryFn: () => getQuotations(params),
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: () => getQuotationById(id),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuotationDto) => createQuotation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateQuotationDto> }) =>
      updateQuotation(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", id] });
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}

export function useChangeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuotationStatus }) =>
      changeQuotationStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", id] });
    },
  });
}

export function useDuplicateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}
