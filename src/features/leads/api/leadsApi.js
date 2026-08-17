import { axiosInstance } from '@/api/axiosInstance'

/**
 * §31 Lead Management. Every backend response is enveloped as
 * { success, message, data } (+ pagination when paginated) — see
 * Backend/docs/ARCHITECTURE.md §5 — so every method here unwraps that
 * envelope and hands the rest of the app the plain shape noted in comments.
 */
export const leadsApi = {
  list: async (params) => {
    const { data } = await axiosInstance.get('/leads', { params })
    return { items: data.data, pagination: data.pagination } // [{ id, leadId, name, ... }]
  },

  getById: async (id) => {
    const { data } = await axiosInstance.get(`/leads/${id}`)
    return data.data
  },

  create: async (payload) => {
    const { data } = await axiosInstance.post('/leads', payload)
    return data.data
  },

  update: async (id, payload) => {
    const { data } = await axiosInstance.patch(`/leads/${id}`, payload)
    return data.data
  },

  listFollowUps: async (id, params) => {
    const { data } = await axiosInstance.get(`/leads/${id}/follow-ups`, { params })
    return { items: data.data, pagination: data.pagination }
  },

  addFollowUp: async (id, payload) => {
    const { data } = await axiosInstance.post(`/leads/${id}/follow-ups`, payload)
    return data.data
  },

  convertToCustomer: async (id, payload) => {
    const { data } = await axiosInstance.post(`/leads/${id}/convert`, payload)
    return data.data // { lead, customer, wasExisting }
  },
}
