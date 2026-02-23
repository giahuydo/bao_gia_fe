import { api } from "@/lib/api";
import type { IDashboardStats } from "@shared/types/dashboard";

export async function getDashboardStats(): Promise<IDashboardStats> {
  const { data } = await api.get<IDashboardStats>("/quotations/dashboard");
  return data;
}
