import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../../api/dashboardApi';
import { queryKeys } from '../../../api/queryKeys';
import { DashboardFilters } from '../../../types/api';

/** TanStack Query hook for the real Dashboard API (Phase 2) — mirrors the one-file-per-module
 * convention in `features/leads/hooks/useLeadsQueries.ts`. */
export function useDashboard(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard(filters),
    queryFn: () => dashboardApi.get(filters),
  });
}
