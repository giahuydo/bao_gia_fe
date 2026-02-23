import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReviews,
  getReview,
  createReview,
  approveReview,
  rejectReview,
  requestRevision,
  type CreateReviewDto,
  type ApproveReviewDto,
  type RejectReviewDto,
  type RequestRevisionDto,
  type ReviewQueryParams,
} from "@/lib/api/reviews";

export function useReviews(params?: ReviewQueryParams) {
  return useQuery({
    queryKey: ["reviews", params],
    queryFn: () => getReviews(params),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getReview(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReviewDto) => createReview(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: ApproveReviewDto }) =>
      approveReview(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useRejectReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RejectReviewDto }) =>
      rejectReview(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useRequestRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RequestRevisionDto }) =>
      requestRevision(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}
