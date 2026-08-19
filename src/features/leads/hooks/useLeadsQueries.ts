import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../../../api/leadsApi';
import { queryKeys } from '../../../api/queryKeys';
import { CreateLeadInput, UpdateLeadInput, ConvertLeadInput, LeadFilters } from '../../../types/api';

/** TanStack Query hooks for the real Leads API (Phase 2). One file per module, mirroring the
 * `queryKeys` registry — see INTEGRATION_PLAN.md. */

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => leadsApi.getAll(filters),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeadInput) => leadsApi.create(input),
    onSuccess: () => {
      // Broad prefix match ('leads', not 'leads' + exact filters) so every filtered/paged list
      // variant currently cached gets refetched, not just the one this page happens to be on.
      queryClient.invalidateQueries({ queryKey: ['leads'], exact: false });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeadInput }) => leadsApi.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
    },
  });
}

export function useArchiveLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.archive(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['leads'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(id) });
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: ConvertLeadInput }) => leadsApi.convert(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) });
      // Conversion creates a real Customer row and changes Dashboard's newRegistrations count —
      // invalidate both broadly (predicate on the key prefix, not a specific filter/id shape)
      // even though this module doesn't own either query.
      queryClient.invalidateQueries({ queryKey: ['customers'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
    },
  });
}
