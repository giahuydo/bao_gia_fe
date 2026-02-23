import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  addMember,
  removeMember,
  updateMemberRole,
  type CreateOrganizationDto,
  type UpdateOrganizationDto,
  type AddMemberDto,
  type UpdateMemberRoleDto,
} from "@/lib/api/organizations";

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ["organizations", id],
    queryFn: () => getOrganization(id),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrganizationDto) => createOrganization(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}

export function useUpdateOrganization(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateOrganizationDto) => updateOrganization(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      qc.invalidateQueries({ queryKey: ["organizations", id] });
    },
  });
}

export function useAddMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddMemberDto) => addMember(orgId, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["organizations", orgId] }),
  });
}

export function useRemoveMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(orgId, userId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["organizations", orgId] }),
  });
}

export function useUpdateMemberRole(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      dto,
    }: {
      userId: string;
      dto: UpdateMemberRoleDto;
    }) => updateMemberRole(orgId, userId, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["organizations", orgId] }),
  });
}
