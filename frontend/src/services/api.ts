/**
 * Central API client.
 * - Sends credentials (httpOnly cookies) on every request
 * - Handles 401 → silent token refresh → retry once
 * - Fires 'auth:failure' custom event when session cannot be recovered
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';
const TIMEOUT_MS = 30_000;

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fetchWithTimeout = (url: string, options: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
};

let refreshInFlight: Promise<boolean> | null = null;

const tryRefresh = (): Promise<boolean> => {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = fetchWithTimeout(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { refreshInFlight = null; });
  return refreshInFlight;
};

const request = async <T>(
  method: string,
  path: string,
  body?: unknown,
  retry = true
): Promise<T> => {
  const url = `${BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  let response: Response;
  try {
    response = await fetchWithTimeout(url, options);
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') throw new ApiError(408, 'Request timed out');
    throw new ApiError(0, 'Network error – check your connection');
  }

  // Silent refresh on 401
  if (response.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(method, path, body, false);

    window.dispatchEvent(new CustomEvent('auth:failure', { detail: { reason: 'session_expired' } }));
    throw new ApiError(401, 'Session expired');
  }

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new ApiError(response.status, json.message || response.statusText, json);
  }

  return json as T;
};

const api = {
  get:    <T>(path: string)                    => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown)    => request<T>('POST',   path, body),
  put:    <T>(path: string, body?: unknown)    => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body?: unknown)    => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                    => request<T>('DELETE', path)
};

export { ApiError };
export default api;
