import { api } from "@/lib/api";

export interface IQuotationVersion {
  id: string;
  quotationId: string;
  versionNumber: number;
  label?: string;
  snapshot: Record<string, unknown>;
  changeSummary?: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateVersionDto {
  label?: string;
  changeSummary?: string;
}

export interface VersionDiff {
  versionA: { number: number; label?: string; createdAt: string };
  versionB: { number: number; label?: string; createdAt: string };
  diff: {
    items: {
      added: { index: number; item: Record<string, unknown> }[];
      removed: { index: number; item: Record<string, unknown> }[];
      modified: {
        index: number;
        changes: { field: string; from: unknown; to: unknown }[];
      }[];
    };
    totals: Record<string, { from: unknown; to: unknown }>;
    metadata: Record<string, { from: unknown; to: unknown }>;
  };
}

export async function getVersions(
  quotationId: string
): Promise<IQuotationVersion[]> {
  const { data } = await api.get(`/quotations/${quotationId}/versions`);
  return data;
}

export async function getVersion(
  quotationId: string,
  versionId: string
): Promise<IQuotationVersion> {
  const { data } = await api.get(
    `/quotations/${quotationId}/versions/${versionId}`
  );
  return data;
}

export async function createVersion(
  quotationId: string,
  dto: CreateVersionDto
): Promise<IQuotationVersion> {
  const { data } = await api.post(
    `/quotations/${quotationId}/versions`,
    dto
  );
  return data;
}

export async function compareVersions(
  quotationId: string,
  versionA: number,
  versionB: number
): Promise<VersionDiff> {
  const { data } = await api.get(
    `/quotations/${quotationId}/versions/compare`,
    { params: { versionA, versionB } }
  );
  return data;
}
