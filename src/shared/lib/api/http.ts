import axios, { AxiosError, type AxiosRequestConfig } from "axios";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type TokenGetter = () => Promise<string | null | undefined>;

let accessTokenGetter: TokenGetter | null = null;

export function setAccessTokenGetter(getter: TokenGetter | null) {
  accessTokenGetter = getter;
}

export const api = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  if (accessTokenGetter) {
    const token = await accessTokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const message =
      (typeof error.response?.data?.error === "string" && error.response.data.error) ||
      error.message ||
      "Request failed";
    throw new ApiError(message, error.response?.status ?? 500);
  },
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  const { data } = await api.get<T>(url, config);
  return data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) {
  const { data } = await api.post<T>(url, body, config);
  return data;
}
