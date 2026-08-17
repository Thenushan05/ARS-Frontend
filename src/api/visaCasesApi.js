import { axiosInstance } from './axiosInstance'

/**
 * Full case CRUD + status timeline (§11, §12) lands here in Phase 3. Only
 * the lightweight search used by <CaseSelector> is defined now.
 */
export const visaCasesApi = {
  search: async (query, { customerId } = {}) => {
    const { data } = await axiosInstance.get('/visa-cases/search', { params: { q: query, customerId } })
    // Expected shape: data.data = [{ id, caseId, country, visaCategory }] (envelope — §5)
    return data.data.map((visaCase) => ({
      value: visaCase.id,
      label: visaCase.caseId,
      meta: { country: visaCase.country },
    }))
  },
}
