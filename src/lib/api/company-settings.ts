import { api } from "@/lib/api";

export interface ICompanySettings {
  id: string;
  organizationId: string;
  companyName: string;
  companyNameEn?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  quotationPrefix: string;
  quotationTerms?: string;
  quotationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanySettingsDto {
  companyName?: string;
  companyNameEn?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  quotationPrefix?: string;
  quotationTerms?: string;
  quotationNotes?: string;
}

export async function getCompanySettings(): Promise<ICompanySettings> {
  const { data } = await api.get<ICompanySettings>("/company-settings");
  return data;
}

export async function updateCompanySettings(
  dto: UpdateCompanySettingsDto
): Promise<ICompanySettings> {
  const { data } = await api.put<ICompanySettings>("/company-settings", dto);
  return data;
}
