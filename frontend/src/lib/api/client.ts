import type { ApiResponse } from '@/types/api.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const AUTH_STORAGE_KEY = 'adventure-auth';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  params?: QueryParams;
  body?: unknown;
  responseType?: 'json' | 'blob';
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
};

type StoredAuthState = {
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: unknown;
  isAuthenticated?: boolean;
};

export class ApiError extends Error {
  status: number;
  response: { data: Partial<ApiResponse<unknown>> };

  constructor(status: number, payload: Partial<ApiResponse<unknown>>) {
    super(payload.error || payload.message || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.response = { data: payload };
  }
}

function getStoredAuth(): StoredAuthState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return {};
    return (JSON.parse(raw).state ?? {}) as StoredAuthState;
  } catch {
    return {};
  }
}

function setStoredTokens(accessToken: string, refreshToken?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : { state: {} };
    parsed.state = {
      ...parsed.state,
      accessToken,
      refreshToken: refreshToken ?? parsed.state?.refreshToken ?? null,
      isAuthenticated: true,
    };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage write failures; the current request can still continue.
  }
}

function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function buildUrl(path: string, params?: QueryParams) {
  const base = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const url = new URL(base);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') url.searchParams.append(key, String(item));
      });
      return;
    }
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: text };
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredAuth().refreshToken;
  if (!refreshToken) return null;

  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'X-Refresh-Token': refreshToken },
  });

  if (!response.ok) {
    clearStoredAuth();
    return null;
  }

  const payload = (await parseJsonSafe(response)) as ApiResponse<{ accessToken: string; refreshToken?: string }>;
  if (!payload?.data?.accessToken) return null;
  setStoredTokens(payload.data.accessToken, payload.data.refreshToken);
  return payload.data.accessToken;
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<{ data: T }> {
  const {
    params,
    body,
    responseType = 'json',
    skipAuth = false,
    retryOnUnauthorized = true,
    headers,
    ...init
  } = options;

  const token = getStoredAuth().accessToken;
  const requestHeaders = new Headers(headers);

  if (!skipAuth && token) requestHeaders.set('Authorization', `Bearer ${token}`);
  if (body !== undefined && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && retryOnUnauthorized && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      requestHeaders.set('Authorization', `Bearer ${newToken}`);
      return request<T>(path, { ...options, headers: requestHeaders, retryOnUnauthorized: false });
    }
    if (typeof window !== 'undefined') window.location.href = '/login';
  }

  if (!response.ok) {
    const payload = (await parseJsonSafe(response)) as Partial<ApiResponse<unknown>>;
    throw new ApiError(response.status, payload ?? { success: false, error: response.statusText });
  }

  if (responseType === 'blob') return { data: (await response.blob()) as T };
  return { data: (await parseJsonSafe(response)) as T };
}

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};

export default apiClient;
