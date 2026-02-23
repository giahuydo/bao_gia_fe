"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { api } from "./api";
import type { IUser } from "@/types";

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_PATHS = ["/login", "/register"];

function setTokenCookie(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearTokenCookie() {
  document.cookie = "token=; path=/; max-age=0";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/profile");
      setUser(data);
      // Sync cookie in case it was lost
      setTokenCookie(token);
    } catch {
      localStorage.removeItem("token");
      clearTokenCookie();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!user && !isPublicPath) {
      router.replace("/login");
    } else if (user && isPublicPath) {
      router.replace("/quotations");
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.accessToken);
    setTokenCookie(data.accessToken);
    setUser(data.user);
    Sentry.setUser({ id: data.user.id, email: data.user.email, username: data.user.fullName });
    router.replace("/quotations");
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      fullName,
    });
    localStorage.setItem("token", data.accessToken);
    setTokenCookie(data.accessToken);
    setUser(data.user);
    Sentry.setUser({ id: data.user.id, email: data.user.email, username: data.user.fullName });
    router.replace("/quotations");
  };

  const logout = () => {
    localStorage.removeItem("token");
    clearTokenCookie();
    setUser(null);
    Sentry.setUser(null);
    router.replace("/login");
  };

  // Show nothing while loading auth state (prevents flash)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
