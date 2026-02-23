import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  triggerPriceMonitoring,
  getMonitoringJobs,
  getMonitoringJobById,
  getPriceHistory,
  getPriceAlerts,
  markAlertRead,
  markAllAlertsRead,
  type GetMonitoringJobsParams,
  type GetPriceAlertsParams,
  type GetPriceHistoryParams,
} from "@/lib/api/price-monitoring";

export function useMonitoringJobs(params?: GetMonitoringJobsParams) {
  return useQuery({
    queryKey: ["price-monitoring-jobs", params],
    queryFn: () => getMonitoringJobs(params),
  });
}

export function useMonitoringJob(id: string) {
  return useQuery({
    queryKey: ["price-monitoring-job", id],
    queryFn: () => getMonitoringJobById(id),
    enabled: !!id,
  });
}

export function usePriceHistory(params: GetPriceHistoryParams) {
  return useQuery({
    queryKey: ["price-history", params],
    queryFn: () => getPriceHistory(params),
    enabled: !!params.productId,
  });
}

export function usePriceAlerts(params?: GetPriceAlertsParams) {
  return useQuery({
    queryKey: ["price-alerts", params],
    queryFn: () => getPriceAlerts(params),
  });
}

export function useTriggerMonitoring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: { productIds?: string[] }) => triggerPriceMonitoring(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-monitoring-jobs"] });
    },
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAlertsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
    },
  });
}
