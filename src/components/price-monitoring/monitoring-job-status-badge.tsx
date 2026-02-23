import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PriceMonitoringJobStatus,
  PRICE_MONITORING_JOB_STATUS_LABELS,
} from "@/types";

const statusVariants: Record<PriceMonitoringJobStatus, string> = {
  [PriceMonitoringJobStatus.PENDING]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  [PriceMonitoringJobStatus.RUNNING]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  [PriceMonitoringJobStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  [PriceMonitoringJobStatus.FAILED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  [PriceMonitoringJobStatus.PARTIAL]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

interface MonitoringJobStatusBadgeProps {
  status: PriceMonitoringJobStatus;
}

export function MonitoringJobStatusBadge({ status }: MonitoringJobStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-0", statusVariants[status])}>
      {PRICE_MONITORING_JOB_STATUS_LABELS[status]}
    </Badge>
  );
}
