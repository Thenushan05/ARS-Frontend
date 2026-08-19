import { useMutation, useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../../../api/appointmentsApi';
import { queryKeys } from '../../../api/queryKeys';
import { CreateAppointmentInput, UpdateAppointmentInput, AppointmentFilters } from '../../../types/api';

/** TanStack Query hooks for the real Appointments API (Phase 2). Mirrors useLeadsQueries.ts. */

export function useAppointments(filters: AppointmentFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: () => appointmentsApi.getAll(filters),
    enabled: options.enabled,
  });
}

/** Every mutation below invalidates the same three things: the appointments list broadly (every
 * filtered/paged variant currently cached, not just this page's own filter shape), the single
 * detail entry (when an id is known), and `['dashboard']` broadly — the real Dashboard backend
 * computes `followUp.appointmentsToday` as a direct `appointment.count({scheduledAt: today range})`,
 * so any create/reschedule/cancel here can change that number even though this module doesn't own
 * the dashboard query (opposite of Tasks, which does NOT need to invalidate dashboard). */
function invalidateAppointments(queryClient: QueryClient, id?: string) {
  queryClient.invalidateQueries({ queryKey: ['appointments'], exact: false });
  if (id) queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(id) });
  queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => appointmentsApi.create(input),
    onSuccess: () => invalidateAppointments(queryClient),
  });
}

/** NOTE: if `input.scheduledAt` is included, the backend silently sets `status` to RESCHEDULED
 * itself — never send a manual `status` alongside a `scheduledAt` change here, just let the
 * refetched data reflect whatever the backend decided. */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAppointmentInput }) => appointmentsApi.update(id, input),
    onSuccess: (_data, variables) => invalidateAppointments(queryClient, variables.id),
  });
}

/** Bare POST — no request body. */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.complete(id),
    onSuccess: (_data, id) => invalidateAppointments(queryClient, id),
  });
}

/** Bare POST — no request body. */
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onSuccess: (_data, id) => invalidateAppointments(queryClient, id),
  });
}

/** Bare POST — no request body. */
export function useNoShowAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.noShow(id),
    onSuccess: (_data, id) => invalidateAppointments(queryClient, id),
  });
}
