import { api } from "@/lib/api";

export type JobStatus =
  | "pending"
  | "extracting"
  | "translating"
  | "normalizing"
  | "review_pending"
  | "completed"
  | "failed"
  | "dead_letter";

export interface IIngestionJob {
  id: string;
  status: JobStatus;
  attachmentId?: string;
  quotationId?: string;
  extractResult?: unknown;
  translateResult?: unknown;
  normalizeResult?: unknown;
  error?: string;
  retries: number;
  maxRetries: number;
  n8nExecutionId?: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface GetJobsParams {
  status?: JobStatus;
  page?: number;
  limit?: number;
}

export async function getJobs(
  params: GetJobsParams = {}
): Promise<{ data: IIngestionJob[]; total: number; page: number; limit: number }> {
  const { data } = await api.get("/jobs/ingestion", { params });
  return data;
}

export async function getJobById(id: string): Promise<IIngestionJob> {
  const { data } = await api.get<IIngestionJob>(`/jobs/ingestion/${id}`);
  return data;
}

export async function retryJob(id: string): Promise<IIngestionJob> {
  const { data } = await api.post<IIngestionJob>(
    `/jobs/ingestion/${id}/retry`
  );
  return data;
}
