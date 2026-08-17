/**
 * In-memory access-token store.
 *
 * The access token is kept in memory only (never localStorage/sessionStorage)
 * to limit exposure to XSS. The refresh token is expected to live in an
 * httpOnly, secure cookie set by the backend — the frontend never reads or
 * stores it directly; axiosInstance just calls /auth/refresh with
 * `withCredentials: true` and the browser attaches the cookie.
 *
 * On a full page reload the in-memory token is gone by design; AuthContext
 * calls /auth/refresh once on app boot to silently re-establish a session
 * from the refresh cookie, same as the 401 recovery path below.
 */
let accessToken = null
const listeners = new Set()

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = token
  listeners.forEach((listener) => listener(token))
}

export function clearAccessToken() {
  setAccessToken(null)
}

/** Lets AuthContext react to token changes triggered from inside axios interceptors. */
export function onAccessTokenChange(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
