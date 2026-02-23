import { api } from "@/lib/api";
import type {
  PaginatedResponse,
  IPriceMonitoringJob,
  IPriceRecord,
  IPriceAlert,
} from "@/types";

export interface GetMonitoringJobsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface GetPriceAlertsParams {
  page?: number;
  limit?: number;
  severity?: string;
  unreadOnly?: boolean;
}

export interface GetPriceHistoryParams {
  productId: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function triggerPriceMonitoring(
  data?: { productIds?: string[] }
): Promise<IPriceMonitoringJob> {
  const { data: result } = await api.post<IPriceMonitoringJob>(
    "/price-monitoring/trigger",
    data ?? {}
  );
  return result;
}

export async function getMonitoringJobs(
  params?: GetMonitoringJobsParams
): Promise<PaginatedResponse<IPriceMonitoringJob>> {
  const { data } = await api.get<PaginatedResponse<IPriceMonitoringJob>>(
    "/price-monitoring/jobs",
    { params }
  );
  return data;
}

export async function getMonitoringJobById(
  id: string
): Promise<IPriceMonitoringJob & { priceRecords: IPriceRecord[] }> {
  const { data } = await api.get<IPriceMonitoringJob & { priceRecords: IPriceRecord[] }>(
    `/price-monitoring/jobs/${id}`
  );
  return data;
}

export async function getPriceHistory(
  params: GetPriceHistoryParams
): Promise<PaginatedResponse<IPriceRecord>> {
  const { data } = await api.get<PaginatedResponse<IPriceRecord>>(
    "/price-monitoring/history",
    { params }
  );
  return data;
}

export async function getPriceAlerts(
  params?: GetPriceAlertsParams
): Promise<PaginatedResponse<IPriceAlert>> {
  const { data } = await api.get<PaginatedResponse<IPriceAlert>>(
    "/price-monitoring/alerts",
    { params }
  );
  return data;
}

export async function markAlertRead(id: string): Promise<void> {
  await api.patch(`/price-monitoring/alerts/${id}/read`);
}

export async function markAllAlertsRead(): Promise<void> {
  await api.patch("/price-monitoring/alerts/read-all");
}
