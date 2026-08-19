import axiosInstance from './axiosInstance';
import { PaginatedEnvelope } from './envelope';

/** Minimal read-only slice of the Staff module (full CRUD is Phase 6 — see INTEGRATION_PLAN.md).
 * Needed now only to populate "assign to staff" pickers in Leads/Customers/Tasks/Appointments. */
export interface StaffOption {
  id: string;
  fullName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export const staffApi = {
  /** `GET /users`, permission `staff.view`. Fetches a generously-sized single page — Phase 6 will
   * replace this with a proper paginated Staff module; this is a lookup-list shim until then. */
  async getAll(): Promise<StaffOption[]> {
    const res = await axiosInstance.get<PaginatedEnvelope<StaffOption>>('/users', {
      params: { limit: 100, status: 'ACTIVE' },
    });
    return res.data.data;
  },
};
