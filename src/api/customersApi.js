import { axiosInstance } from './axiosInstance'

/**
 * Full CRUD (registration, profile, financial tab, etc. — §9, §10) lands
 * here in Phase 2. Only the lightweight search used by <CustomerSelector>
 * is defined now so the Phase 1 component library has something real to
 * call against once the backend exists.
 */
export const customersApi = {
  search: async (query) => {
    const { data } = await axiosInstance.get('/customers/search', { params: { q: query } })
    // Expected shape: data.data = [{ id, customerId, fullName, mobile }] (envelope — §5)
    return data.data.map((customer) => ({
      value: customer.id,
      label: customer.fullName,
      meta: { customerId: customer.customerId },
    }))
  },
}
