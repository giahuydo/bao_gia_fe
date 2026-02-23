"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Activity, Loader2 } from "lucide-react";
import { useMonitoringJobs } from "@/hooks/use-price-monitoring";
import { PriceMonitoringJobStatus, type IPriceMonitoringJob } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonitoringJobStatusBadge } from "./monitoring-job-status-badge";

const ALL_STATUSES = "all";

function formatDuration(startedAt?: string, completedAt?: string): string {
  if (!startedAt) return "-";
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const diffMs = end - start;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

const STATUS_OPTIONS = [
  { value: PriceMonitoringJobStatus.PENDING, label: "Pending" },
  { value: PriceMonitoringJobStatus.RUNNING, label: "Running" },
  { value: PriceMonitoringJobStatus.COMPLETED, label: "Completed" },
  { value: PriceMonitoringJobStatus.FAILED, label: "Failed" },
  { value: PriceMonitoringJobStatus.PARTIAL, label: "Partial" },
];

export function MonitoringJobList() {
  const [status, setStatus] = useState<string>(ALL_STATUSES);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useMonitoringJobs({
    page,
    limit,
    status: status === ALL_STATUSES ? undefined : status,
  });

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All Statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p>Failed to load monitoring jobs. Please try again.</p>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Activity className="size-10 mb-3" />
          <p className="text-lg font-medium">No monitoring jobs found</p>
          <p className="text-sm">
            {status !== ALL_STATUSES
              ? "Try adjusting your filters."
              : "Trigger a monitoring run to see results here."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Alerts</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((job: IPriceMonitoringJob) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <MonitoringJobStatusBadge status={job.status} />
                    </TableCell>
                    <TableCell className="capitalize text-sm text-muted-foreground">
                      {job.triggerType}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {job.processedProducts}/{job.totalProducts}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {job.alertCount}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {job.startedAt
                        ? format(new Date(job.startedAt), "dd/MM/yyyy HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDuration(job.startedAt, job.completedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(data.page - 1) * data.limit + 1} to{" "}
              {Math.min(data.page * data.limit, data.total)} of {data.total} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
