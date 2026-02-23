import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVersions,
  getVersion,
  createVersion,
  compareVersions,
  type CreateVersionDto,
} from "@/lib/api/versions";

export function useVersions(quotationId: string) {
  return useQuery({
    queryKey: ["versions", quotationId],
    queryFn: () => getVersions(quotationId),
    enabled: !!quotationId,
  });
}

export function useVersion(quotationId: string, versionId: string) {
  return useQuery({
    queryKey: ["versions", quotationId, versionId],
    queryFn: () => getVersion(quotationId, versionId),
    enabled: !!quotationId && !!versionId,
  });
}

export function useCreateVersion(quotationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateVersionDto) => createVersion(quotationId, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["versions", quotationId] }),
  });
}

export function useCompareVersions(
  quotationId: string,
  versionA: number,
  versionB: number
) {
  return useQuery({
    queryKey: ["versions", quotationId, "compare", versionA, versionB],
    queryFn: () => compareVersions(quotationId, versionA, versionB),
    enabled: !!quotationId && versionA > 0 && versionB > 0,
  });
}
