import { api } from "@/lib/api";

export interface ITemplateItem {
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface ITemplate {
  id: string;
  name: string;
  description?: string;
  defaultTerms?: string;
  defaultNotes?: string;
  defaultTax: number;
  defaultDiscount: number;
  items?: ITemplateItem[];
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  defaultTerms?: string;
  defaultNotes?: string;
  defaultTax?: number;
  defaultDiscount?: number;
  items?: ITemplateItem[];
  isDefault?: boolean;
}

export async function getTemplates(): Promise<ITemplate[]> {
  const { data } = await api.get<ITemplate[]>("/templates");
  return data;
}

export async function getTemplateById(id: string): Promise<ITemplate> {
  const { data } = await api.get<ITemplate>(`/templates/${id}`);
  return data;
}

export async function createTemplate(
  dto: CreateTemplateDto
): Promise<ITemplate> {
  const { data } = await api.post<ITemplate>("/templates", dto);
  return data;
}

export async function updateTemplate(
  id: string,
  dto: Partial<CreateTemplateDto>
): Promise<ITemplate> {
  const { data } = await api.patch<ITemplate>(`/templates/${id}`, dto);
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${id}`);
}

export interface ApplyTemplateResult {
  title: string;
  customerId: string | null;
  terms?: string;
  notes?: string;
  tax: number;
  discount: number;
  items: {
    name: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    sortOrder: number;
  }[];
}

export async function applyTemplate(
  id: string,
  dto: { customerId?: string; title?: string }
): Promise<ApplyTemplateResult> {
  const { data } = await api.post<ApplyTemplateResult>(
    `/templates/${id}/apply`,
    dto
  );
  return data;
}
