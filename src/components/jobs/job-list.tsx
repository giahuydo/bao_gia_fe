"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Cog, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useJobs, useRetryJob } from "@/hooks/use-jobs";
import type { JobStatus, IIngestionJob } from "@/lib/api/jobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const ALL_STATUSES = "all";

const STATUS_COLORS: Record<JobStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  extracting: "bg-blue-100 text-blue-800",
  translating: "bg-blue-100 text-blue-800",
  normalizing: "bg-blue-100 text-blue-800",
  review_pending: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  dead_letter: "bg-gray-100 text-gray-800",
};

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "extracting", label: "Extracting" },
  { value: "translating", label: "Translating" },
  { value: "normalizing", label: "Normalizing" },
  { value: "review_pending", label: "Review Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "dead_letter", label: "Dead Letter" },
];

export function JobList() {
  const [status, setStatus] = useState<JobStatus | typeof ALL_STATUSES>(
    ALL_STATUSES
  );
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useJobs({
    page,
    limit,
    status: status === ALL_STATUSES ? undefined : status,
  });

  const retryMutation = useRetryJob();

  const handleRetry = (jobId: string) => {
    retryMutation.mutate(jobId, {
      onSuccess: () => toast.success("Job queued for retry"),
      onError: () => toast.error("Failed to retry job"),
    });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as JobStatus | typeof ALL_STATUSES);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Ingestion Jobs</h1>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All Statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p>Failed to load jobs. Please try again.</p>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Cog className="size-10 mb-3" />
          <p className="text-lg font-medium">No ingestion jobs</p>
          <p className="text-sm">
            Jobs are created when documents are uploaded for AI extraction.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((job: IIngestionJob) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono text-xs">
                      {job.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${STATUS_COLORS[job.status]} hover:${STATUS_COLORS[job.status]}`}
                      >
                        {job.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {job.retries}/{job.maxRetries}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate text-xs">
                      {job.error || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(job.createdAt), "dd/MM HH:mm")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {job.completedAt
                        ? format(new Date(job.completedAt), "dd/MM HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {(job.status === "failed" ||
                        job.status === "dead_letter") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetry(job.id)}
                          disabled={retryMutation.isPending}
                        >
                          <RefreshCw className="size-3.5 mr-1" />
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data.total > limit && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={data.data.length < limit}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
