import { api } from "@/lib/api";
import type { PaginatedResponse, ICustomer } from "@/types";

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  contactPerson?: string;
  notes?: string;
}

export async function getCustomers(
  params: GetCustomersParams = {}
): Promise<PaginatedResponse<ICustomer>> {
  const { data } = await api.get<PaginatedResponse<ICustomer>>("/customers", {
    params,
  });
  return data;
}

export async function getCustomerById(id: string): Promise<ICustomer> {
  const { data } = await api.get<ICustomer>(`/customers/${id}`);
  return data;
}

export async function createCustomer(
  dto: CreateCustomerDto
): Promise<ICustomer> {
  const { data } = await api.post<ICustomer>("/customers", dto);
  return data;
}

export async function updateCustomer(
  id: string,
  dto: Partial<CreateCustomerDto>
): Promise<ICustomer> {
  const { data } = await api.patch<ICustomer>(`/customers/${id}`, dto);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
