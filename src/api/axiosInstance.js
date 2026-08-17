import axios from 'axios'
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/**
 * The single Axios client for the whole app (§41). Feature API modules
 * (authApi.js, customersApi.js, ...) import this instance — components
 * never call axios directly.
 */
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly refresh-token cookie
  timeout: 30_000,
})

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Broadcast so AuthContext can react to a forced logout (expired session,
 * refresh failure, revoked token) no matter which request triggered it.
 */
const SESSION_EXPIRED_EVENT = 'ars:session-expired'
function emitSessionExpired() {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
}
export function onSessionExpired(handler) {
  window.addEventListener(SESSION_EXPIRED_EVENT, handler)
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
}

// --- Refresh-token flow -----------------------------------------------
// Concurrent 401s while a refresh is in flight all await the SAME promise
// instead of each firing their own /auth/refresh call.
let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axiosInstance
      .post('/auth/refresh')
      .then((response) => {
        // Backend envelope: { success, message, data: { accessToken } } — §5.
        const token = response.data?.data?.accessToken
        setAccessToken(token)
        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const isAuthEndpoint = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh')

    if (response?.status === 401 && !config._retry && !isAuthEndpoint) {
      config._retry = true
      try {
        const token = await refreshAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          return axiosInstance(config)
        }
      } catch {
        // fall through to session-expired handling below
      }
      clearAccessToken()
      emitSessionExpired()
    }

    return Promise.reject(error)
  },
)
