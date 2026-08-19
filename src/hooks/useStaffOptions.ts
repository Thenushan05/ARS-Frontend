import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../api/staffApi';
import { useAuth } from '../context/AuthContext';

/** Shared "assign to staff" picker data source for Leads/Customers/Tasks/Appointments (Phase 2) —
 * one lookup instead of each module re-fetching. Disabled (no request at all) for a caller without
 * `staff.view`, since the endpoint would just 403 — the consuming form should fall back to a
 * plain read-only display of whatever staff name the record already carries in that case. */
export function useStaffOptions() {
  const { hasPermission } = useAuth();
  const enabled = hasPermission('staff.view');

  const query = useQuery({
    queryKey: ['staff', 'options'],
    queryFn: staffApi.getAll,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, options: query.data ?? [], enabled };
}
