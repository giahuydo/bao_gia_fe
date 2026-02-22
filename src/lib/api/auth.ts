import { api } from "@/lib/api";
import type { ILoginRequest, ILoginResponse, IUser } from "@/types";

export async function login(data: ILoginRequest): Promise<ILoginResponse> {
  const res = await api.post<ILoginResponse>("/auth/login", data);
  return res.data;
}

export async function getProfile(): Promise<IUser> {
  const res = await api.get<IUser>("/auth/profile");
  return res.data;
}
