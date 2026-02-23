import { api } from "@/lib/api";

export interface IOrganization {
  id: string;
  name: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  plan: "free" | "starter" | "professional" | "enterprise";
  monthlyTokenLimit: number;
  anthropicApiKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "manager" | "member";
  user?: { id: string; fullName: string; email: string };
  createdAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  logoUrl?: string;
  plan?: IOrganization["plan"];
  anthropicApiKey?: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {}

export interface AddMemberDto {
  userId: string;
  role?: IOrganizationMember["role"];
}

export interface UpdateMemberRoleDto {
  role: IOrganizationMember["role"];
}

export async function getOrganizations(): Promise<
  (IOrganization & { role: string })[]
> {
  const { data } = await api.get("/organizations");
  return data;
}

export async function getOrganization(
  id: string
): Promise<
  IOrganization & {
    members: IOrganizationMember[];
    currentUserRole: string;
  }
> {
  const { data } = await api.get(`/organizations/${id}`);
  return data;
}

export async function createOrganization(
  dto: CreateOrganizationDto
): Promise<IOrganization> {
  const { data } = await api.post("/organizations", dto);
  return data;
}

export async function updateOrganization(
  id: string,
  dto: UpdateOrganizationDto
): Promise<IOrganization> {
  const { data } = await api.patch(`/organizations/${id}`, dto);
  return data;
}

export async function addMember(
  orgId: string,
  dto: AddMemberDto
): Promise<IOrganizationMember> {
  const { data } = await api.post(`/organizations/${orgId}/members`, dto);
  return data;
}

export async function removeMember(
  orgId: string,
  userId: string
): Promise<IOrganizationMember> {
  const { data } = await api.delete(
    `/organizations/${orgId}/members/${userId}`
  );
  return data;
}

export async function updateMemberRole(
  orgId: string,
  userId: string,
  dto: UpdateMemberRoleDto
): Promise<IOrganizationMember> {
  const { data } = await api.patch(
    `/organizations/${orgId}/members/${userId}`,
    dto
  );
  return data;
}
