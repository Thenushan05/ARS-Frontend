import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';

export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  // Required so the backend's httpOnly `ars_refresh_token` cookie is sent/received on every
  // request (brief §15/§16) — the refresh token never touches JS-reachable storage; the backend
  // sets/reads it purely via Set-Cookie/Cookie headers (see Backend AuthController).
  withCredentials: true,
});

// Request Interceptor: attach the in-memory access token (never localStorage — see tokenStore.ts).
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// AuthContext registers this once, at mount, so this module can trigger "clear session + go to
// /login" (brief §17) without importing AuthContext directly — that would be a circular import
// (AuthContext -> authApi -> axiosInstance -> AuthContext).
let onAuthFailure: (() => void) | null = null;
export function registerAuthFailureHandler(handler: () => void): void {
  onAuthFailure = handler;
}

// Raw axios (NOT axiosInstance) so a refresh call never re-enters this same response interceptor.
function requestNewAccessToken(): Promise<string | null> {
  return axios
    .post<{ success: boolean; data: { accessToken: string; accessTokenExpiresIn: string } | null }>(
      `${API_BASE_URL}/auth/refresh`,
      undefined,
      { withCredentials: true },
    )
    .then((res) => res.data?.data?.accessToken ?? null)
    .catch(() => null);
}

/** Called once by AuthContext on app boot to silently restore a session from the refresh cookie,
 * before anything has tried (and failed) a real request yet. Returns whether a session was
 * actually restored. */
export async function attemptSilentRefresh(): Promise<boolean> {
  const token = await requestNewAccessToken();
  if (!token) return false;
  tokenStore.set(token);
  return true;
}

// Response Interceptor: on 401, refresh once — concurrent 401s all await the SAME in-flight
// promise (brief §16's "prevent multiple refresh calls firing simultaneously") — then retry the
// original request(s). If refreshing fails, clear the session and hand off to AuthContext (§17).
let refreshPromise: Promise<string | null> | null = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const url = original?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;

      if (!refreshPromise) {
        refreshPromise = requestNewAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;

      if (newToken) {
        tokenStore.set(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(original);
      }

      tokenStore.set(null);
      onAuthFailure?.();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
