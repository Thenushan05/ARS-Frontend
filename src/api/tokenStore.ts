/**
 * In-memory access-token store.
 *
 * Deliberately NOT localStorage/sessionStorage (integration brief §15 — "do not place long-lived
 * sensitive credentials in unsafe client-side storage"). The backend already keeps the long-lived
 * refresh token out of JS's reach entirely, in an httpOnly cookie (`ars_refresh_token`) it sets
 * itself — the frontend never sees that token's value. The short-lived (15m) access token held
 * here only needs to survive for the current tab's lifetime; losing it on a hard refresh is fine
 * because `AuthContext` silently calls `POST /auth/refresh` on boot to mint a new one from the
 * cookie (see axiosInstance.ts's `attemptSilentRefresh`).
 */
let accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
};
