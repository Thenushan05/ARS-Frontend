import { axiosInstance } from './axiosInstance'

/**
 * Full dashboard (§8) — customer/visa KPIs, finance KPIs, follow-up KPIs,
 * and all charts — is a Phase 2 feature. `getSummary` is defined now only
 * so DashboardPage can demonstrate the real loading/error/success cycle
 * (§44) against the eventual REST contract instead of showing fake numbers.
 */
export const dashboardApi = {
  getSummary: async ({ from, to } = {}) => {
    const { data } = await axiosInstance.get('/dashboard/summary', { params: { from, to } })
    return data.data // envelope-unwrapped — Backend/docs/ARCHITECTURE.md §5
  },
}
