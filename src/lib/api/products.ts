import { api } from "@/lib/api";
import type { PaginatedResponse, IProduct } from "@/types";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  unit: string;
  defaultPrice: number;
  category?: string;
  isActive?: boolean;
  currencyId?: string;
}

export async function getProducts(
  params: GetProductsParams = {}
): Promise<PaginatedResponse<IProduct>> {
  const { data } = await api.get<PaginatedResponse<IProduct>>("/products", {
    params,
  });
  return data;
}

export async function getProductById(id: string): Promise<IProduct> {
  const { data } = await api.get<IProduct>(`/products/${id}`);
  return data;
}

export async function createProduct(
  dto: CreateProductDto
): Promise<IProduct> {
  const { data } = await api.post<IProduct>("/products", dto);
  return data;
}

export async function updateProduct(
  id: string,
  dto: Partial<CreateProductDto>
): Promise<IProduct> {
  const { data } = await api.patch<IProduct>(`/products/${id}`, dto);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
