import { api } from "@/lib/api";

export interface ICurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  decimalPlaces: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  exchangeRate?: number;
  decimalPlaces?: number;
  isDefault?: boolean;
}

export async function getCurrencies(): Promise<ICurrency[]> {
  const { data } = await api.get<ICurrency[]>("/currencies");
  return data;
}

export async function getCurrencyById(id: string): Promise<ICurrency> {
  const { data } = await api.get<ICurrency>(`/currencies/${id}`);
  return data;
}

export async function createCurrency(
  dto: CreateCurrencyDto
): Promise<ICurrency> {
  const { data } = await api.post<ICurrency>("/currencies", dto);
  return data;
}

export async function updateCurrency(
  id: string,
  dto: Partial<CreateCurrencyDto>
): Promise<ICurrency> {
  const { data } = await api.patch<ICurrency>(`/currencies/${id}`, dto);
  return data;
}

export async function deleteCurrency(id: string): Promise<void> {
  await api.delete(`/currencies/${id}`);
}
