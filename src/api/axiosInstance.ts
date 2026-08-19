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

// Single shared in-flight refresh promise, reused by EVERY caller (401 retries below, AND the
// boot-time silent refresh) — not just concurrent 401s. The backend's refresh token is single-use
// (rotates on every call); two independent callers racing with the same starting cookie means
// whichever loses the race gets a "token already used" error even though the other succeeded. This
// bit us for real: React StrictMode double-invokes effects in dev, so AuthContext's mount effect
// fired `attemptSilentRefresh()` twice concurrently, and the surviving (non-cleaned-up) effect
// instance was the one that lost the race — the user was silently bounced back to /login on every
// hard navigation despite the session actually being valid. Coalescing every call through the same
// promise means only one HTTP request ever goes out no matter how many callers ask at once.
let refreshPromise: Promise<string | null> | null = null;
function getOrCreateRefreshPromise(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/** Called by AuthContext on app boot to silently restore a session from the refresh cookie, before
 * anything has tried (and failed) a real request yet. Returns whether a session was restored. */
export async function attemptSilentRefresh(): Promise<boolean> {
  const token = await getOrCreateRefreshPromise();
  if (!token) return false;
  tokenStore.set(token);
  return true;
}

// Response Interceptor: on 401, refresh once — concurrent 401s (and any concurrent boot-time
// silent refresh) all await the SAME in-flight promise (brief §16's "prevent multiple refresh
// calls firing simultaneously") — then retry the original request(s). If refreshing fails, clear
// the session and hand off to AuthContext (§17).
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const url = original?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;

      const newToken = await getOrCreateRefreshPromise();

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
