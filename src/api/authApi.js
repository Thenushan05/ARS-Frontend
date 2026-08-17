import { axiosInstance } from './axiosInstance'

/**
 * Auth endpoints. Shapes are provisional and should be aligned with the
 * backend team, but AuthContext depends only on this module — swapping the
 * request/response mapping here never requires touching components.
 *
 * Expected user shape (drives PermissionContext + role-aware UI):
 *   {
 *     id, name, email, role,          // role: one of constants/roles.js
 *     permissions: string[],          // keys from constants/permissions.js
 *     branch, avatarUrl,
 *     twoFactorEnabled: boolean,
 *   }
 */
// Every backend response is enveloped as { success, message, data } (and
// { ...,  pagination } when paginated) — see Backend/docs/ARCHITECTURE.md §5.
// Each method below unwraps that envelope so the rest of the app keeps
// working with the plain shapes documented in the comments.
export const authApi = {
  login: async ({ email, password, rememberMe }) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password, rememberMe })
    return data.data // { accessToken, user } or { twoFactorRequired: true, challengeToken }
  },

  verifyTwoFactor: async ({ challengeToken, code }) => {
    const { data } = await axiosInstance.post('/auth/2fa/verify', { challengeToken, code })
    return data.data // { accessToken, user }
  },

  refresh: async () => {
    const { data } = await axiosInstance.post('/auth/refresh')
    return data.data // { accessToken }
  },

  logout: async () => {
    await axiosInstance.post('/auth/logout')
  },

  getCurrentUser: async () => {
    const { data } = await axiosInstance.get('/auth/me')
    return data.data // user
  },

  forgotPassword: async ({ email }) => {
    const { data } = await axiosInstance.post('/auth/forgot-password', { email })
    return data.data
  },

  resetPassword: async ({ token, password }) => {
    const { data } = await axiosInstance.post('/auth/reset-password', { token, password })
    return data.data
  },

  getLoginHistory: async () => {
    const { data } = await axiosInstance.get('/auth/login-history')
    return data.data // paginated — data.pagination also available if needed later
  },
}
