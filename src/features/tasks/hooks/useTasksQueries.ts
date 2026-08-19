import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../../api/tasksApi';
import { queryKeys } from '../../../api/queryKeys';
import { CreateTaskInput, UpdateTaskInput, TaskFilters } from '../../../types/api';

/** TanStack Query hooks for the real Tasks API (Phase 2). One file per module, mirroring the
 * `queryKeys` registry and the `features/leads/hooks/useLeadsQueries.ts` convention. */

export function useTasks(filters: TaskFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => tasksApi.getAll(filters),
    // Optional `enabled` so a caller without `task.view` can skip firing a doomed request
    // entirely (e.g. TasksPage's top-level permission gate) rather than eating a 403.
    enabled: options?.enabled,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: () => {
      // Broad prefix match ('tasks', not 'tasks' + exact filters) so every filtered/paged list
      // variant currently cached gets refetched, not just the one this page happens to be on.
      // Deliberately NOT invalidating ['dashboard'] — its aggregation never queries the `task`
      // table (see INTEGRATION_PLAN.md backend audit), so that would be a no-op cache-bust.
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => tasksApi.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
    },
  });
}

/** Bare POST, no request body (see `tasksApi.complete`) — the mutation input is just the task id. */
export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.complete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
    },
  });
}

/** Bare POST, no request body (see `tasksApi.cancel`) — the mutation input is just the task id. */
export function useCancelTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.cancel(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
    },
  });
}
