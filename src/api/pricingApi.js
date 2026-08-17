import { axiosInstance } from './axiosInstance'
import { formatCurrency } from '@/utils/formatCurrency'

/**
 * Full master price list CRUD (§16) lands here in Phase 4. Only the
 * lightweight search used by <ServiceSelector> is defined now. This
 * endpoint must only ever return selling-side fields (§7) — cost/profit
 * belong to a separate, permission-gated endpoint added alongside the
 * Price List feature.
 */
export const pricingApi = {
  searchServices: async (query) => {
    const { data } = await axiosInstance.get('/pricing/services/search', { params: { q: query } })
    // Expected shape: data.data = [{ id, name, sellingPrice, currency }] (envelope — §5)
    return data.data.map((service) => ({
      value: service.id,
      label: service.name,
      meta: { sellingPrice: formatCurrency(service.sellingPrice, service.currency) },
    }))
  },
}
