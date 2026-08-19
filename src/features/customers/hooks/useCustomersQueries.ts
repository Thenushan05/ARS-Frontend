import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../../../api/customersApi';
import { queryKeys } from '../../../api/queryKeys';
import { CreateCustomerInput, UpdateCustomerInput, CustomerFilters } from '../../../types/api';

/** TanStack Query hooks for the real Customers API (Phase 2). One file per module, mirroring the
 * `queryKeys` registry and the Leads module's hook shape (`useLeadsQueries.ts`) — see
 * INTEGRATION_PLAN.md. */

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => customersApi.getAll(filters),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customersApi.create(input),
    onSuccess: () => {
      // Broad prefix match ('customers', not 'customers' + exact filters) so every filtered/paged
      // list variant currently cached gets refetched, not just the one this page happens to be on.
      queryClient.invalidateQueries({ queryKey: ['customers'], exact: false });
      // A new registration changes Dashboard's newRegistrations/totalCustomers counts even though
      // this module doesn't own that query — mirrors useConvertLead's cross-module invalidation.
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) => customersApi.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(variables.id) });
    },
  });
}

export function useArchiveCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.archive(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['customers'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
    },
  });
}

export function useRestoreCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['customers'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
    },
  });
}
