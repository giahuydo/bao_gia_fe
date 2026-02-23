import { api } from "@/lib/api";

export type ReviewType =
  | "ingestion"
  | "status_change"
  | "price_override"
  | "comparison";
export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

export interface IReviewRequest {
  id: string;
  organizationId: string;
  type: ReviewType;
  status: ReviewStatus;
  quotationId?: string;
  jobId?: string;
  payload: Record<string, unknown>;
  proposedData?: Record<string, unknown>;
  reviewerNotes?: string;
  reviewerChanges?: Record<string, unknown>;
  requestedBy: string;
  requestedByUser?: { id: string; fullName: string; email: string };
  assignedTo?: string;
  assignedToUser?: { id: string; fullName: string; email: string };
  reviewedBy?: string;
  reviewedByUser?: { id: string; fullName: string; email: string };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDto {
  type: ReviewType;
  quotationId?: string;
  jobId?: string;
  payload: Record<string, unknown>;
  proposedData?: Record<string, unknown>;
  assignedTo?: string;
}

export interface ReviewQueryParams {
  status?: ReviewStatus;
  type?: ReviewType;
  page?: number;
  limit?: number;
}

export interface ApproveReviewDto {
  reviewerNotes?: string;
  reviewerChanges?: Record<string, unknown>;
}

export interface RejectReviewDto {
  reviewerNotes: string;
}

export interface RequestRevisionDto {
  reviewerNotes: string;
  reviewerChanges?: Record<string, unknown>;
}

export async function getReviews(
  params?: ReviewQueryParams
): Promise<{
  data: IReviewRequest[];
  total: number;
  page: number;
  limit: number;
}> {
  const { data } = await api.get("/reviews", { params });
  return data;
}

export async function getReview(id: string): Promise<IReviewRequest> {
  const { data } = await api.get(`/reviews/${id}`);
  return data;
}

export async function createReview(
  dto: CreateReviewDto
): Promise<IReviewRequest> {
  const { data } = await api.post("/reviews", dto);
  return data;
}

export async function approveReview(
  id: string,
  dto?: ApproveReviewDto
): Promise<IReviewRequest> {
  const { data } = await api.patch(`/reviews/${id}/approve`, dto || {});
  return data;
}

export async function rejectReview(
  id: string,
  dto: RejectReviewDto
): Promise<IReviewRequest> {
  const { data } = await api.patch(`/reviews/${id}/reject`, dto);
  return data;
}

export async function requestRevision(
  id: string,
  dto: RequestRevisionDto
): Promise<IReviewRequest> {
  const { data } = await api.patch(`/reviews/${id}/request-revision`, dto);
  return data;
}
