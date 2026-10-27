import { CONTRIBUTION, FINE_AMT, STORAGE_KEYS } from "./types";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalized.startsWith("/api/") ? normalized : `/api/v1${normalized}`;
  return API_ORIGIN ? `${API_ORIGIN}${apiPath}` : apiPath;
}

export class ApiError extends Error {
  status: number;
  data?: Record<string, unknown>;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(STORAGE_KEYS.token, token);
  else localStorage.removeItem(STORAGE_KEYS.token);
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers: extraHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(extraHeaders as Record<string, string> | undefined),
  };

  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl(path), {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data as Record<string, unknown>);
  }

  return data as T;
}

/** Multipart upload (e.g. contribution proof). Do not set Content-Type — browser sets the boundary. */
export async function apiFormRequest<T>(
  path: string,
  formData: FormData,
  options: { method?: string; auth?: boolean } = {}
): Promise<T> {
  const { method = "POST", auth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body: formData,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data as Record<string, unknown>);
  }

  return data as T;
}

/** Fetch a binary resource (e.g. proof image) with auth and return an object URL. */
export async function apiBlobUrl(path: string): Promise<string> {
  const headers: Record<string, string> = {};
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl(path), { headers });
  if (!res.ok) throw new ApiError(`Could not load file (${res.status})`, res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export { CONTRIBUTION, FINE_AMT };
