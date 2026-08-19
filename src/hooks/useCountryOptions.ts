import { useQuery } from '@tanstack/react-query';
import { countriesApi } from '../api/countriesApi';
import { useAuth } from '../context/AuthContext';

/** Shared "country" picker data source for Leads/Customers (Phase 2) — disabled entirely for a
 * caller without `country.view`, same reasoning as useStaffOptions. */
export function useCountryOptions() {
  const { hasPermission } = useAuth();
  const enabled = hasPermission('country.view');

  const query = useQuery({
    queryKey: ['countries', 'options'],
    queryFn: countriesApi.getAll,
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  return { ...query, options: query.data ?? [], enabled };
}
