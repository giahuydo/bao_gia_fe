import { api } from "@/lib/api";

export interface IGlossaryTerm {
  id: string;
  organizationId: string;
  sourceTerm: string;
  targetTerm: string;
  sourceLanguage: string;
  targetLanguage: string;
  category?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGlossaryTermDto {
  sourceTerm: string;
  targetTerm: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  category?: string;
}

export interface UpdateGlossaryTermDto {
  targetTerm?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  category?: string;
}

export interface ImportGlossaryDto {
  terms: CreateGlossaryTermDto[];
  upsert?: boolean;
}

export interface GlossaryQueryParams {
  category?: string;
  search?: string;
}

export async function getGlossaryTerms(
  params?: GlossaryQueryParams
): Promise<IGlossaryTerm[]> {
  const { data } = await api.get("/glossary", { params });
  return data;
}

export async function getGlossaryTerm(id: string): Promise<IGlossaryTerm> {
  const { data } = await api.get(`/glossary/${id}`);
  return data;
}

export async function createGlossaryTerm(
  dto: CreateGlossaryTermDto
): Promise<IGlossaryTerm> {
  const { data } = await api.post("/glossary", dto);
  return data;
}

export async function updateGlossaryTerm(
  id: string,
  dto: UpdateGlossaryTermDto
): Promise<IGlossaryTerm> {
  const { data } = await api.patch(`/glossary/${id}`, dto);
  return data;
}

export async function deleteGlossaryTerm(id: string): Promise<IGlossaryTerm> {
  const { data } = await api.delete(`/glossary/${id}`);
  return data;
}

export async function importGlossary(
  dto: ImportGlossaryDto
): Promise<{ created: number; updated: number; skipped: number }> {
  const { data } = await api.post("/glossary/import", dto);
  return data;
}

export async function exportGlossary(
  category?: string
): Promise<
  {
    sourceTerm: string;
    targetTerm: string;
    sourceLanguage: string;
    targetLanguage: string;
    category?: string;
  }[]
> {
  const { data } = await api.get("/glossary/export", {
    params: category ? { category } : undefined,
  });
  return data;
}
