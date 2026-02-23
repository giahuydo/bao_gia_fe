import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGlossaryTerms,
  getGlossaryTerm,
  createGlossaryTerm,
  updateGlossaryTerm,
  deleteGlossaryTerm,
  importGlossary,
  exportGlossary,
  type CreateGlossaryTermDto,
  type UpdateGlossaryTermDto,
  type ImportGlossaryDto,
  type GlossaryQueryParams,
} from "@/lib/api/glossary";

export function useGlossaryTerms(params?: GlossaryQueryParams) {
  return useQuery({
    queryKey: ["glossary", params],
    queryFn: () => getGlossaryTerms(params),
  });
}

export function useGlossaryTerm(id: string) {
  return useQuery({
    queryKey: ["glossary", id],
    queryFn: () => getGlossaryTerm(id),
    enabled: !!id,
  });
}

export function useCreateGlossaryTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGlossaryTermDto) => createGlossaryTerm(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["glossary"] }),
  });
}

export function useUpdateGlossaryTerm(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateGlossaryTermDto) => updateGlossaryTerm(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["glossary"] }),
  });
}

export function useDeleteGlossaryTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGlossaryTerm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["glossary"] }),
  });
}

export function useImportGlossary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ImportGlossaryDto) => importGlossary(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["glossary"] }),
  });
}

export function useExportGlossary() {
  return useMutation({
    mutationFn: (category?: string) => exportGlossary(category),
  });
}
