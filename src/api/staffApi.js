import { axiosInstance } from './axiosInstance'
import { ROLE_LABELS } from '@/constants/roles'

/**
 * Full staff management (§28) lands here in Phase 6. Only the lightweight
 * search used by <StaffSelector> (assigning a consultant to a lead/case/task)
 * is defined now.
 */
export const staffApi = {
  search: async (query, { role } = {}) => {
    const { data } = await axiosInstance.get('/staff/search', { params: { q: query, role } })
    // Expected shape: data.data = [{ id, name, role }] (envelope — §5)
    return data.data.map((staff) => ({
      value: staff.id,
      label: staff.name,
      meta: { roleLabel: ROLE_LABELS[staff.role] ?? staff.role },
    }))
  },
}
