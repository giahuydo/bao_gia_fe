"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, ClipboardCheck, Eye } from "lucide-react";
import { useReviews } from "@/hooks/use-reviews";
import type { ReviewStatus, ReviewType } from "@/lib/api/reviews";
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

const ALL = "all";

const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision_requested: "bg-purple-100 text-purple-800",
};

const TYPE_LABELS: Record<ReviewType, string> = {
  ingestion: "Ingestion",
  status_change: "Status Change",
  price_override: "Price Override",
  comparison: "Comparison",
};

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "revision_requested", label: "Revision Requested" },
];

const TYPE_OPTIONS: { value: ReviewType; label: string }[] = [
  { value: "ingestion", label: "Ingestion" },
  { value: "status_change", label: "Status Change" },
  { value: "price_override", label: "Price Override" },
  { value: "comparison", label: "Comparison" },
];

export function ReviewList() {
  const [status, setStatus] = useState<ReviewStatus | typeof ALL>(ALL);
  const [type, setType] = useState<ReviewType | typeof ALL>(ALL);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError } = useReviews({
    page,
    limit,
    status: status === ALL ? undefined : status,
    type: type === ALL ? undefined : type,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <div className="flex gap-2">
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as ReviewStatus | typeof ALL);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Statuses</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as ReviewType | typeof ALL);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Types</SelectItem>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p>Failed to load reviews.</p>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ClipboardCheck className="size-10 mb-3" />
          <p className="text-lg font-medium">No reviews</p>
          <p className="text-sm">
            Reviews are created when actions need approval.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {TYPE_LABELS[review.type] || review.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${STATUS_COLORS[review.status]} hover:${STATUS_COLORS[review.status]}`}
                      >
                        {review.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {review.requestedByUser?.fullName || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {review.assignedToUser?.fullName || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/reviews/${review.id}`}>
                          <Eye className="size-3.5" />
                        </Link>
                      </Button>
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
