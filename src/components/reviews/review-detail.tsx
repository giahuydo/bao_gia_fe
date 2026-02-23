"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  useReview,
  useApproveReview,
  useRejectReview,
  useRequestRevision,
} from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision_requested: "bg-purple-100 text-purple-800",
};

interface Props {
  reviewId: string;
}

export function ReviewDetail({ reviewId }: Props) {
  const router = useRouter();
  const { data: review, isLoading } = useReview(reviewId);
  const [notes, setNotes] = useState("");
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const revisionMutation = useRequestRevision();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!review) {
    return (
      <p className="text-center text-muted-foreground py-16">
        Review not found.
      </p>
    );
  }

  const isPending = review.status === "pending";
  const isActing =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    revisionMutation.isPending;

  const handleApprove = () => {
    approveMutation.mutate(
      { id: reviewId, dto: { reviewerNotes: notes || undefined } },
      {
        onSuccess: () => {
          toast.success("Review approved");
          router.push("/reviews");
        },
        onError: () => toast.error("Failed to approve"),
      }
    );
  };

  const handleReject = () => {
    if (!notes.trim()) {
      toast.error("Notes are required to reject");
      return;
    }
    rejectMutation.mutate(
      { id: reviewId, dto: { reviewerNotes: notes } },
      {
        onSuccess: () => {
          toast.success("Review rejected");
          router.push("/reviews");
        },
        onError: () => toast.error("Failed to reject"),
      }
    );
  };

  const handleRevision = () => {
    if (!notes.trim()) {
      toast.error("Notes are required to request revision");
      return;
    }
    revisionMutation.mutate(
      { id: reviewId, dto: { reviewerNotes: notes } },
      {
        onSuccess: () => {
          toast.success("Revision requested");
          router.push("/reviews");
        },
        onError: () => toast.error("Failed to request revision"),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Review Detail</h1>
        <Badge className={STATUS_COLORS[review.status]}>
          {review.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="outline">{review.type.replace("_", " ")}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requested By</span>
              <span>{review.requestedByUser?.fullName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned To</span>
              <span>{review.assignedToUser?.fullName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>
                {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
            {review.reviewedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reviewed</span>
                <span>
                  {format(new Date(review.reviewedAt), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Payload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-48 bg-muted/50 rounded-md p-2">
              {JSON.stringify(review.payload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {review.reviewerNotes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Reviewer Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{review.reviewerNotes}</p>
            {review.reviewedByUser && (
              <p className="text-xs text-muted-foreground mt-1">
                By {review.reviewedByUser.fullName}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isPending && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label>Reviewer Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (required for reject/revision)"
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleApprove} disabled={isActing}>
                {approveMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin mr-1" />
                ) : (
                  <Check className="size-4 mr-1" />
                )}
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isActing}
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin mr-1" />
                ) : (
                  <X className="size-4 mr-1" />
                )}
                Reject
              </Button>
              <Button
                variant="outline"
                onClick={handleRevision}
                disabled={isActing}
              >
                {revisionMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin mr-1" />
                ) : (
                  <RotateCcw className="size-4 mr-1" />
                )}
                Request Revision
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
