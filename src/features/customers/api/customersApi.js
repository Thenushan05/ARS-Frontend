import { axiosInstance } from '@/api/axiosInstance'

/**
 * §9/§10 Customer Management — full CRUD. Same centralized-API pattern as
 * every other feature (§5, §41, Backend/docs/ARCHITECTURE.md §5): this is
 * the ONLY place that calls axios for customers — pages/components go
 * through here via TanStack Query, never axios directly. The lightweight
 * `search()` used by the shared <CustomerSelector> lives separately in
 * src/api/customersApi.js (existed since Phase 1); this file is additive,
 * not a replacement.
 *
 * Every backend response is enveloped as { success, message, data } (+
 * pagination when paginated) — unwrapped here, same as leadsApi.js.
 */
export const customersApi = {
  list: async (params) => {
    const { data } = await axiosInstance.get('/customers', { params })
    return { items: data.data, pagination: data.pagination }
  },

  getById: async (id) => {
    const { data } = await axiosInstance.get(`/customers/${id}`)
    return data.data
  },

  create: async (payload) => {
    const { data } = await axiosInstance.post('/customers', payload)
    return data.data
  },

  update: async (id, payload) => {
    const { data } = await axiosInstance.patch(`/customers/${id}`, payload)
    return data.data
  },

  archive: async (id) => {
    const { data } = await axiosInstance.patch(`/customers/${id}/archive`)
    return data.data
  },

  restore: async (id) => {
    const { data } = await axiosInstance.patch(`/customers/${id}/restore`)
    return data.data
  },

  getActivity: async (id, params) => {
    const { data } = await axiosInstance.get(`/customers/${id}/activity`, { params })
    return { items: data.data, pagination: data.pagination }
  },
}
