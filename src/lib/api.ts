import axios from "axios";
import * as Sentry from "@sentry/nextjs";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401, clear auth state and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0";
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    Sentry.addBreadcrumb({
      category: "api",
      message: `${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`,
      level: "error",
    });
    return Promise.reject(error);
  }
);
